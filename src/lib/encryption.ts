// AES-256 encryption for personal data (GDPR compliance simulation)
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "msc-aes256-secure-key-2024-gdpr";

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[decryption error]";
  }
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password + "msc-salt-2024").toString();
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
