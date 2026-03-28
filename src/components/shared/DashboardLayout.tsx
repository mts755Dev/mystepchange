"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSession, logout } from "@/lib/auth";
import { notificationStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
  role: string;
  roleColor?: string;
}

export function DashboardLayout({ children, navItems, title, role, roleColor = "bg-blue-600" }: DashboardLayoutProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (session) {
      const notifications = notificationStorage.getByUserId(session.userId);
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col transition-transform duration-300 shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${roleColor} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight">
                MyStep<span className="text-blue-600">Change</span>
              </div>
              <Badge variant="secondary" className="text-xs h-4 px-1.5 mt-0.5 capitalize">
                {role.replace("_", " ")}
              </Badge>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-semibold text-gray-800 text-sm">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
