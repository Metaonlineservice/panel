export type VisaStatus =
  | 'Submitted' | 'Under Review' | 'Documents Required' | 'Processing'
  | 'Embassy Submitted' | 'Interview Required' | 'Approved' | 'Rejected' | 'Completed'

export const VISA_STATUSES: VisaStatus[] = [
  'Submitted', 'Under Review', 'Documents Required', 'Processing',
  'Embassy Submitted', 'Interview Required', 'Approved', 'Rejected', 'Completed',
]

export const VISA_TYPES = ['Tourist', 'Business', 'Student', 'Work', 'Family', 'Transit', 'Residency'] as const

export const STATUS_PROGRESS: Record<VisaStatus, number> = {
  'Submitted': 10, 'Under Review': 25, 'Documents Required': 30, 'Processing': 50,
  'Embassy Submitted': 70, 'Interview Required': 75, 'Approved': 95, 'Rejected': 100, 'Completed': 100,
}

export const STATUS_COLORS: Record<VisaStatus, string> = {
  'Submitted': 'bg-navy-100 text-navy-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  'Documents Required': 'bg-amber-100 text-amber-700',
  'Processing': 'bg-indigo-100 text-indigo-700',
  'Embassy Submitted': 'bg-cyan-100 text-cyan-700',
  'Interview Required': 'bg-purple-100 text-purple-700',
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-rose-100 text-rose-700',
  'Completed': 'bg-green-100 text-green-700',
}
