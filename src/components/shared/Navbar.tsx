"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { getSession, logout } from "@/lib/auth";
import type { AuthSession } from "@/lib/auth";
import {
  Menu,
  X,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLanding = pathname === `/${locale}` || pathname === "/";
  const otherLocale = locale === "en" ? "de" : "en";

  const handleLogout = () => {
    logout();
    setSession(null);
    router.push(`/${locale}`);
  };

  const getDashboardLink = () => {
    if (!session) return `/${locale}/login`;
    const role = session.role;
    if (role === "admin") return `/${locale}/admin`;
    if (role === "employer") return `/${locale}/employer`;
    if (role === "recruiter") return `/${locale}/recruiter`;
    return `/${locale}/candidate`;
  };

  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isLanding && !scrolled
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-msc flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span
              className={cn(
                "font-bold text-lg transition-colors",
                isLanding && !scrolled ? "text-white" : "text-gray-900"
              )}
            >
              MyStep<span className={isLanding && !scrolled ? "text-amber-300" : "text-blue-600"}>Change</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}/jobs`}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                isLanding && !scrolled ? "text-white/90" : "text-gray-600"
              )}
            >
              {t("jobs")}
            </Link>
            <Link
              href={`/${locale}/employer`}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-600",
                isLanding && !scrolled ? "text-white/90" : "text-gray-600"
              )}
            >
              {t("forEmployers")}
            </Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={switchLocale}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-all hover:bg-white/10",
                isLanding && !scrolled
                  ? "text-white/90 border-white/30"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              {otherLocale.toUpperCase()}
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border transition-all",
                    isLanding && !scrolled
                      ? "text-white border-white/30 hover:bg-white/10"
                      : "text-gray-700 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="capitalize">{session.role.replace("_", " ")}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <Link
                      href={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t("dashboard")}
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href={`/${locale}/login`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      isLanding && !scrolled ? "text-white hover:bg-white/10" : ""
                    )}
                  >
                    {t("login")}
                  </Button>
                </Link>
                <Link href={`/${locale}/register`}>
                  <Button size="sm" variant="msc">
                    {t("register")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={cn(
              "md:hidden p-2 rounded-md",
              isLanding && !scrolled ? "text-white" : "text-gray-700"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link href={`/${locale}/jobs`} className="block text-sm text-gray-700 py-2">
            {t("jobs")}
          </Link>
          <Link href={`/${locale}/employer`} className="block text-sm text-gray-700 py-2">
            {t("forEmployers")}
          </Link>
          <hr />
          <button onClick={switchLocale} className="flex items-center gap-2 text-sm text-gray-600 py-2">
            <Globe className="w-4 h-4" />
            Switch to {otherLocale.toUpperCase()}
          </button>
          {session ? (
            <>
              <Link href={getDashboardLink()} className="flex items-center gap-2 text-sm text-gray-700 py-2">
                <LayoutDashboard className="w-4 h-4" />
                {t("dashboard")}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 py-2">
                <LogOut className="w-4 h-4" />
                {t("logout")}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link href={`/${locale}/login`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  {t("login")}
                </Button>
              </Link>
              <Link href={`/${locale}/register`} className="flex-1">
                <Button size="sm" variant="msc" className="w-full">
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
