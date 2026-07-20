import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'fa' | 'ar'

type Dict = Record<string, string>

const en: Dict = {
  brand: 'META ONLINE SERVICE',
  tagline: 'Your Trusted Global Visa Processing Partner',
  'nav.home': 'Home', 'nav.about': 'About', 'nav.services': 'Services',
  'nav.countries': 'Countries', 'nav.contact': 'Contact',
  'nav.login': 'Applicant Login', 'nav.admin': 'Admin Login',
  'countries.title': 'Countries', 'countries.subtitle': 'Browse visa requirements for 150+ destinations worldwide.',
  'hero.title': 'Your Trusted Global Visa Processing Partner',
  'hero.subtitle': 'Apply, track, and manage visa applications for every country — all in one secure, professional platform.',
  'hero.cta': 'Start your application', 'hero.secondary': 'Explore countries',
  'features.title': 'Why choose META ONLINE SERVICE',
  'features.experts': 'Expert visa consultants',
  'features.experts.desc': 'A dedicated team guiding you through every step of the process.',
  'features.global': 'Global visa support',
  'features.global.desc': 'Requirements for 150+ countries and every visa type.',
  'features.secure': 'Secure application tracking',
  'features.secure.desc': 'Real-time status updates with bank-grade security.',
  'features.fast': 'Fast processing',
  'features.fast.desc': 'Streamlined workflows that keep your application moving.',
  'cta.title': 'Ready to begin your visa journey?',
  'cta.subtitle': 'Create your account in minutes and submit your first application today.',
  'cta.button': 'Create account',
  'footer.rights': 'All rights reserved.',
  'auth.login': 'Sign in', 'auth.signup': 'Create account',
  'auth.email': 'Email', 'auth.password': 'Password',
  'auth.fullname': 'Full name', 'auth.phone': 'Phone',
  'auth.country': 'Country of residence', 'auth.nationality': 'Nationality',
  'auth.dob': 'Date of birth',
  'auth.haveAccount': 'Already have an account? Sign in',
  'auth.noAccount': "Don't have an account? Sign up",
  'auth.adminLogin': 'Admin sign in',
  'auth.adminHint': 'Restricted area — administrators only.',
  'auth.logout': 'Sign out',
  'dash.overview': 'Overview', 'dash.applications': 'My Visa Applications',
  'dash.documents': 'Documents', 'dash.messages': 'Messages', 'dash.profile': 'Profile',
  'dash.payments': 'Payments',
  'dash.newApplication': 'New application', 'dash.logout': 'Sign out',
  'dash.welcome': 'Welcome back',
  'dash.status': 'Status', 'dash.destination': 'Destination', 'dash.progress': 'Progress',
  'dash.nextAction': 'Next action', 'dash.recentUpdates': 'Recent updates',
  'dash.noApplications': 'No applications yet. Start your first one.',
  'dash.upload': 'Upload document', 'dash.checklist': 'Document checklist',
  'dash.verification': 'Verification', 'dash.send': 'Send message',
  'dash.noMessages': 'No messages yet. Start the conversation.',
  'dash.invoice': 'Invoice',
  'admin.dash': 'Dashboard', 'admin.applicants': 'Applicants',
  'admin.applications': 'Applications', 'admin.requirements': 'Visa Requirements',
  'admin.templates': 'Email Templates', 'admin.analytics': 'Analytics',
  'admin.totalApplicants': 'Total applicants', 'admin.activeApps': 'Active applications',
  'admin.completed': 'Completed visas', 'admin.pendingDocs': 'Pending documents',
  'admin.revenue': 'Revenue',
}

