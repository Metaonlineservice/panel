import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { I18nProvider } from './context/I18nContext'
import { PublicShell } from './components/PublicShell'
import { LandingPage } from './pages/public/LandingPage'
import { AboutPage } from './pages/public/AboutPage'
import { ServicesPage } from './pages/public/ServicesPage'
import { CountriesPage } from './pages/public/CountriesPage'
import { CountryDetailPage } from './pages/public/CountryDetailPage'
import { ContactPage } from './pages/public/ContactPage'
import { LoginPage, SignupPage, AdminLoginPage } from './pages/auth/AuthPages'
import { DashboardShell } from './components/DashboardShell'
import { OverviewPage } from './pages/applicant/OverviewPage'
import { ApplicationsPage } from './pages/applicant/ApplicationsPage'
import { DocumentsPage } from './pages/applicant/DocumentsPage'
import { MessagesPage } from './pages/applicant/MessagesPage'
import { PaymentsPage } from './pages/applicant/PaymentsPage'
import { ProfilePage } from './pages/applicant/ProfilePage'
import { AdminShell } from './components/AdminShell'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminApplicants } from './pages/admin/AdminApplicants'
import { AdminApplications } from './pages/admin/AdminApplications'
import { AdminRequirements } from './pages/admin/AdminRequirements'
import { AdminTemplates } from './pages/admin/AdminTemplates'
import { AdminAnalytics } from './pages/admin/AdminAnalytics'

function Protected({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { loading, role } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-navy-500">Loading…</div>
  if (!role) return <Navigate to={roles.includes('admin') || roles.includes('agent') ? '/admin/login' : '/login'} replace />
  if (!roles.includes(role)) return <Navigate to={role === 'admin' || role === 'agent' ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicShell />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/countries" element={<CountriesPage />} />
                <Route path="/countries/:country" element={<CountryDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              <Route path="/dashboard" element={<Protected roles={['applicant']}><DashboardShell /></Protected>}>
                <Route index element={<OverviewPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route path="/admin" element={<Protected roles={['admin', 'agent']}><AdminShell /></Protected>}>
                <Route index element={<AdminDashboard />} />
                <Route path="applicants" element={<AdminApplicants />} />
                <Route path="applications" element={<AdminApplications />} />
                <Route path="requirements" element={<AdminRequirements />} />
                <Route path="templates" element={<AdminTemplates />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
