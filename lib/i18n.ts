export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  en: Translation;
  th: Translation;
}

export const translations: Translations = {
  en: {
    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      download: "Download",
      upload: "Upload",
      share: "Share",
      search: "Search",
      filter: "Filter",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      confirm: "Confirm",
      yes: "Yes",
      no: "No",
      ok: "OK",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information"
    },
    
    // Navigation
    nav: {
      overview: "Overview",
      checklist: "Checklist",
      calendar: "Calendar",
      messages: "Messages",
      documents: "Documents",
      medications: "Medications",
      emergency: "Emergency Contact",
      emergencyCall: "Call Now: (555) 123-4567"
    },
    
    // Authentication
    auth: {
      welcome: "Welcome",
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset Password",
      createAccount: "Create Account",
      signingIn: "Signing In...",
      creatingAccount: "Creating Account...",
      enterEmail: "Enter your email",
      enterPassword: "Enter your password",
      createPassword: "Create a password",
      enterFullName: "Enter your full name",
      signInDescription: "Sign in to access your personalised surgery support dashboard",
      resetDescription: "Enter your email address and we'll send you a link to reset your password.",
      resetLinkSent: "Reset link sent!",
      resetLinkDescription: "Check your email at {email} for instructions to reset your password.",
      acceptTerms: "I agree to the Privacy Policy and Terms of Service",
      mustAcceptTerms: "You must accept our Privacy Policy and Terms of Service to create an account.",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      // Password Reset
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      enterNewPassword: "Enter your new password",
      confirmNewPassword: "Confirm your new password",
      passwordStrength: "Password strength",
      passwordRequirements: "Password Requirements",
      passwordsMatch: "Passwords match",
      passwordsDoNotMatch: "Passwords do not match",
      passwordUpdated: "Password updated successfully!",
      redirectingToLogin: "You will be redirected to the login page in a few seconds.",
      invalidResetToken: "Invalid or expired reset token. Please request a new password reset.",
      passwordRequirement: {
        minLength: "At least 8 characters",
        uppercase: "One uppercase letter",
        lowercase: "One lowercase letter",
        number: "One number",
        special: "One special character"
      },
      passwordStrengthLevel: {
        weak: "Weak",
        fair: "Fair",
        strong: "Strong"
      },
      securityNotice: "Security Notice",
      securityNoticeText: "After updating your password, you'll be signed out of all devices and need to sign in again with your new password."
    },
    
    // Splash Screen
    splash: {
      tagline: "Your Recovery, Your Way",
      description: "Comprehensive surgery preparation and recovery support with personalised care plans",
      preparing: "Preparing your dashboard...",
      personalisedCare: "Personalised Care",
      securePrivate: "Secure & Private",
      support247: "24/7 Support",
      poweredBy: "Powered by surgerysupport.io"
    },
    
    // Brand
    brand: {
      name: "surgerysupport.io",
      tagline: "Your Recovery, Your Way",
      description: "Comprehensive surgery preparation and recovery support for your surgery abroad. With personalised care plans, progress tracking, and secure multilingual communication.",
      features: {
        securePrivate: "Secure & Private",
        hipaaCompliant: "HIPAA Compliant",
        support247: "24/7 Support",
        alwaysAvailable: "Always Available",
        expertCareTeam: "Expert Care Team",
        boardCertified: "Board Certified",
        personalisedCare: "Personalised Care",
        tailoredPlans: "Tailored Plans"
      }
    },
    
    // Dashboard
    dashboard: {
      title: "Surgery Support Dashboard",
      welcomeBack: "Welcome back, {name}!",
      surgeryScheduled: "Your {surgeryType} is scheduled with {provider}",
      
      // Overview
      overview: {
        title: "Overview",
        surgeryCountdown: "Surgery Countdown",
        timeRemaining: "Time remaining until your procedure",
        days: "Days",
        hours: "Hours",
        minutes: "Minutes",
        progress: "Progress",
        preparationCompletion: "Preparation completion",
        complete: "Complete",
        tasksCompleted: "Tasks Completed",
        upcomingAppointments: "Upcoming Appointments",
        newMessages: "New Messages",
        recentActivity: "Recent Activity",
        latestProgress: "Your latest progress updates",
        nextSteps: "Next Steps",
        upcomingTasks: "Upcoming tasks and reminders",
        quickActions: "Quick Actions",
        frequentlyUsed: "Frequently used features",
        viewChecklist: "View Checklist",
        scheduleAppointment: "Schedule Appointment",
        messageProvider: "Message Provider",
        trackRecovery: "Track Recovery"
      },
      
      // Calendar
      calendar: {
        title: "Calendar & Appointments",
        description: "Manage your medical appointments and schedule",
        scheduleAppointment: "Schedule Appointment",
        upcomingAppointments: "Upcoming Appointments",
        scheduledAppointments: "Your scheduled medical appointments and procedures",
        pastAppointments: "Past Appointments",
        appointmentHistory: "Your appointment history and completed visits",
        noUpcoming: "No upcoming appointments scheduled",
        scheduleFirst: "Schedule Your First Appointment",
        reschedule: "Reschedule",
        joinVirtual: "Join Virtual Visit",
        virtualVisits: "Virtual Visits",
        completedAppointments: "Completed Appointments",
        important: "Important"
      },
      
      // Messages
      messages: {
        title: "Messages",
        description: "Secure communication with your healthcare team",
        newMessage: "New Message",
        conversations: "Conversations",
        searchConversations: "Search conversations...",
        selectConversation: "Select a conversation to start messaging",
        typeMessage: "Type your message...",
        urgent: "Urgent"
      },
      
      // Documents
      documents: {
        title: "Documents",
        description: "Manage your medical documents and files",
        uploadDocument: "Upload Document",
        searchDocuments: "Search documents...",
        yourDocuments: "Your Documents",
        documentsFound: "{count} documents found",
        noDocuments: "No documents found matching your criteria",
        uploadFirst: "Upload Your First Document",
        totalDocuments: "Total Documents",
        shared: "Shared",
        urgent: "Urgent",
        testResults: "Test Results",
        categories: {
          all: "All Documents",
          medicalRecords: "Medical Records",
          insurance: "Insurance",
          preOp: "Pre-Operative",
          postOp: "Post-Operative",
          testResults: "Test Results"
        }
      },
      
      // Medications
      medications: {
        title: "Medication Tracker",
        description: "Manage your medications and track adherence",
        addMedication: "Add Medication",
        todaysProgress: "Today's Progress",
        upcomingDoses: "Upcoming Doses",
        activeMedications: "Active Medications",
        scheduledToday: "Medications scheduled for today and tomorrow",
        markAsTaken: "Mark as Taken",
        overdue: "Overdue",
        instructions: "Instructions",
        schedule: "Schedule",
        sideEffectsWatch: "Side Effects to Watch",
        todaysSchedule: "Today's Schedule",
        setReminder: "Set Reminder",
        viewHistory: "View History",
        categories: {
          painManagement: "pain management",
          antibiotic: "antibiotic",
          antiInflammatory: "anti-inflammatory",
          supplement: "supplement"
        }
      },
      
      // Checklist
      checklist: {
        title: "Surgery Checklist",
        description: "Track your preparation and recovery tasks",
        preOperative: "Pre-Operative",
        postOperative: "Post-Operative",
        preOpProgress: "Pre-Operative Progress",
        postOpProgress: "Post-Operative Progress",
        completeBefore: "Complete these tasks before your surgery date",
        completeDuring: "Complete these tasks during your recovery",
        tasksCompleted: "{completed} of {total} tasks completed",
        priorities: {
          high: "high",
          medium: "medium",
          low: "low"
        },
        categories: {
          medical: "medical",
          preparation: "preparation",
          documentation: "documentation"
        }
      }
    },
    
    // Time and Date
    time: {
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      dueIn: "Due in {time}",
      ago: "{time} ago",
      hoursAgo: "{hours} hours ago",
      daysAgo: "{days} days ago"
    }
  },
  
  th: {
    // Common
    common: {
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      delete: "ลบ",
      edit: "แก้ไข",
      view: "ดู",
      download: "ดาวน์โหลด",
      upload: "อัปโหลด",
      share: "แชร์",
      search: "ค้นหา",
      filter: "กรอง",
      back: "กลับ",
      next: "ถัดไป",
      previous: "ก่อนหน้า",
      close: "ปิด",
      confirm: "ยืนยัน",
      yes: "ใช่",
      no: "ไม่",
      ok: "ตกลง",
      error: "ข้อผิดพลาด",
      success: "สำเร็จ",
      warning: "คำเตือน",
      info: "ข้อมูล"
    },
    
    // Navigation
    nav: {
      overview: "ภาพรวม",
      checklist: "รายการตรวจสอบ",
      calendar: "ปฏิทิน",
      messages: "ข้อความ",
      documents: "เอกสาร",
      medications: "ยา",
      emergency: "ติดต่อฉุกเฉิน",
      emergencyCall: "โทรเลย: (555) 123-4567"
    },
    
    // Authentication
    auth: {
      welcome: "ยินดีต้อนรับ",
      signIn: "เข้าสู่ระบบ",
      signUp: "สมัครสมาชิก",
      email: "อีเมล",
      password: "รหัสผ่าน",
      fullName: "ชื่อเต็ม",
      forgotPassword: "ลืมรหัสผ่าน?",
      resetPassword: "รีเซ็ตรหัสผ่าน",
      createAccount: "สร้างบัญชี",
      signingIn: "กำลังเข้าสู่ระบบ...",
      creatingAccount: "กำลังสร้างบัญชี...",
      enterEmail: "กรอกอีเมลของคุณ",
      enterPassword: "กรอกรหัสผ่านของคุณ",
      createPassword: "สร้างรหัสผ่าน",
      enterFullName: "กรอกชื่อเต็มของคุณ",
      signInDescription: "เข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ดสนับสนุนการผ่าตัดส่วนบุคคลของคุณ",
      resetDescription: "กรอกที่อยู่อีเมลของคุณ แล้วเราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ",
      resetLinkSent: "ส่งลิงก์รีเซ็ตแล้ว!",
      resetLinkDescription: "ตรวจสอบอีเมลของคุณที่ {email} สำหรับคำแนะนำในการรีเซ็ตรหัสผ่าน",
      acceptTerms: "ฉันยอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดการให้บริการ",
      mustAcceptTerms: "คุณต้องยอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดการให้บริการของเราเพื่อสร้างบัญชี",
      privacyPolicy: "นโยบายความเป็นส่วนตัว",
      termsOfService: "ข้อกำหนดการให้บริการ",
      // Password Reset
      newPassword: "รหัสผ่านใหม่",
      confirmPassword: "ยืนยันรหัสผ่าน",
      enterNewPassword: "กรอกรหัสผ่านใหม่ของคุณ",
      confirmNewPassword: "ยืนยันรหัสผ่านใหม่ของคุณ",
      passwordStrength: "ความแข็งแกร่งของรหัสผ่าน",
      passwordRequirements: "ข้อกำหนดรหัสผ่าน",
      passwordsMatch: "รหัสผ่านตรงกัน",
      passwordsDoNotMatch: "รหัสผ่านไม่ตรงกัน",
      passwordUpdated: "อัปเดตรหัสผ่านสำเร็จ!",
      redirectingToLogin: "คุณจะถูกเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบในอีกสักครู่",
      invalidResetToken: "โทเค็นรีเซ็ตไม่ถูกต้องหรือหมดอายุ กรุณาขอรีเซ็ตรหัสผ่านใหม่",
      passwordRequirement: {
        minLength: "อย่างน้อย 8 ตัวอักษร",
        uppercase: "ตัวอักษรพิมพ์ใหญ่หนึ่งตัว",
        lowercase: "ตัวอักษรพิมพ์เล็กหนึ่งตัว",
        number: "ตัวเลขหนึ่งตัว",
        special: "อักขระพิเศษหนึ่งตัว"
      },
      passwordStrengthLevel: {
        weak: "อ่อน",
        fair: "ปานกลาง",
        strong: "แข็งแกร่ง"
      },
      securityNotice: "ประกาศความปลอดภัย",
      securityNoticeText: "หลังจากอัปเดตรหัสผ่านของคุณ คุณจะถูกออกจากระบบในอุปกรณ์ทั้งหมดและต้องเข้าสู่ระบบอีกครั้งด้วยรหัสผ่านใหม่"
    },
    
    // Splash Screen
    splash: {
      tagline: "การฟื้นฟูของคุณ ตามแบบของคุณ",
      description: "การสนับสนุนการเตรียมตัวและการฟื้นฟูหลังการผ่าตัดอย่างครอบคลุมด้วยแผนการดูแลส่วนบุคคล",
      preparing: "กำลังเตรียมแดชบอร์ดของคุณ...",
      personalisedCare: "การดูแลส่วนบุคคล",
      securePrivate: "ปลอดภัยและเป็นส่วนตัว",
      support247: "สนับสนุน 24/7",
      poweredBy: "ขับเคลื่อนโดย surgerysupport.io"
    },
    
    // Brand
    brand: {
      name: "surgerysupport.io",
      tagline: "การฟื้นฟูของคุณ ตามแบบของคุณ",
      description: "การสนับสนุนการเตรียมตัวและการฟื้นฟูหลังการผ่าตัดอย่างครอบคลุมสำหรับการผ่าตัดในต่างประเทศของคุณ ด้วยแผนการดูแลส่วนบุคคล การติดตามความคืบหนา และการสื่อสารหลายภาษาที่ปลอดภัย",
      features: {
        securePrivate: "ปลอดภัยและเป็นส่วนตัว",
        hipaaCompliant: "เป็นไปตาม HIPAA",
        support247: "สนับสนุน 24/7",
        alwaysAvailable: "พร้อมให้บริการตลอดเวลา",
        expertCareTeam: "ทีมดูแลผู้เชี่ยวชาญ",
        boardCertified: "ได้รับการรับรองจากคณะกรรมการ",
        personalisedCare: "การดูแลส่วนบุคคล",
        tailoredPlans: "แผนที่ปรับแต่งเฉพาะ"
      }
    },
    
    // Dashboard
    dashboard: {
      title: "แดชบอร์ดสนับสนุนการผ่าตัด",
      welcomeBack: "ยินดีต้อนรับกลับ, {name}!",
      surgeryScheduled: "{surgeryType} ของคุณได้กำหนดไว้กับ {provider}",
      
      // Overview
      overview: {
        title: "ภาพรวม",
        surgeryCountdown: "นับถอยหลังการผ่าตัด",
        timeRemaining: "เวลาที่เหลือจนถึงการผ่าตัดของคุณ",
        days: "วัน",
        hours: "ชั่วโมง",
        minutes: "นาที",
        progress: "ความคืบหน้า",
        preparationCompletion: "ความสมบูรณ์ของการเตรียมตัว",
        complete: "เสร็จสิ้น",
        tasksCompleted: "งานที่เสร็จสิ้น",
        upcomingAppointments: "นัดหมายที่จะมาถึง",
        newMessages: "ข้อความใหม่",
        recentActivity: "กิจกรรมล่าสุด",
        latestProgress: "อัปเดตความคืบหน้าล่าสุดของคุณ",
        nextSteps: "ขั้นตอนถัดไป",
        upcomingTasks: "งานและการแจ้งเตือนที่จะมาถึง",
        quickActions: "การดำเนินการด่วน",
        frequentlyUsed: "คุณสมบัติที่ใช้บ่อย",
        viewChecklist: "ดูรายการตรวจสอบ",
        scheduleAppointment: "กำหนดนัดหมาย",
        messageProvider: "ส่งข้อความถึงผู้ให้บริการ",
        trackRecovery: "ติดตามการฟื้นฟู"
      },
      
      // Calendar
      calendar: {
        title: "ปฏิทินและนัดหมาย",
        description: "จัดการนัดหมายทางการแพทย์และตารางเวลาของคุณ",
        scheduleAppointment: "กำหนดนัดหมาย",
        upcomingAppointments: "นัดหมายที่จะมาถึง",
        scheduledAppointments: "นัดหมายทางการแพทย์และขั้นตอนที่กำหนดไว้ของคุณ",
        pastAppointments: "นัดหมายที่ผ่านมา",
        appointmentHistory: "ประวัตินัดหมายและการเยี่ยมชมที่เสร็จสิ้นของคุณ",
        noUpcoming: "ไม่มีนัดหมายที่จะมาถึงที่กำหนดไว้",
        scheduleFirst: "กำหนดนัดหมายแรกของคุณ",
        reschedule: "เปลี่ยนกำหนดการ",
        joinVirtual: "เข้าร่วมการเยี่ยมชมเสมือน",
        virtualVisits: "การเยี่ยมชมเสมือน",
        completedAppointments: "นัดหมายที่เสร็จสิ้น",
        important: "สำคัญ"
      },
      
      // Messages
      messages: {
        title: "ข้อความ",
        description: "การสื่อสารที่ปลอดภัยกับทีมดูแลสุขภาพของคุณ",
        newMessage: "ข้อความใหม่",
        conversations: "การสนทนา",
        searchConversations: "ค้นหาการสนทนา...",
        selectConversation: "เลือกการสนทนาเพื่อเริ่มส่งข้อความ",
        typeMessage: "พิมพ์ข้อความของคุณ...",
        urgent: "เร่งด่วน"
      },
      
      // Documents
      documents: {
        title: "เอกสาร",
        description: "จัดการเอกสารทางการแพทย์และไฟล์ของคุณ",
        uploadDocument: "อัปโหลดเอกสาร",
        searchDocuments: "ค้นหาเอกสาร...",
        yourDocuments: "เอกสารของคุณ",
        documentsFound: "พบเอกสาร {count} รายการ",
        noDocuments: "ไม่พบเอกสารที่ตรงกับเกณฑ์ของคุณ",
        uploadFirst: "อัปโหลดเอกสารแรกของคุณ",
        totalDocuments: "เอกสารทั้งหมด",
        shared: "แชร์แล้ว",
        urgent: "เร่งด่วน",
        testResults: "ผลการตรวจ",
        categories: {
          all: "เอกสารทั้งหมด",
          medicalRecords: "บันทึกทางการแพทย์",
          insurance: "ประกันภัย",
          preOp: "ก่อนการผ่าตัด",
          postOp: "หลังการผ่าตัด",
          testResults: "ผลการตรวจ"
        }
      },
      
      // Medications
      medications: {
        title: "ติดตามยา",
        description: "จัดการยาและติดตามการปฏิบัติตาม",
        addMedication: "เพิ่มยา",
        todaysProgress: "ความคืบหน้าวันนี้",
        upcomingDoses: "ขนาดยาที่จะมาถึง",
        activeMedications: "ยาที่ใช้งานอยู่",
        scheduledToday: "ยาที่กำหนดไว้สำหรับวันนี้และพรุ่งนี้",
        markAsTaken: "ทำเครื่องหมายว่าได้รับประทานแล้ว",
        overdue: "เกินกำหนด",
        instructions: "คำแนะนำ",
        schedule: "ตารางเวลา",
        sideEffectsWatch: "ผลข้างเคียงที่ต้องระวัง",
        todaysSchedule: "ตารางเวลาวันนี้",
        setReminder: "ตั้งการแจ้งเตือน",
        viewHistory: "ดูประวัติ",
        categories: {
          painManagement: "การจัดการความเจ็บปวด",
          antibiotic: "ยาปฏิชีวนะ",
          antiInflammatory: "ยาต้านการอักเสบ",
          supplement: "อาหารเสริม"
        }
      },
      
      // Checklist
      checklist: {
        title: "รายการตรวจสอบการผ่าตัด",
        description: "ติดตามงานการเตรียมตัวและการฟื้นฟูของคุณ",
        preOperative: "ก่อนการผ่าตัด",
        postOperative: "หลังการผ่าตัด",
        preOpProgress: "ความคืบหน้าก่อนการผ่าตัด",
        postOpProgress: "ความคืบหน้าหลังการผ่าตัด",
        completeBefore: "ทำงานเหล่านี้ให้เสร็จก่อนวันผ่าตัดของคุณ",
        completeDuring: "ทำงานเหล่านี้ให้เสร็จระหว่างการฟื้นฟูของคุณ",
        tasksCompleted: "เสร็จสิ้น {completed} จาก {total} งาน",
        priorities: {
          high: "สูง",
          medium: "ปานกลาง",
          low: "ต่ำ"
        },
        categories: {
          medical: "ทางการแพทย์",
          preparation: "การเตรียมตัว",
          documentation: "เอกสาร"
        }
      }
    },
    
    // Time and Date
    time: {
      today: "วันนี้",
      yesterday: "เมื่อวาน",
      tomorrow: "พรุ่งนี้",
      thisWeek: "สัปดาห์นี้",
      lastWeek: "สัปดาห์ที่แล้ว",
      thisMonth: "เดือนนี้",
      lastMonth: "เดือนที่แล้ว",
      dueIn: "ครบกำหนดใน {time}",
      ago: "{time} ที่แล้ว",
      hoursAgo: "{hours} ชั่วโมงที่แล้ว",
      daysAgo: "{days} วันที่แล้ว"
    }
  }
};

export type Language = 'en' | 'th';

export const defaultLanguage: Language = 'en';

export function getTranslation(key: string, lang: Language = defaultLanguage, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if no translation found
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters in the translation
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match;
    });
  }
  
  return value;
}

export function formatDate(date: Date | string, lang: Language = defaultLanguage): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (lang === 'th') {
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

export function formatTime(date: Date | string, lang: Language = defaultLanguage): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (lang === 'th') {
    return dateObj.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}