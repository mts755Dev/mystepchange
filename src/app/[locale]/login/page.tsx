"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { login } from "@/lib/auth";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Zap } from "lucide-react";

const DEMO_LOGINS = [
  { label: "Admin", email: "admin@mystepchange.de", password: "demo1234", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
  { label: "Candidate", email: "candidate@demo.de", password: "demo1234", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { label: "Apprentice", email: "apprentice@demo.de", password: "demo1234", color: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" },
  { label: "Skilled Worker", email: "skilled@demo.de", password: "demo1234", color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" },
  { label: "Employer", email: "employer@demo.de", password: "demo1234", color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" },
  { label: "Recruiter", email: "recruiter@demo.de", password: "demo1234", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
];

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const doLogin = (e?: string, p?: string) => {
    const loginEmail = e ?? email;
    const loginPassword = p ?? password;
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const result = login({ email: loginEmail, password: loginPassword });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error || "Login failed");
      return;
    }

    toast.success(t("loginSuccess"));
    const role = result.session!.role;
    if (role === "admin") router.push(`/${locale}/admin`);
    else if (role === "employer") router.push(`/${locale}/employer`);
    else if (role === "recruiter") router.push(`/${locale}/recruiter`);
    else router.push(`/${locale}/candidate`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin();
  };

  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    doLogin(demoEmail, demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl gradient-msc flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <CardTitle className="text-2xl">{t("login")}</CardTitle>
            <CardDescription>
              {t("noAccount")}{" "}
              <Link href={`/${locale}/register`} className="text-blue-600 hover:underline font-medium">
                {t("registerLink")}
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Quick Demo Access */}
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs font-semibold text-amber-800 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Quick Demo Access — click any role to log in instantly
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {DEMO_LOGINS.map((demo) => (
                  <button
                    key={demo.label}
                    onClick={() => quickLogin(demo.email, demo.password)}
                    disabled={loading}
                    className={`text-xs px-2 py-1.5 rounded-md border font-medium transition-colors ${demo.color} disabled:opacity-50`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-2 text-center">All demo accounts use password: <code className="font-mono font-bold">demo1234</code></p>
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs text-gray-400">or log in with your account</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <Button type="submit" variant="msc" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : t("login")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
