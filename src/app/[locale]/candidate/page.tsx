"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession, getDecryptedUser } from "@/lib/auth";
import { candidateStorage, documentStorage, messageStorage, jobStorage } from "@/lib/storage";
import { getTopMatches } from "@/lib/matching";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { CandidateProfile, JobListing } from "@/types";
import Link from "next/link";
import {
  LayoutDashboard, User, FileText, MessageSquare, Briefcase,
  TrendingUp, CheckCircle, Clock, AlertCircle, Shield, Lock
} from "lucide-react";

const STATUS_CONFIG = {
  in_review: { color: "warning", label: "Under Review", icon: Clock },
  active: { color: "info", label: "Active", icon: CheckCircle },
  matched: { color: "purple", label: "Matched", icon: TrendingUp },
  interview: { color: "success", label: "Interview", icon: User },
  placed: { color: "success", label: "Placed ✓", icon: CheckCircle },
} as const;

export default function CandidateDashboard() {
  const locale = useLocale();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [topMatches, setTopMatches] = useState<{ job: JobListing; score: number }[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (!session || !["candidate", "apprentice", "skilled_worker"].includes(session.role)) {
      router.push(`/${locale}/login`);
      return;
    }

    const decrypted = getDecryptedUser(session.userId);
    if (decrypted) setUserName(decrypted.name);

    const prof = candidateStorage.getById(session.userId);
    if (prof) {
      setProfile(prof);
      const jobs = jobStorage.getAll();
      const matches = getTopMatches(prof, jobs, 3);
      setTopMatches(matches.map((m) => ({ job: jobs.find((j) => j.id === m.jobId)!, score: m.score })).filter((m) => m.job));
    }

    const docs = documentStorage.getByUserId(session.userId);
    setDocCount(docs.length);

    const msgs = messageStorage.getByCandidateId(session.userId);
    setUnreadMessages(msgs.filter((m) => !m.isRead && m.sender === "msc_admin").length);

    setLoading(false);
  }, [locale, router]);

  const navItems = [
    { label: "Dashboard", href: `/${locale}/candidate`, icon: LayoutDashboard },
    { label: "My Profile", href: `/${locale}/candidate/profile`, icon: User },
    { label: "Documents", href: `/${locale}/candidate/documents`, icon: FileText, badge: docCount },
    { label: "Messages", href: `/${locale}/candidate/messages`, icon: MessageSquare, badge: unreadMessages },
    { label: "Job Matches", href: `/${locale}/candidate/matches`, icon: Briefcase },
  ];

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Candidate Dashboard" role="candidate">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const statusConf = profile ? STATUS_CONFIG[profile.status] : null;
  const StatusIcon = statusConf?.icon || Clock;

  return (
    <DashboardLayout navItems={navItems} title="Candidate Dashboard" role="candidate">
      <div className="space-y-6 max-w-5xl">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back, {userName || "Candidate"} 👋</h2>
            <p className="text-gray-500 text-sm mt-1">
              Your anonymous ID: <span className="font-mono font-medium text-blue-600">{profile?.anonymousId}</span>
            </p>
          </div>
          {profile && statusConf && (
            <Badge variant={statusConf.color as "warning" | "info" | "purple" | "success"} className="px-4 py-2 text-sm">
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConf.label}
            </Badge>
          )}
        </div>

        {/* Status Stepper */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <StatusStepper status={profile.status} locale={locale} />
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700">
                  {profile.status === "in_review" && "Your profile is being reviewed by our MSC team. We'll activate it once verified."}
                  {profile.status === "active" && "Your profile is live and visible to our recruiter network. Keep it updated!"}
                  {profile.status === "matched" && "Great news! You've been matched with employers. Our recruiters will be in touch."}
                  {profile.status === "interview" && "You have been selected for an interview. Our team will contact you with details."}
                  {profile.status === "placed" && "Congratulations! You have been placed. Your contact details have been shared with your employer."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Documents", value: docCount, icon: FileText, color: "text-blue-600 bg-blue-50", link: `/${locale}/candidate/documents` },
            { label: "Job Matches", value: topMatches.length, icon: Briefcase, color: "text-purple-600 bg-purple-50", link: `/${locale}/candidate/matches` },
            { label: "Messages", value: unreadMessages, icon: MessageSquare, color: "text-amber-600 bg-amber-50", link: `/${locale}/candidate/messages` },
            { label: "Profile", value: profile?.profession ? "Complete" : "Incomplete", icon: User, color: "text-green-600 bg-green-50", link: `/${locale}/candidate/profile` },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Top Job Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topMatches.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Complete your profile to see matches</p>
                  <Link href={`/${locale}/candidate/profile`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      Update Profile
                    </Button>
                  </Link>
                </div>
              ) : (
                topMatches.map(({ job, score }) => (
                  <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.anonymousCompany} · {job.location}</div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${score >= 70 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                        {score}%
                      </div>
                    </div>
                  </div>
                ))
              )}
              {topMatches.length > 0 && (
                <Link href={`/${locale}/candidate/matches`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">View All Matches</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="border-green-100 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <Shield className="w-4 h-4" />
                Your Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Lock, text: "Personal data encrypted with AES-256" },
                { icon: Shield, text: "Name & email visible only to MSC Admin" },
                { icon: User, text: `Employers see you as "${profile?.anonymousId || "Candidate #XXXX"}"` },
                { icon: CheckCircle, text: "Contact details shared only when Placed" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-green-700">
                    <Icon className="w-4 h-4 flex-shrink-0 text-green-600" />
                    {item.text}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
