"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { register } from "@/lib/auth";
import type { UserRole } from "@/types";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: "candidate", label: "Candidate", desc: "Looking for work in Germany" },
  { value: "apprentice", label: "Apprentice", desc: "Seeking an Ausbildung / apprenticeship" },
  { value: "skilled_worker", label: "Skilled Worker", desc: "Qualified professional in my field" },
  { value: "employer", label: "Employer", desc: "Hiring international talent" },
  { value: "recruiter", label: "Recruiter", desc: "Managing placements & commissions" },
];

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetRole = searchParams.get("role") as UserRole | null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(presetRole || "candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (presetRole) setRole(presetRole);
  }, [presetRole]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error(t("errors.passwordTooShort"));
      return;
    }
    setLoading(true);
    const result = register({ name, email, password, role, locale: locale as "en" | "de" });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error || "Registration failed");
      return;
    }

    toast.success(t("registerSuccess"));
    if (role === "employer") router.push(`/${locale}/employer`);
    else if (role === "recruiter") router.push(`/${locale}/recruiter`);
    else router.push(`/${locale}/candidate`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl gradient-msc flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">M</span>
            </div>
            <CardTitle className="text-2xl">{t("register")}</CardTitle>
            <CardDescription>
              {t("hasAccount")}{" "}
              <Link href={`/${locale}/login`} className="text-blue-600 hover:underline font-medium">
                {t("loginLink")}
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Maria Schmidt"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t("role")}</Label>
                <div className="grid grid-cols-1 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                        role === r.value
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors ${
                        role === r.value ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      }`}>
                        {role === r.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.label}</div>
                        <div className="text-xs text-gray-500">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GDPR Notice */}
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">
                  Your personal data is encrypted with AES-256 and stored in EU servers in compliance with GDPR.
                </p>
              </div>

              <Button type="submit" variant="msc" className="w-full h-11" disabled={loading}>
                {loading ? "Creating account..." : t("register")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
