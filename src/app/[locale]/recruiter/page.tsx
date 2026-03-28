"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusStepper } from "@/components/shared/StatusStepper";
import { getSession, getDecryptedUser } from "@/lib/auth";
import { candidateStorage, commissionStorage, jobStorage, userStorage } from "@/lib/storage";
import { formatDate, formatCurrency, nanoid } from "@/lib/utils";
import { decrypt } from "@/lib/encryption";
import type { CandidateProfile, Commission, CandidateStatus } from "@/types";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, DollarSign, TrendingUp, CheckCircle,
  Clock, ArrowRight, AlertCircle, FileText, Euro
} from "lucide-react";

const STATUSES: CandidateStatus[] = ["in_review", "active", "matched", "interview", "placed"];

const STATUS_LABELS: Record<CandidateStatus, string> = {
  in_review: "Under Review",
  active: "Active",
  matched: "Matched",
  interview: "Interview",
  placed: "Placed",
};

export default function RecruiterDashboard() {
  const locale = useLocale();
  const router = useRouter();
  const [recruiterId, setRecruiterId] = useState("");
  const [myCandidates, setMyCandidates] = useState<(CandidateProfile & { decryptedName?: string; decryptedEmail?: string })[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  const navItems = [
    { label: "Dashboard", href: `/${locale}/recruiter`, icon: LayoutDashboard },
    { label: "My Candidates", href: `/${locale}/recruiter`, icon: Users },
    { label: "Commissions", href: `/${locale}/recruiter`, icon: DollarSign },
  ];

  const loadData = (recId: string) => {
    const candidates = candidateStorage.getByRecruiterId(recId);
    const enriched = candidates.map((c) => {
      const user = userStorage.getById(c.userId);
      return {
        ...c,
        decryptedName: user ? decrypt(user.name) : "Unknown",
        decryptedEmail: user ? decrypt(user.email) : "Unknown",
      };
    });
    setMyCandidates(enriched);

    const comms = commissionStorage.getByRecruiterId(recId);
    setCommissions(comms);
  };

  const assignSelf = (candidateId: string) => {
    candidateStorage.update(candidateId, { recruiterId });
    loadData(recruiterId);
    toast.success("Candidate assigned to you!");
  };

  const updateStatus = (candidateUserId: string, status: CandidateStatus) => {
    candidateStorage.updateStatus(candidateUserId, status);
    if (status === "placed") {
      toast.success("Status updated to Placed! Commission triggered automatically.");
    } else {
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
    }
    loadData(recruiterId);
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }
    if (session.role !== "recruiter" && session.role !== "admin") {
      router.push(`/${locale}/candidate`);
      return;
    }
    setRecruiterId(session.userId);

    // Show all active candidates for assignment
    const allActive = candidateStorage.getAll()
      .filter((c) => c.status !== "in_review" && !c.recruiterId)
      .slice(0, 5);

    loadData(session.userId);
  }, [locale, router]);

  const totalEarnings = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingEarnings = commissions
    .filter((c) => c.status !== "paid")
    .reduce((sum, c) => sum + c.amount, 0);

  const stats = [
    { label: "Total Candidates", value: myCandidates.length, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active", value: myCandidates.filter((c) => c.status === "active").length, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "Placed", value: myCandidates.filter((c) => c.status === "placed").length, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Total Earnings", value: formatCurrency(totalEarnings, locale), icon: Euro, color: "text-amber-600 bg-amber-50" },
  ];

  // Unassigned active candidates for potential assignment
  const unassigned = candidateStorage.getAll().filter((c) => c.status === "active" && !c.recruiterId);

  return (
    <DashboardLayout navItems={navItems} title="Recruiter Dashboard" role="recruiter" roleColor="bg-purple-600">
      <div className="max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your candidates, track placements, and monitor commissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="candidates">
          <TabsList>
            <TabsTrigger value="candidates">My Candidates ({myCandidates.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({unassigned.length})</TabsTrigger>
            <TabsTrigger value="commissions">Commissions ({commissions.length})</TabsTrigger>
          </TabsList>

          {/* My Candidates */}
          <TabsContent value="candidates" className="space-y-4 mt-4">
            {myCandidates.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No candidates assigned yet</p>
                  <p className="text-xs mt-1">Check the "Available" tab to pick up candidates</p>
                </CardContent>
              </Card>
            ) : (
              myCandidates.map((c) => (
                <Card key={c.userId}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{c.decryptedName}</span>
                          <Badge variant="secondary" className="font-mono text-xs">{c.anonymousId}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{c.decryptedEmail}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {c.profession} · German {c.germanLevel} · {c.currentLocation || "Location not set"}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Select value={c.status} onValueChange={(v) => updateStatus(c.userId, v as CandidateStatus)}>
                          <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {STATUS_LABELS[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <StatusStepper status={c.status} locale={locale} />

                    {c.status === "placed" && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        Placement complete! Commission of {formatCurrency(3500, locale)} has been triggered.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Available Candidates */}
          <TabsContent value="available" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Active Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                {unassigned.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No unassigned candidates available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unassigned.map((c) => (
                      <div key={c.userId} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-sm text-blue-600">{c.anonymousId}</span>
                            <Badge variant="info" className="text-xs">{c.status}</Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {c.profession || "No profession set"} · German {c.germanLevel} · {c.yearsOfExperience}y exp
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => assignSelf(c.userId)}>
                          Assign to Me
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions */}
          <TabsContent value="commissions" className="mt-4 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Pending", value: formatCurrency(pendingEarnings, locale), color: "text-amber-600", count: commissions.filter((c) => c.status === "pending").length },
                { label: "In Progress", value: formatCurrency(commissions.filter((c) => c.status === "in_progress").reduce((s, c) => s + c.amount, 0), locale), color: "text-blue-600", count: commissions.filter((c) => c.status === "in_progress").length },
                { label: "Paid", value: formatCurrency(totalEarnings, locale), color: "text-green-600", count: commissions.filter((c) => c.status === "paid").length },
              ].map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-sm text-gray-500">{item.label} ({item.count})</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {commissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No commissions yet</p>
                  <p className="text-xs mt-1">Commissions are triggered automatically when a candidate reaches "Placed" status</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {commissions.map((comm) => {
                    const candidate = myCandidates.find((c) => c.userId === comm.candidateId);
                    return (
                      <div key={comm.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-gray-900">{candidate?.decryptedName || "Candidate"}</span>
                            <span className="text-gray-400 font-mono text-xs">{candidate?.anonymousId}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Triggered: {formatDate(comm.triggeredAt, locale)}
                            {comm.paidAt && ` · Paid: ${formatDate(comm.paidAt, locale)}`}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-gray-900">{formatCurrency(comm.amount, locale)}</div>
                          <Badge
                            variant={comm.status === "paid" ? "success" : comm.status === "in_progress" ? "info" : "warning"}
                            className="text-xs mt-1"
                          >
                            {comm.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