const fa: Dict = {
  brand: 'متا آنلاین سرویس',
  tagline: 'مورد اعتماد شما در پردازش جهانی ویزا',
  'nav.home': 'خانه', 'nav.about': 'درباره ما', 'nav.services': 'خدمات',
  'nav.countries': 'کشورها', 'nav.contact': 'تماس',
  'nav.login': 'ورود متقاضی', 'nav.admin': 'ورود مدیر',
  'countries.title': 'کشورها', 'countries.subtitle': 'شرایط ویزا برای بیش از ۱۵۰ مقصد را مرور کنید.',
  'hero.title': 'مورد اعتماد شما در پردازش جهانی ویزا',
  'hero.subtitle': 'درخواست، پیگیری و مدیریت ویزا برای همه کشورها در یک پلتفرم امن و حرفه‌ای.',
  'hero.cta': 'شروع درخواست', 'hero.secondary': 'کشورها را ببینید',
  'features.title': 'چرا متا آنلاین سرویس؟',
  'features.experts': 'مشاوران متخصص ویزا',
  'features.experts.desc': 'تیمی متعهد که در هر مرحله شما را راهنمایی می‌کند.',
  'features.global': 'پشتیبانی جهانی ویزا',
  'features.global.desc': 'شرایط ویزا برای بیش از ۱۵۰ کشور و همه انواع ویزا.',
  'features.secure': 'پیگیری امن درخواست',
  'features.secure.desc': 'به‌روزرسانی لحظه‌ای وضعیت با امنیت بانکی.',
  'features.fast': 'پردازش سریع',
  'features.fast.desc': 'گردش‌کار روان که درخواست شما را پیش می‌برد.',
  'cta.title': 'آماده شروع سفر ویزای خود هستید؟',
  'cta.subtitle': 'در چند دقیقه حساب بسازید و اولین درخواست را ثبت کنید.',
  'cta.button': 'ایجاد حساب',
  'footer.rights': 'تمامی حقوق محفوظ است.',
  'auth.login': 'ورود', 'auth.signup': 'ایجاد حساب',
  'auth.email': 'ایمیل', 'auth.password': 'رمز عبور',
  'auth.fullname': 'نام کامل', 'auth.phone': 'تلفن',
  'auth.country': 'کشور اقامت', 'auth.nationality': 'تابعیت',
  'auth.dob': 'تاریخ تولد',
  'auth.haveAccount': 'حساب دارید؟ وارد شوید',
  'auth.noAccount': 'حساب ندارید؟ ثبت‌نام کنید',
  'auth.adminLogin': 'ورود مدیر',
  'auth.adminHint': 'ناحیه محدود — فقط مدیران.',
  'auth.logout': 'خروج',
  'dash.overview': 'نمای کلی', 'dash.applications': 'درخواست‌های ویزای من',
  'dash.documents': 'مدارک', 'dash.messages': 'پیام‌ها', 'dash.profile': 'پروفایل',
  'dash.payments': 'پرداخت‌ها',
  'dash.newApplication': 'درخواست جدید', 'dash.logout': 'خروج',
  'dash.welcome': 'خوش آمدید',
  'dash.status': 'وضعیت', 'dash.destination': 'مقصد', 'dash.progress': 'پیشرفت',
  'dash.nextAction': 'اقدام بعدی', 'dash.recentUpdates': 'به‌روزرسانی‌های اخیر',
  'dash.noApplications': 'هنوز درخواستی ثبت نشده است.',
  'dash.upload': 'بارگذاری مدرک', 'dash.checklist': 'فهرست مدارک',
  'dash.verification': 'تأیید', 'dash.send': 'ارسال پیام',
  'dash.noMessages': 'هنوز پیامی نیست.',
  'dash.invoice': 'فاکتور',
  'admin.dash': 'داشبورد', 'admin.applicants': 'متقاضیان',
  'admin.applications': 'درخواست‌ها', 'admin.requirements': 'شرایط ویزا',
  'admin.templates': 'قالب‌های ایمیل', 'admin.analytics': 'تحلیل‌ها',
  'admin.totalApplicants': 'کل متقاضیان', 'admin.activeApps': 'درخواست‌های فعال',
  'admin.completed': 'ویزاهای تکمیل‌شده', 'admin.pendingDocs': 'مدارک در انتظار',
  'admin.revenue': 'درآمد',
}

