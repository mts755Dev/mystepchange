import type { MSCStore, User, CandidateProfile, Document, JobListing, Match, Commission, CommissionStatus, Invoice, Message, Notification } from "@/types";
import { hashPassword, encrypt, decrypt } from "./encryption";

const STORE_KEY = "msc_store";
const STORE_VERSION = "v2"; // bump to reset demo data
const STORE_VERSION_KEY = "msc_store_version";

function getDefaultStore(): MSCStore {
  const now = new Date().toISOString();

  const demoUsers: User[] = [
    { id: "admin-001", role: "admin", email: encrypt("admin@mystepchange.de"), name: encrypt("MSC Admin"), createdAt: now, passwordHash: hashPassword("demo1234"), locale: "en" },
    { id: "candidate-demo-01", role: "candidate", email: encrypt("candidate@demo.de"), name: encrypt("Anna Müller"), createdAt: now, passwordHash: hashPassword("demo1234"), locale: "en" },
    { id: "apprentice-demo-01", role: "apprentice", email: encrypt("apprentice@demo.de"), name: encrypt("Leon Becker"), createdAt: now, passwordHash: hashPassword("demo1234"), locale: "en" },
    { id: "skilled-demo-01", role: "skilled_worker", email: encrypt("skilled@demo.de"), name: encrypt("Maria Santos"), createdAt: now, passwordHash: hashPassword("demo1234"), locale: "en" },
    { id: "employer-demo-01", role: "employer", email: encrypt("employer@demo.de"), name: encrypt("Klaus Hoffmann"), createdAt: now, passwordHash: hashPassword("demo1234"), locale: "en" },
    { id: "recruiter-demo-01", role: "recruiter", email: encrypt("recruiter@demo.de"), name: encrypt("Sophie Wagner"), createdAt: now, passwordHash: hashPassword("demo1234"), locale: "en" },
  ];

  const demoCandidateProfiles: CandidateProfile[] = [
    {
      userId: "candidate-demo-01", anonymousId: "Candidate #1001",
      encryptedName: encrypt("Anna Müller"), encryptedEmail: encrypt("candidate@demo.de"),
      profession: "Registered Nurse", professionCategory: "Healthcare",
      germanLevel: "B2", currentLocation: "Manila, Philippines",
      desiredLocation: ["Berlin", "Hamburg"], skills: ["Patient Care", "IV Therapy", "ICU"],
      yearsOfExperience: 5, bio: "Experienced nurse seeking opportunities in Germany.",
      status: "active", createdAt: now, updatedAt: now,
    },
    {
      userId: "apprentice-demo-01", anonymousId: "Candidate #1002",
      encryptedName: encrypt("Leon Becker"), encryptedEmail: encrypt("apprentice@demo.de"),
      profession: "Business Administration Apprentice", professionCategory: "Business",
      germanLevel: "B1", currentLocation: "Warsaw, Poland",
      desiredLocation: ["Frankfurt", "Munich"], skills: ["Microsoft Office", "Accounting basics"],
      yearsOfExperience: 0, bio: "Eager to start my career in Germany through an Ausbildung.",
      status: "in_review", createdAt: now, updatedAt: now,
    },
    {
      userId: "skilled-demo-01", anonymousId: "Candidate #1003",
      encryptedName: encrypt("Maria Santos"), encryptedEmail: encrypt("skilled@demo.de"),
      profession: "Software Developer", professionCategory: "IT",
      germanLevel: "A2", currentLocation: "São Paulo, Brazil",
      desiredLocation: ["Berlin", "Munich", "Anywhere"], skills: ["Python", "React", "PostgreSQL"],
      yearsOfExperience: 7, bio: "Full-stack developer with 7 years experience, passionate about relocating to Germany.",
      status: "matched", recruiterId: "recruiter-demo-01", createdAt: now, updatedAt: now,
    },
  ];

  return {
    users: demoUsers,
    candidateProfiles: demoCandidateProfiles,
    documents: [],
    jobListings: getSeedJobs(),
    matches: [],
    commissions: [],
    invoices: [],
    messages: [],
    notifications: [],
    nextAnonymousId: 1001,
    nextCommissionId: 5001,
    nextInvoiceNumber: 10001,
  };
}

