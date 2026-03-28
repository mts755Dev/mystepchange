"use client";

import type { User, UserRole } from "@/types";
import { encrypt, decrypt, hashPassword, verifyPassword } from "./encryption";
import { userStorage, candidateStorage, getStore } from "./storage";
import { nanoid } from "./utils";

const SESSION_KEY = "msc_session";

export interface AuthSession {
  userId: string;
  role: UserRole;
  locale: "en" | "de";
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  locale: "en" | "de";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  session?: AuthSession;
  user?: User;
}

export function register(data: RegisterData): AuthResult {
  const existing = userStorage.getByEmail(data.email);
  if (existing) {
    return { success: false, error: "Email already registered" };
  }

  const userId = nanoid();
  const store = getStore();
  const encryptedEmail = encrypt(data.email);
  const user: User = {
    id: userId,
    role: data.role,
    email: encryptedEmail,
    name: encrypt(data.name),
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(data.password),
    locale: data.locale,
  };

  userStorage.create(user);

  // Auto-create candidate profile for candidate roles
  if (data.role === "candidate" || data.role === "apprentice" || data.role === "skilled_worker") {
    const anonymousId = `Candidate #${store.nextAnonymousId}`;
    candidateStorage.create({
      userId,
      anonymousId,
      encryptedName: encrypt(data.name),
      encryptedEmail: encryptedEmail,
      profession: "",
      professionCategory: "",
      germanLevel: "A1",
      currentLocation: "",
      desiredLocation: [],
      skills: [],
      yearsOfExperience: 0,
      bio: "",
      status: "in_review",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  const session: AuthSession = { userId, role: data.role, locale: data.locale };
  setSession(session);
  return { success: true, session, user };
}

export function login(data: LoginData): AuthResult {
  const user = userStorage.getByEmail(data.email);
  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }
  if (!verifyPassword(data.password, user.passwordHash)) {
    return { success: false, error: "Invalid email or password" };
  }
  const session: AuthSession = { userId: user.id, role: user.role, locale: user.locale };
  setSession(session);
  return { success: true, session, user };
}

export function logout(): void {
  clearSession();
}

export function getDecryptedUser(userId: string): { name: string; email: string } | null {
  const user = userStorage.getById(userId);
  if (!user) return null;
  return {
    name: decrypt(user.name),
    email: decrypt(user.email),
  };
}
