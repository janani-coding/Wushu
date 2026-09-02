export const INITIAL_SETTINGS = {
  academyName: "Villupuram District Wushu Association",
  tagline: "Official Wushu & Martial Arts Association",
  logoUrl: "",
  upiId: "wushuassociation@upi",
  upiQrCodeUrl: "",
  defaultMonthlyFee: 1500,
  dueDate: 5,
  lateFee: 100,
  paymentCategories: [
    "Academy Monthly Fee",
    "Tournament Registration Fee",
    "Belt Examination Fee",
    "Uniform Fee",
    "Equipment Fee",
    "Event Fee",
    "Other"
  ],
  reminderSchedule: [1, 5, 10, 15],
  theme: "dark",
  notificationSettings: {
    enablePush: true,
    enablePaymentReminders: true,
    enableQueryAlerts: true
  },
  address: "Villupuram, Tamil Nadu",
  contactPhone: "",
  contactEmail: "lokesh.8637427067@gmail.com"
}

export const INITIAL_ADMINS = [
  {
    id: "admin_1",
    email: "lokesh.8637427067@gmail.com",
    name: "Lokesh Admin",
    photoUrl: "",
    phone: "",
    role: "Chief Admin",
    status: "active",
    lastLogin: new Date().toISOString()
  }
]

export const INITIAL_STUDENTS = [
  {
    id: "STU-2026-001",
    fullName: "Arun Kumar",
    phoneNumber: "9876543210",
    dob: "2002-05-15",
    gender: "Male",
    currentBelt: "Black",
    batch: "Evening Elite (5:30 PM - 7:00 PM)",
    monthlyFee: 1500,
    joiningDate: "2023-01-10",
    status: "Active",
    address: "No. 12, Main Road, Villupuram",
    emergencyContact: "+91 98765 00001 (Parent)",
    profilePhoto: ""
  },
  {
    id: "STU-2026-002",
    fullName: "Priya Sharma",
    phoneNumber: "9876543211",
    dob: "2004-09-22",
    gender: "Female",
    currentBelt: "Green",
    batch: "Morning Warrior (6:00 AM - 7:30 AM)",
    monthlyFee: 1500,
    joiningDate: "2023-06-15",
    status: "Active",
    address: "No. 45, Temple Street, Villupuram",
    emergencyContact: "+91 98765 00002 (Parent)",
    profilePhoto: ""
  },
  {
    id: "STU-2026-003",
    fullName: "Karthik Raja",
    phoneNumber: "9360780904",
    dob: "2006-09-04",
    gender: "Male",
    currentBelt: "Blue",
    batch: "Morning Warrior (6:00 AM - 7:30 AM)",
    monthlyFee: 1500,
    joiningDate: "2024-02-01",
    status: "Active",
    address: "No. 88, Gandhi Road, Villupuram",
    emergencyContact: "+91 93607 80900 (Parent)",
    profilePhoto: ""
  }
]
export const INITIAL_PAYMENTS = []
export const INITIAL_QUERIES = []
export const INITIAL_NOTIFICATIONS = []
export const INITIAL_GALLERY = []
export const INITIAL_TOURNAMENTS = []
export const INITIAL_TOURNAMENT_REGISTRATIONS = []
export const INITIAL_ACHIEVEMENTS = []

