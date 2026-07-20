import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface Env {
  url: string
  serviceKey: string
  anonKey: string
}

function admin(env: Env) {
  return createClient(env.url, env.serviceKey, { auth: { persistSession: false } })
}

async function requireAdmin(env: Env, req: Request) {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace('Bearer ', '')
  if (!token || token === env.anonKey) return null
  const userClient = createClient(env.url, env.anonKey, {
    auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return null
  const a = admin(env)
  const { data } = await a.from('admins').select('*').eq('user_id', user.id).maybeSingle()
  return data ? { user, admin: data } : null
}

function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')
}

async function sendNotification(env: Env, userId: string, event: string, vars: Record<string, string>) {
  const a = admin(env)
  const { data: tpl } = await a.from('email_templates').select('*').eq('template_name', event).maybeSingle()
  // In-app notification
  const titles: Record<string, string> = {
    welcome: 'Welcome to META ONLINE SERVICE',
    application_received: 'Application received',
    document_missing: 'Missing documents',
    status_update: 'Application status updated',
    visa_approved: 'Visa approved',
    visa_rejected: 'Visa rejected',
    payment_confirmation: 'Payment confirmed',
  }
  await a.from('notifications').insert({
    user_id: userId,
    title: fillTemplate(tpl?.subject ?? titles[event] ?? event, vars),
    body: vars.note ?? vars.new_status ?? '',
    type: event,
  }).then(() => null, () => null)
  // Email send (best-effort). In production, configure SMTP secrets.
  // If SMTP env is set, send via fetch to an SMTP relay; otherwise log.
  console.log(`[email] event=${event} user=${userId} subject=${tpl?.subject ?? ''}`)
}

const router: Record<string, (env: Env, req: Request, match: URLPatternResult, adminUser: any) => Promise<Response>> = {}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })

  const env: Env = {
    url: Deno.env.get('SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL') ?? '',
    serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    anonKey: Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('VITE_SUPABASE_ANON_KEY') ?? '',
  }
  if (!env.url || !env.serviceKey || !env.anonKey) {
    return json({ error: 'Server misconfigured' }, 500)
  }

  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/admin-api/, '')

  try {
    const adminUser = await requireAdmin(env, req)
    if (!adminUser) return json({ error: 'Unauthorized — admin access required' }, 401)

    const a = admin(env)

    if (path === '/stats' && req.method === 'GET') {
      const [applicants, apps, docs, pays] = await Promise.all([
        a.from('applicants').select('id', { count: 'exact', head: true }),
        a.from('visa_applications').select('current_status, visa_country, application_date'),
        a.from('documents').select('verification_status'),
        a.from('payments').select('amount, currency, payment_status'),
      ])
      const byStatus = new Map<string, number>()
      const byCountry = new Map<string, number>()
      let active = 0, completed = 0
      for (const ap of apps.data ?? []) {
        byStatus.set(ap.current_status, (byStatus.get(ap.current_status) ?? 0) + 1)
        byCountry.set(ap.visa_country, (byCountry.get(ap.visa_country) ?? 0) + 1)
        if (!['Approved', 'Rejected', 'Completed'].includes(ap.current_status)) active++
        if (ap.current_status === 'Completed' || ap.current_status === 'Approved') completed++
      }
      const pendingDocs = (docs.data ?? []).filter(d => d.verification_status === 'Pending').length
      const revenue = (pays.data ?? []).filter(p => p.payment_status === 'Paid').reduce((s, p) => s + Number(p.amount), 0)
      const last7: { date: string; count: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const ds = d.toISOString().slice(0, 10)
        last7.push({ date: ds, count: (apps.data ?? []).filter((ap: any) => ap.application_date?.slice(0, 10) === ds).length })
      }
      return json({
        totalApplicants: applicants.count ?? 0,
        activeApplications: active,
        completedVisas: completed,
        pendingDocuments: pendingDocs,
        revenue, revenueCurrency: 'USD',
        byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })),
        byCountry: Array.from(byCountry.entries()).map(([country, count]) => ({ country, count })).sort((x, y) => y.count - x.count).slice(0, 8),
        last7Days: last7,
      })
    }

    if (path === '/applicants' && req.method === 'GET') {
      const q = url.searchParams.get('q') ?? ''
      let query = a.from('applicants').select('*').order('created_at', { ascending: false })
      if (q) {
        const { data } = await a.from('applicants').select('*').ilike('full_name', `%${q}%`)
        const { data: byEmail } = await a.from('applicants').select('*').ilike('email', `%${q}%`)
        const { data: byCountry } = await a.from('applicants').select('*').ilike('country', `%${q}%`)
        const merged = new Map<string, any>()
        for (const r of [...(data ?? []), ...(byEmail ?? []), ...(byCountry ?? [])]) merged.set(r.id, r)
        const ids = Array.from(merged.keys())
        const { data: apps } = await a.from('visa_applications').select('id, applicant_id, current_status, visa_country, visa_type').in('applicant_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
        const appsByApplicant = new Map<string, any[]>()
        for (const ap of apps ?? []) (appsByApplicant.get(ap.applicant_id) ?? appsByApplicant.set(ap.applicant_id, []).get(ap.applicant_id)!).push(ap)
        return json(Array.from(merged.values()).map(r => ({ ...r, applications: appsByApplicant.get(r.id) ?? [] })))
      }
      const { data } = await query
      const ids = (data ?? []).map(r => r.id)
      const { data: apps } = await a.from('visa_applications').select('id, applicant_id, current_status, visa_country, visa_type').in('applicant_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
      const appsByApplicant = new Map<string, any[]>()
      for (const ap of apps ?? []) (appsByApplicant.get(ap.applicant_id) ?? appsByApplicant.set(ap.applicant_id, []).get(ap.applicant_id)!).push(ap)
      return json((data ?? []).map(r => ({ ...r, applications: appsByApplicant.get(r.id) ?? [] })))
    }

    const applicantMatch = path.match(/^\/applicants\/([^/]+)$/)
    if (applicantMatch) {
      const id = applicantMatch[1]
      if (req.method === 'GET') {
        const { data } = await a.from('applicants').select('*').eq('id', id).maybeSingle()
        const { data: apps } = await a.from('visa_applications').select('id, current_status, visa_country, visa_type').eq('applicant_id', id)
        return json({ ...data, applications: apps ?? [] })
      }
      if (req.method === 'PATCH') {
        const patch = await req.json()
        const { data } = await a.from('applicants').update(patch).eq('id', id).select().single()
        return json(data)
      }
    }

    if (path === '/applications' && req.method === 'GET') {
      const q = url.searchParams.get('q') ?? ''
      const { data: apps } = await a.from('visa_applications').select('*').order('last_update', { ascending: false })
      const applicantIds = Array.from(new Set((apps ?? []).map((x: any) => x.applicant_id)))
      const { data: applicants } = await a.from('applicants').select('id, full_name, email').in('id', applicantIds.length ? applicantIds : ['00000000-0000-0000-0000-000000000000'])
      const map = new Map(applicants?.map((x: any) => [x.id, x]))
      let rows = (apps ?? []).map((x: any) => ({ ...x, applicant_name: map.get(x.applicant_id)?.full_name, applicant_email: map.get(x.applicant_id)?.email }))
      if (q) {
        const ql = q.toLowerCase()
        rows = rows.filter(r => r.application_code?.toLowerCase().includes(ql) || r.visa_country?.toLowerCase().includes(ql) || r.applicant_name?.toLowerCase().includes(ql) || r.applicant_email?.toLowerCase().includes(ql))
      }
      return json(rows)
    }

    const statusMatch = path.match(/^\/applications\/([^/]+)\/status$/)
    if (statusMatch && req.method === 'POST') {
      const id = statusMatch[1]
      const { status, note, agent, priority } = await req.json()
      const { data: app } = await a.from('visa_applications').select('*').eq('id', id).maybeSingle()
      if (!app) return json({ error: 'Application not found' }, 404)
      const prev = app.current_status
      await a.from('visa_applications').update({
        current_status: status, assigned_agent: agent ?? app.assigned_agent,
        priority: priority ?? app.priority, last_update: new Date().toISOString(),
        notes: note ?? app.notes,
      }).eq('id', id)
      await a.from('application_history').insert({
        application_id: id, user_id: adminUser.user.id, previous_status: prev,
        new_status: status, changed_by: adminUser.admin.full_name, note: note ?? null,
      })
      const event = status === 'Approved' ? 'visa_approved' : status === 'Rejected' ? 'visa_rejected' : 'status_update'
      await sendNotification(env, app.user_id, event, {
        application_code: app.application_code,
        visa_country: app.visa_country, visa_type: app.visa_type,
        previous_status: prev ?? '', new_status: status, note: note ?? '',
      })
      return json({ ok: true })
    }

    const messagesMatch = path.match(/^\/messages\/([^/]+)$/)
    if (messagesMatch && req.method === 'GET') {
      const applicantId = messagesMatch[1]
      const { data } = await a.from('messages').select('*').eq('applicant_id', applicantId).order('created_at', { ascending: true })
      return json(data ?? [])
    }
    const replyMatch = path.match(/^\/messages\/([^/]+)\/reply$/)
    if (replyMatch && req.method === 'POST') {
      const applicantId = replyMatch[1]
      const { body, subject } = await req.json()
      const { data: app } = await a.from('applicants').select('user_id, full_name').eq('id', applicantId).maybeSingle()
      if (!app) return json({ error: 'Applicant not found' }, 404)
      const { data } = await a.from('messages').insert({
        applicant_id: applicantId, user_id: app.user_id, sender: adminUser.admin.full_name,
        sender_role: 'admin', subject: subject ?? null, body, read_by_applicant: false, read_by_admin: true,
      }).select().single()
      await a.from('notifications').insert({ user_id: app.user_id, title: 'New message from your agent', body, type: 'message' }).then(() => null, () => null)
      return json(data)
    }

    if (path === '/requirements' && req.method === 'GET') {
      const { data } = await a.from('visa_requirements').select('*').order('country', { ascending: true })
      return json(data ?? [])
    }
    if (path === '/requirements' && req.method === 'POST') {
      const row = await req.json()
      if (row.id) {
        const { id, ...patch } = row
        const { data } = await a.from('visa_requirements').update(patch).eq('id', id).select().single()
        return json(data)
      }
      const { data } = await a.from('visa_requirements').upsert(row, { onConflict: 'country,visa_type' }).select().single()
      return json(data)
    }
    const reqMatch = path.match(/^\/requirements\/([^/]+)$/)
    if (reqMatch && req.method === 'DELETE') {
      await a.from('visa_requirements').delete().eq('id', reqMatch[1])
      return json({ ok: true })
    }

    if (path === '/templates' && req.method === 'GET') {
      const { data } = await a.from('email_templates').select('*').order('template_name', { ascending: true })
      return json(data ?? [])
    }
    if (path === '/templates' && req.method === 'PATCH') {
      const { template_name, subject, email_body } = await req.json()
      const { data } = await a.from('email_templates').update({ subject, email_body }).eq('template_name', template_name).select().single()
      return json(data)
    }

    if (path === '/export' && req.method === 'GET') {
      const { data: apps } = await a.from('visa_applications').select('application_code, visa_country, visa_type, current_status, priority, application_date, last_update')
      const header = 'Code,Country,Visa Type,Status,Priority,Application Date,Last Update\n'
      const rows = (apps ?? []).map((x: any) => [x.application_code, x.visa_country, x.visa_type, x.current_status, x.priority, x.application_date, x.last_update].join(',')).join('\n')
      const csv = header + rows
      const blob = encodeURIComponent(csv)
      return json({ url: `data:text/csv;charset=utf-8,${blob}` })
    }

    return json({ error: 'Not found', path }, 404)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
