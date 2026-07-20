import * as XLSX from 'xlsx'
import { writeFileSync } from 'fs'

interface SheetSpec {
  name: string
  headers: string[]
  rows: (string | number)[][]
}

const sheets: SheetSpec[] = [
  {
    name: 'Applicants',
    headers: ['id', 'full_name', 'email', 'password_hash', 'phone', 'country', 'nationality', 'passport_number', 'date_of_birth', 'created_at', 'status', 'role'],
    rows: [
      ['APP_1001', 'Sarah Mitchell', 'sarah.mitchell@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', '+1-415-555-0101', 'United States', 'American', 'P12345678', '1990-05-14', '2025-01-15T10:30:00Z', 'active', 'applicant'],
      ['APP_1002', 'Liam OConnor', 'liam.oconnor@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', '+353-1-555-0142', 'Ireland', 'Irish', 'X98765432', '1988-11-22', '2025-01-18T14:15:00Z', 'active', 'applicant'],
      ['APP_1003', 'Aiko Tanaka', 'aiko.tanaka@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', '+81-3-5555-0100', 'Japan', 'Japanese', 'JP4567890', '1995-03-08', '2025-02-01T09:00:00Z', 'active', 'applicant'],
      ['APP_1004', 'Carlos Mendez', 'carlos.mendez@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', '+34-91-555-0123', 'Spain', 'Spanish', 'ES1234567S', '1992-07-30', '2025-02-10T16:45:00Z', 'active', 'applicant'],
      ['APP_1005', 'Priya Sharma', 'priya.sharma@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', '+91-22-5555-0199', 'India', 'Indian', 'T8765432', '1993-12-15', '2025-02-20T11:20:00Z', 'active', 'applicant'],
    ],
  },
  {
    name: 'Visa Applications',
    headers: ['application_id', 'applicant_id', 'visa_country', 'visa_type', 'status', 'assigned_agent', 'priority', 'created_at', 'updated_at', 'notes'],
    rows: [
      ['VISA_2001', 'APP_1001', 'Canada', 'Tourist', 'In Review', 'Agent Smith', 'Normal', '2025-01-16T08:00:00Z', '2025-01-20T12:00:00Z', 'Family vacation planned for June'],
      ['VISA_2002', 'APP_1002', 'United Kingdom', 'Business', 'Approved', 'Agent Johnson', 'High', '2025-01-19T10:30:00Z', '2025-01-25T15:30:00Z', 'Attending tech conference in London'],
      ['VISA_2003', 'APP_1003', 'Australia', 'Student', 'Submitted', 'Agent Brown', 'Normal', '2025-02-02T09:15:00Z', '2025-02-02T09:15:00Z', 'Masters program at University of Melbourne'],
      ['VISA_2004', 'APP_1004', 'United States', 'Work', 'In Review', 'Agent Davis', 'Urgent', '2025-02-11T14:00:00Z', '2025-02-18T10:00:00Z', 'H1B visa for software engineer role'],
      ['VISA_2005', 'APP_1005', 'Germany', 'Family', 'Rejected', 'Agent Wilson', 'Normal', '2025-02-21T13:45:00Z', '2025-03-01T09:30:00Z', 'Family reunion - missing birth certificate'],
    ],
  },
  {
    name: 'Visa Requirements',
    headers: ['country', 'visa_type', 'documents', 'processing_time', 'fees', 'eligibility', 'steps', 'embassy_information'],
    rows: [
      ['Canada', 'Tourist', 'Valid passport (6+ months), Passport photo, Bank statements (3 months), Travel itinerary, Hotel reservation', '15-30 business days', 'CAD $100', 'Valid passport, Sufficient funds, Clean criminal record, Return ticket', '1. Gather documents\n2. Apply online or at visa center\n3. Pay fees\n4. Attend biometrics appointment\n5. Wait for decision', 'Embassy of Canada, 490 Sussex Drive, Ottawa. Website: canada.ca/immigration'],
      ['United Kingdom', 'Business', 'Valid passport, Invitation letter from UK company, Bank statements (6 months), Employment letter', '10-15 business days', 'GBP £115', 'Valid passport, Business purpose documentation, Sufficient funds, Intention to return', '1. Complete online application\n2. Upload documents\n3. Pay visa fee\n4. Book appointment\n5. Attend visa center', 'UK Visas and Immigration, Westminster, London. Website: gov.uk/visas-immigration'],
      ['Australia', 'Student', 'Valid passport, CoE (Confirmation of Enrolment), OSHC health insurance, Financial evidence, English test results', '4-6 weeks', 'AUD $620', 'Accepted into Australian institution, Sufficient funds, Health insurance, English proficiency', '1. Get university admission\n2. Obtain CoE\n3. Apply online via ImmiAccount\n4. Health checkup\n5. Biometrics\n6. Receive visa', 'Department of Home Affairs, Canberra. Website: homeaffairs.gov.au'],
      ['United States', 'Work', 'Valid passport, Job offer letter, Labor certification, Education credentials, Work experience letters', '3-6 months', 'USD $190', 'Approved job offer, Labor certification, Qualifications match position, Employer petition approved', '1. Employer files petition\n2. Wait for approval\n3. Complete DS-160\n4. Pay fees\n5. Schedule interview\n6. Attend embassy interview', 'US Embassy, 3500 International Drive NW, Washington DC. Website: travel.state.gov'],
      ['Germany', 'Family', 'Valid passport, Marriage/birth certificates, Proof of accommodation, Health insurance, Financial proof', '8-12 weeks', 'EUR €75', 'Family member in Germany, Valid relationship proof, Sufficient living space, Health insurance', '1. Gather family documents\n2. Apply at German embassy\n3. Provide biometrics\n4. Wait for processing\n5. Collect visa', 'German Embassy, 4645 Reservoir Road NW, Washington DC. Website: germany.info'],
    ],
  },
  {
    name: 'Documents',
    headers: ['document_id', 'applicant_id', 'document_name', 'file_url', 'verification_status', 'uploaded_at'],
    rows: [
      ['DOC_3001', 'APP_1001', 'Passport Scan.pdf', 'https://drive.google.com/file/d/1abc123/view', 'Verified', '2025-01-16T08:05:00Z'],
      ['DOC_3002', 'APP_1001', 'Bank Statement Jan 2025.pdf', 'https://drive.google.com/file/d/1def456/view', 'Pending', '2025-01-16T08:10:00Z'],
      ['DOC_3003', 'APP_1002', 'Business Invitation Letter.pdf', 'https://drive.google.com/file/d/1ghi789/view', 'Verified', '2025-01-19T10:35:00Z'],
      ['DOC_3004', 'APP_1003', 'University Enrollment Certificate.pdf', 'https://drive.google.com/file/d/1jkl012/view', 'Verified', '2025-02-02T09:20:00Z'],
      ['DOC_3005', 'APP_1004', 'Employment Contract.pdf', 'https://drive.google.com/file/d/1mno345/view', 'Rejected', '2025-02-11T14:05:00Z'],
    ],
  },
  {
    name: 'Payments',
    headers: ['payment_id', 'applicant_id', 'amount', 'currency', 'status', 'date', 'invoice_number', 'application_id'],
    rows: [
      ['PAY_4001', 'APP_1001', 100, 'CAD', 'Paid', '2025-01-16T08:15:00Z', 'INV-2025-001', 'VISA_2001'],
      ['PAY_4002', 'APP_1002', 115, 'GBP', 'Paid', '2025-01-19T10:40:00Z', 'INV-2025-002', 'VISA_2002'],
      ['PAY_4003', 'APP_1003', 620, 'AUD', 'Paid', '2025-02-02T09:25:00Z', 'INV-2025-003', 'VISA_2003'],
      ['PAY_4004', 'APP_1004', 190, 'USD', 'Pending', '2025-02-11T14:10:00Z', 'INV-2025-004', 'VISA_2004'],
      ['PAY_4005', 'APP_1005', 75, 'EUR', 'Refunded', '2025-02-21T13:50:00Z', 'INV-2025-005', 'VISA_2005'],
    ],
  },
  {
    name: 'Email Templates',
    headers: ['template_id', 'name', 'subject', 'html_body'],
    rows: [
      ['TPL_5001', 'Welcome', 'Welcome to META ONLINE SERVICE', '<h2>Welcome, {{full_name}}!</h2><p>Your META ONLINE SERVICE account has been created successfully. You can now apply for visas worldwide from your dashboard.</p><p><a href="{{login_url}}">Click here to log in</a></p>'],
      ['TPL_5002', 'Application Submitted', 'Your visa application has been submitted', '<h2>Hi {{full_name}},</h2><p>Your {{visa_type}} visa application for {{visa_country}} has been received and is now under review.</p><p>Application ID: {{application_id}}</p><p>We will notify you of any updates.</p>'],
      ['TPL_5003', 'Status Update', 'Update on your visa application', '<h2>Hi {{full_name}},</h2><p>The status of your {{visa_type}} visa application for {{visa_country}} has changed to: <strong>{{status}}</strong>.</p><p>{{note}}</p>'],
      ['TPL_5004', 'Document Verified', 'Your document has been verified', '<h2>Hi {{full_name}},</h2><p>Your document "{{document_name}}" has been verified successfully.</p>'],
      ['TPL_5005', 'Payment Confirmation', 'Payment received', '<h2>Hi {{full_name}},</h2><p>We have received your payment of {{amount}} {{currency}}.</p><p>Invoice: {{invoice_number}}</p><p>Thank you for choosing META ONLINE SERVICE.</p>'],
    ],
  },
  {
    name: 'Messages',
    headers: ['message_id', 'applicant_id', 'sender', 'sender_role', 'subject', 'message', 'date', 'read_by_applicant', 'read_by_admin'],
    rows: [
      ['MSG_6001', 'APP_1001', 'Sarah Mitchell', 'applicant', 'Question about documents', 'Hi, do I need to provide translated bank statements?', '2025-01-17T10:00:00Z', 'true', 'true'],
      ['MSG_6002', 'APP_1001', 'Agent Smith', 'admin', 'Re: Question about documents', 'Yes, please provide certified English translations of your bank statements.', '2025-01-17T14:30:00Z', 'true', 'true'],
      ['MSG_6003', 'APP_1002', 'Liam OConnor', 'applicant', 'Application status', 'Hello, when will I hear back about my business visa?', '2025-01-22T09:15:00Z', 'true', 'true'],
      ['MSG_6004', 'APP_1003', 'Aiko Tanaka', 'applicant', 'Biometrics appointment', 'Where do I go for my biometrics appointment?', '2025-02-05T11:00:00Z', 'true', 'false'],
      ['MSG_6005', 'APP_1004', 'Agent Davis', 'admin', 'Missing documents', 'Your employment contract appears incomplete. Please re-upload all pages.', '2025-02-15T16:20:00Z', 'false', 'true'],
    ],
  },
  {
    name: 'Notifications',
    headers: ['notification_id', 'applicant_id', 'title', 'message', 'read_status', 'created_at', 'type'],
    rows: [
      ['NOT_7001', 'APP_1001', 'Welcome!', 'Welcome to META ONLINE SERVICE. Start your visa application today.', 'true', '2025-01-15T10:30:00Z', 'welcome'],
      ['NOT_7002', 'APP_1001', 'Application Submitted', 'Your Canada Tourist visa application has been submitted successfully.', 'true', '2025-01-16T08:05:00Z', 'application'],
      ['NOT_7003', 'APP_1002', 'Visa Approved', 'Congratulations! Your UK Business visa has been approved.', 'true', '2025-01-25T15:30:00Z', 'status'],
      ['NOT_7004', 'APP_1003', 'Document Verified', 'Your enrollment certificate has been verified.', 'false', '2025-02-03T09:30:00Z', 'document'],
      ['NOT_7005', 'APP_1004', 'Action Required', 'Please re-upload your employment contract with all pages.', 'false', '2025-02-15T16:25:00Z', 'document'],
    ],
  },
  {
    name: 'Application History',
    headers: ['history_id', 'application_id', 'old_status', 'new_status', 'changed_by', 'date', 'note'],
    rows: [
      ['HIST_8001', 'VISA_2001', '', 'Submitted', 'Sarah Mitchell', '2025-01-16T08:00:00Z', 'Application created by applicant'],
      ['HIST_8002', 'VISA_2001', 'Submitted', 'In Review', 'Agent Smith', '2025-01-20T12:00:00Z', 'Application moved to review queue'],
      ['HIST_8003', 'VISA_2002', 'Submitted', 'In Review', 'Agent Johnson', '2025-01-22T10:00:00Z', 'Documents verified, moving to review'],
      ['HIST_8004', 'VISA_2002', 'In Review', 'Approved', 'Agent Johnson', '2025-01-25T15:30:00Z', 'All requirements met, visa approved'],
      ['HIST_8005', 'VISA_2005', 'In Review', 'Rejected', 'Agent Wilson', '2025-03-01T09:30:00Z', 'Missing birth certificate, application rejected'],
    ],
  },
  {
    name: 'Admins',
    headers: ['admin_id', 'full_name', 'email', 'password_hash', 'role', 'created_at', 'last_login', 'status'],
    rows: [
      ['ADM_9001', 'James Carter', 'admin@metaonlineservice.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', 'admin', '2025-01-01T00:00:00Z', '2025-03-01T08:00:00Z', 'active'],
      ['ADM_9002', 'Maria Garcia', 'maria.garcia@metaonlineservice.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', 'agent', '2025-01-05T00:00:00Z', '2025-02-28T09:30:00Z', 'active'],
      ['ADM_9003', 'Robert Chen', 'robert.chen@metaonlineservice.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', 'agent', '2025-01-10T00:00:00Z', '2025-02-27T14:15:00Z', 'active'],
      ['ADM_9004', 'Fatima Al-Rashid', 'fatima.rashid@metaonlineservice.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', 'admin', '2025-01-12T00:00:00Z', '2025-03-02T10:00:00Z', 'active'],
      ['ADM_9005', 'David Okonkwo', 'david.okonkwo@metaonlineservice.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4VjZcJa5', 'agent', '2025-01-20T00:00:00Z', '', 'active'],
    ],
  },
]

const workbook = XLSX.utils.book_new()

for (const sheet of sheets) {
  const aoa = [sheet.headers, ...sheet.rows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)

  const colWidths = sheet.headers.map((h, i) => {
    let max = h.length
    for (const row of sheet.rows) {
      const val = String(row[i] ?? '')
      max = Math.max(max, Math.min(val.length, 60))
    }
    return { wch: Math.max(12, max + 2) }
  })
  ws['!cols'] = colWidths

  ws['!freeze'] = { ySplit: 1 }

  XLSX.utils.book_append_sheet(workbook, ws, sheet.name)
}

const outPath = 'META_Online_Service_Database_Template.xlsx'
XLSX.writeFile(workbook, outPath)
writeFileSync(outPath, XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
console.log(`Generated ${outPath} with ${sheets.length} sheets`)
sheets.forEach(s => console.log(`  - ${s.name}: ${s.headers.length} columns, ${s.rows.length} sample rows`))
