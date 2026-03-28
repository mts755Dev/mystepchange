export type UserRole = "candidate" | "apprentice" | "skilled_worker" | "employer" | "recruiter" | "admin";

export type CandidateStatus = "in_review" | "active" | "matched" | "interview" | "placed";

export type GermanLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "native";

export type DocumentType = "cv" | "certificate" | "diploma" | "language_cert" | "other";

export type CommissionStatus = "pending" | "in_progress" | "paid";

export type MessageSender = "candidate" | "msc_admin";

export interface User {
  id: string;
  role: UserRole;
  email: string; // encrypted
  name: string;  // encrypted
  createdAt: string;
  passwordHash: string;
  locale: "en" | "de";
}

export interface CandidateProfile {
  userId: string;
  anonymousId: string; // e.g. "Candidate #1042"
  // Encrypted personal fields
  encryptedName: string;
  encryptedEmail: string;
  encryptedPhone?: string;
  encryptedAddress?: string;
  // Public profile fields
  profession: string;
  professionCategory: string;
  germanLevel: GermanLevel;
  currentLocation: string;
  desiredLocation: string[];
  skills: string[];
  yearsOfExperience: number;
  bio: string;
  status: CandidateStatus;
  recruiterId?: string;
  employerId?: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  anonymizedFileName: string;
  fileData: string; // base64
  isVerified: boolean;
  isAnonymized: boolean;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string; // admin userId
}

export interface JobListing {
  id: string;
  employerId: string;
  title: string;
  company: string; // shown only to matched/placed
  anonymousCompany: string; // "Company #205"
  description: string;
  requirements: string[];
  profession: string;
  professionCategory: string;
  location: string;
  germanLevelRequired: GermanLevel;
  salaryMin?: number;
  salaryMax?: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface Match {
  id: string;
  candidateId: string;
  jobId: string;
  score: number;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Commission {
  id: string;
  recruiterId: string;
  candidateId: string;
  employerId: string;
  jobId: string;
  amount: number;
  status: CommissionStatus;
  triggeredAt: string;
  paidAt?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  commissionId: string;
  employerId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  issuedAt: string;
  dueAt: string;
  pdfData?: string;
}

export interface Message {
  id: string;
  candidateId: string;
  sender: MessageSender;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: "status_change" | "document_verified" | "message" | "commission" | "match";
  createdAt: string;
}

export interface MSCStore {
  users: User[];
  candidateProfiles: CandidateProfile[];
  documents: Document[];
  jobListings: JobListing[];
  matches: Match[];
  commissions: Commission[];
  invoices: Invoice[];
  messages: Message[];
  notifications: Notification[];
  nextAnonymousId: number;
  nextCommissionId: number;
  nextInvoiceNumber: number;
}