function getSeedJobs(): JobListing[] {
  return [
    {
      id: "job-001",
      employerId: "employer-seed-01",
      title: "Mechatroniker / Mechatronics Engineer",
      company: "Bosch GmbH",
      anonymousCompany: "Company #101",
      description: "We are looking for a skilled mechatronics engineer to join our manufacturing team in Stuttgart.",
      requirements: ["3+ years experience", "German B2 or higher", "CNC machine operation"],
      profession: "Mechatronics Engineer",
      professionCategory: "Engineering",
      location: "Stuttgart",
      germanLevelRequired: "B2",
      salaryMin: 45000,
      salaryMax: 62000,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "job-002",
      employerId: "employer-seed-01",
      title: "Pflegefachkraft / Registered Nurse",
      company: "Charité Berlin",
      anonymousCompany: "Company #102",
      description: "Join our renowned hospital team as a registered nurse. Full support for international candidates.",
      requirements: ["Nursing degree", "German B1 minimum", "EU recognition support available"],
      profession: "Registered Nurse",
      professionCategory: "Healthcare",
      location: "Berlin",
      germanLevelRequired: "B1",
      salaryMin: 38000,
      salaryMax: 52000,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "job-003",
      employerId: "employer-seed-02",
      title: "Elektriker / Electrician",
      company: "Siemens AG",
      anonymousCompany: "Company #103",
      description: "Electrician position for our energy division in Munich. Relocation package available.",
      requirements: ["Electrician certification", "German A2 minimum", "Industrial experience preferred"],
      profession: "Electrician",
      professionCategory: "Trades",
      location: "Munich",
      germanLevelRequired: "A2",
      salaryMin: 42000,
      salaryMax: 55000,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "job-004",
      employerId: "employer-seed-02",
      title: "Ausbildung Kaufmann / Apprenticeship: Business Admin",
      company: "Deutsche Bank",
      anonymousCompany: "Company #104",
      description: "3-year apprenticeship in business administration at our Frankfurt headquarters.",
      requirements: ["Abitur or equivalent", "German B2", "Motivated to learn"],
      profession: "Business Administration Apprentice",
      professionCategory: "Business",
      location: "Frankfurt",
      germanLevelRequired: "B2",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "job-005",
      employerId: "employer-seed-03",
      title: "Softwareentwickler / Software Developer",
      company: "SAP SE",
      anonymousCompany: "Company #105",
      description: "Backend developer role at SAP in Walldorf. Agile environment, competitive salary.",
      requirements: ["3+ years backend dev", "German A1 (team is international)", "Java/Python expertise"],
      profession: "Software Developer",
      professionCategory: "IT",
      location: "Walldorf",
      germanLevelRequired: "A1",
      salaryMin: 60000,
      salaryMax: 85000,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "job-006",
      employerId: "employer-seed-03",
      title: "Koch / Chef de Partie",
      company: "Kempinski Hotels",
      anonymousCompany: "Company #106",
      description: "Chef de Partie for a luxury hotel chain. Experience in European cuisine required.",
      requirements: ["Culinary degree or apprenticeship", "German A2", "Hotel experience preferred"],
      profession: "Chef",
      professionCategory: "Hospitality",
      location: "Hamburg",
      germanLevelRequired: "A2",
      salaryMin: 32000,
      salaryMax: 44000,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getStore(): MSCStore {
  if (typeof window === "undefined") return getDefaultStore();
  try {
    const version = localStorage.getItem(STORE_VERSION_KEY);
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw || version !== STORE_VERSION) {
      const defaultStore = getDefaultStore();
      localStorage.setItem(STORE_KEY, JSON.stringify(defaultStore));
      localStorage.setItem(STORE_VERSION_KEY, STORE_VERSION);
      return defaultStore;
    }
    return JSON.parse(raw) as MSCStore;
  } catch {
    return getDefaultStore();
  }
}

export function saveStore(store: MSCStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function updateStore(updater: (store: MSCStore) => MSCStore): MSCStore {
  const store = getStore();
  const updated = updater(store);
  saveStore(updated);
  return updated;
}

// User operations
export const userStorage = {
  getAll: (): User[] => getStore().users,
  getById: (id: string): User | undefined => getStore().users.find((u) => u.id === id),
  getByEmail: (plainEmail: string): User | undefined =>
    getStore().users.find((u) => decrypt(u.email) === plainEmail),
  create: (user: User): User => {
    updateStore((s) => ({ ...s, users: [...s.users, user] }));
    return user;
  },
  update: (id: string, data: Partial<User>): void => {
    updateStore((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }));
  },
};

// Candidate profile operations
export const candidateStorage = {
  getAll: (): CandidateProfile[] => getStore().candidateProfiles,
  getById: (userId: string): CandidateProfile | undefined =>
    getStore().candidateProfiles.find((c) => c.userId === userId),
  getByRecruiterId: (recruiterId: string): CandidateProfile[] =>
    getStore().candidateProfiles.filter((c) => c.recruiterId === recruiterId),
  create: (profile: CandidateProfile): CandidateProfile => {
    updateStore((s) => ({
      ...s,
      candidateProfiles: [...s.candidateProfiles, profile],
      nextAnonymousId: s.nextAnonymousId + 1,
    }));
    return profile;
  },
  update: (userId: string, data: Partial<CandidateProfile>): void => {
    updateStore((s) => ({
      ...s,
      candidateProfiles: s.candidateProfiles.map((c) =>
        c.userId === userId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },
  updateStatus: (userId: string, status: CandidateProfile["status"]): void => {
    candidateStorage.update(userId, { status });
    if (status === "placed") {
      commissionStorage.triggerOnPlacement(userId);
    }
  },
};

// Document operations
export const documentStorage = {
  getAll: (): Document[] => getStore().documents,
  getByUserId: (userId: string): Document[] =>
    getStore().documents.filter((d) => d.userId === userId),
  create: (doc: Document): Document => {
    updateStore((s) => ({ ...s, documents: [...s.documents, doc] }));
    return doc;
  },
  verify: (docId: string, adminId: string): void => {
    updateStore((s) => ({
      ...s,
      documents: s.documents.map((d) =>
        d.id === docId
          ? { ...d, isVerified: true, verifiedAt: new Date().toISOString(), verifiedBy: adminId }
          : d
      ),
    }));
  },
};

// Job listing operations
export const jobStorage = {
  getAll: (): JobListing[] => getStore().jobListings.filter((j) => j.isActive),
  getAllIncludeInactive: (): JobListing[] => getStore().jobListings,
  getById: (id: string): JobListing | undefined => getStore().jobListings.find((j) => j.id === id),
  getByEmployerId: (employerId: string): JobListing[] =>
    getStore().jobListings.filter((j) => j.employerId === employerId),
  create: (job: JobListing): JobListing => {
    updateStore((s) => ({ ...s, jobListings: [...s.jobListings, job] }));
    return job;
  },
  update: (id: string, data: Partial<JobListing>): void => {
    updateStore((s) => ({
      ...s,
      jobListings: s.jobListings.map((j) => (j.id === id ? { ...j, ...data } : j)),
    }));
  },
};

// Message operations
export const messageStorage = {
  getByCandidateId: (candidateId: string): Message[] =>
    getStore().messages.filter((m) => m.candidateId === candidateId),
  getAllUnread: (): Message[] => getStore().messages.filter((m) => !m.isRead && m.sender === "candidate"),
  send: (msg: Message): Message => {
    updateStore((s) => ({ ...s, messages: [...s.messages, msg] }));
    return msg;
  },
  markRead: (id: string): void => {
    updateStore((s) => ({
      ...s,
      messages: s.messages.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    }));
  },
};

// Commission operations
export const commissionStorage = {
  getAll: (): Commission[] => getStore().commissions,
  getByRecruiterId: (recruiterId: string): Commission[] =>
    getStore().commissions.filter((c) => c.recruiterId === recruiterId),
  triggerOnPlacement: (candidateUserId: string): void => {
    const profile = candidateStorage.getById(candidateUserId);
    if (!profile || !profile.recruiterId) return;
    const store = getStore();
    const existingCommission = store.commissions.find((c) => c.candidateId === candidateUserId);
    if (existingCommission) return;
    const commissionId = `comm-${store.nextCommissionId}`;
    const invoiceNumber = `INV-${store.nextInvoiceNumber}`;
    const commissionAmount = 3500;
    const tax = commissionAmount * 0.19;
    const invoiceId = `inv-${store.nextInvoiceNumber}`;
    const commission: Commission = {
      id: commissionId,
      recruiterId: profile.recruiterId,
      candidateId: candidateUserId,
      employerId: profile.employerId || "",
      jobId: "",
      amount: commissionAmount,
      status: "pending",
      triggeredAt: new Date().toISOString(),
    };
    const invoice: Invoice = {
      id: invoiceId,
      commissionId,
      employerId: profile.employerId || "",
      invoiceNumber,
      amount: commissionAmount,
      tax,
      total: commissionAmount + tax,
      issuedAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    updateStore((s) => ({
      ...s,
      commissions: [...s.commissions, commission],
      invoices: [...s.invoices, invoice],
      nextCommissionId: s.nextCommissionId + 1,
      nextInvoiceNumber: s.nextInvoiceNumber + 1,
    }));
  },
  updateStatus: (id: string, status: CommissionStatus): void => {
    updateStore((s) => ({
      ...s,
      commissions: s.commissions.map((c) =>
        c.id === id
          ? { ...c, status, paidAt: status === "paid" ? new Date().toISOString() : c.paidAt }
          : c
      ),
    }));
  },
};

// Notification operations
export const notificationStorage = {
  getByUserId: (userId: string): Notification[] =>
    getStore().notifications.filter((n) => n.userId === userId),
  create: (notification: Notification): Notification => {
    updateStore((s) => ({ ...s, notifications: [...s.notifications, notification] }));
    return notification;
  },
  markRead: (id: string): void => {
    updateStore((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
  },
};