const ar: Dict = {
  brand: 'ميتا أونلاين سيرفس',
  tagline: 'شريكك الموثوق عالمياً في معالجة التأشيرات',
  'nav.home': 'الرئيسية', 'nav.about': 'من نحن', 'nav.services': 'الخدمات',
  'nav.countries': 'الدول', 'nav.contact': 'اتصل بنا',
  'nav.login': 'دخول المتقدم', 'nav.admin': 'دخول الإدارة',
  'countries.title': 'الدول', 'countries.subtitle': 'تصفح متطلبات التأشيرة لأكثر من 150 وجهة حول العالم.',
  'hero.title': 'شريكك الموثوق عالمياً في معالجة التأشيرات',
  'hero.subtitle': 'تقديم ومتابعة وإدارة طلبات التأشيرة لكل الدول في منصة آمنة ومهنية.',
  'hero.cta': 'ابدأ طلبك', 'hero.secondary': 'استكشف الدول',
  'features.title': 'لماذا ميتا أونلاين سيرفس؟',
  'features.experts': 'مستشارو تأشيرات خبراء',
  'features.experts.desc': 'فريق مكرّc يرشدك في كل خطوة.',
  'features.global': 'دعم عالمي للتأشيرات',
  'features.global.desc': 'متطلبات لأكثر من 150 دولة وكل أنواع التأشيرات.',
  'features.secure': 'تتبع آمن للطلبات',
  'features.secure.desc': 'تحديثات فورية للحالة بأمان مصرفي.',
  'features.fast': 'معالجة سريعة',
  'features.fast.desc': 'سير عمل سلس يبقي طلبك متقدماً.',
  'cta.title': 'هل أنت مستعد لبدء رحلة التأشيرة؟',
  'cta.subtitle': 'أنشئ حسابك في دقائق وقدم طلبك الأول اليوم.',
  'cta.button': 'إنشاء حساب',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'auth.login': 'تسجيل الدخول', 'auth.signup': 'إنشاء حساب',
  'auth.email': 'البريد', 'auth.password': 'كلمة المرور',
  'auth.fullname': 'الاسم الكامل', 'auth.phone': 'الهاتف',
  'auth.country': 'بلد الإقامة', 'auth.nationality': 'الجنسية',
  'auth.dob': 'تاريخ الميلاد',
  'auth.haveAccount': 'لديك حساب؟ سجل الدخول',
  'auth.noAccount': 'ليس لديك حساب؟ أنشئ حساباً',
  'auth.adminLogin': 'دخول الإدارة',
  'auth.adminHint': 'منطقة مقيّدة — للمدراء فقط.',
  'auth.logout': 'خروج',
  'dash.overview': 'نظرة عامة', 'dash.applications': 'طلبات التأشيرة',
  'dash.documents': 'المستندات', 'dash.messages': 'الرسائل', 'dash.profile': 'الملف الشخصي',
  'dash.payments': 'المدفوعات',
  'dash.newApplication': 'طلب جديد', 'dash.logout': 'خروج',
  'dash.welcome': 'مرحباً بعودتك',
  'dash.status': 'الحالة', 'dash.destination': 'الوجهة', 'dash.progress': 'التقدم',
  'dash.nextAction': 'الإجراء التالي', 'dash.recentUpdates': 'آخر التحديثات',
  'dash.noApplications': 'لا توجد طلبات بعد.',
  'dash.upload': 'رفع مستند', 'dash.checklist': 'قائمة المستندات',
  'dash.verification': 'التحقق', 'dash.send': 'إرسال',
  'dash.noMessages': 'لا توجد رسائل بعد.',
  'dash.invoice': 'فاتورة',
  'admin.dash': 'لوحة التحكم', 'admin.applicants': 'المتقدمون',
  'admin.applications': 'الطلبات', 'admin.requirements': 'متطلبات التأشيرة',
  'admin.templates': 'قوالب البريد', 'admin.analytics': 'التحليلات',
  'admin.totalApplicants': 'إجمالي المتقدمين', 'admin.activeApps': 'الطلبات النشطة',
  'admin.completed': 'التأشيرات المكتملة', 'admin.pendingDocs': 'المستندات المعلقة',
  'admin.revenue': 'الإيرادات',
}

const dicts: Record<Lang, Dict> = { en, fa, ar }

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('mos-lang') as Lang) || 'en')
  const dir = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr'

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('mos-lang', l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'fa' || l === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <I18nContext.Provider value={{
      lang, setLang,
      t: (k) => dicts[lang][k] ?? dicts.en[k] ?? k,
      dir,
    }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
