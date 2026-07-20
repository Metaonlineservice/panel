import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders })

  const url = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('VITE_SUPABASE_ANON_KEY') ?? ''
  const bootstrapSecret = Deno.env.get('BOOTSTRAP_ADMIN_SECRET') ?? 'meta-bootstrap-2026'

  try {
    const { secret, email, fullName } = await req.json()
    if (secret !== bootstrapSecret) return json({ error: 'Invalid bootstrap secret' }, 403)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
    const userClient = createClient(url, anonKey, { auth: { persistSession: false } })

    // Look up user by email in auth
    const { data: list, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) return json({ error: listErr.message }, 500)
    const user = (list.users ?? []).find(u => u.email === email)
    if (!user) return json({ error: 'User not found. Sign up first, then bootstrap.' }, 404)

    const { error } = await admin.from('admins').upsert({
      user_id: user.id, full_name: fullName ?? user.email ?? 'Admin', email: user.email ?? '', role: 'admin',
    }, { onConflict: 'user_id' })
    if (error) return json({ error: error.message }, 500)
    return json({ ok: true, email: user.email })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
