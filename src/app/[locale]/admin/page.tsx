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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSession } from "@/lib/auth";
import { userStorage, candidateStorage, documentStorage, commissionStorage, jobStorage, messageStorage } from "@/lib/storage";
import { decrypt } from "@/lib/encryption";
import { formatDate, formatCurrency, nanoid } from "@/lib/utils";
import type { User, CandidateProfile, Document, Commission, CandidateStatus, CommissionStatus, Message } from "@/types";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, FileText, DollarSign, Briefcase,
  MessageSquare, CheckCircle, Clock, Shield, TrendingUp,
  Send, AlertCircle, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CandidateStatus, string> = {
  in_review: "Under Review",
  active: "Active",
  matched: "Matched",
  interview: "Interview",
  placed: "Placed",
};

export default function AdminPanel() {
  const locale = useLocale();
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [candidates, setCandidates] = useState<(CandidateProfile & { decryptedName?: string; decryptedEmail?: string })[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const navItems = [
    { label: "Admin Dashboard", href: `/${locale}/admin`, icon: LayoutDashboard },
    { label: "Users", href: `/${locale}/admin`, icon: Users },
    { label: "Documents", href: `/${locale}/admin`, icon: FileText },
    { label: "Candidates", href: `/${locale}/admin`, icon: TrendingUp },
    { label: "Commissions", href: `/${locale}/admin`, icon: DollarSign },
    { label: "Messages", href: `/${locale}/admin`, icon: MessageSquare },
  ];

  const loadData = () => {
    const allUsers = userStorage.getAll().filter((u) => u.role !== "admin");
    setUsers(allUsers);

    const allCandidates = candidateStorage.getAll().map((c) => {
      const user = userStorage.getById(c.userId);
      return {
        ...c,
        decryptedName: user ? decrypt(user.name) : "Unknown",
        decryptedEmail: user ? decrypt(user.email) : "Unknown",
      };
    });
    setCandidates(allCandidates);

    const allDocs = documentStorage.getAll();
    setDocuments(allDocs);

    const allComms = commissionStorage.getAll();
    setCommissions(allComms);

    // Load all messages
    const candidateIds = [...new Set(allCandidates.map((c) => c.userId))];
    const msgs: Message[] = [];
    candidateIds.forEach((id) => {
      msgs.push(...messageStorage.getByCandidateId(id));
    });
    setMessages(msgs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()));
  };

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      router.push(`/${locale}/login`);
      return;
    }
    setAdminId(session.userId);
    loadData();
  }, [locale, router]);

  const verifyDocument = (docId: string) => {
    documentStorage.verify(docId, adminId);
    loadData();
    toast.success("Document verified!");
  };

  const updateCandidateStatus = (userId: string, status: CandidateStatus) => {
    candidateStorage.updateStatus(userId, status);
    loadData();
    if (status === "placed") {
      toast.success("Status set to Placed! Commission triggered automatically.");
    } else {
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
    }
  };

  const updateCommissionStatus = (id: string, status: CommissionStatus) => {
    commissionStorage.updateStatus(id, status);
    loadData();
    toast.success(`Commission marked as ${status}`);
  };

  const sendReply = (candidateId: string) => {
    if (!replyText.trim()) return;
    const msg: Message = {
      id: nanoid(),
      candidateId,
      sender: "msc_admin",
      content: replyText.trim(),
      isRead: false,
      sentAt: new Date().toISOString(),
    };
    messageStorage.send(msg);
    setReplyText("");
    loadData();
    toast.success("Reply sent!");
  };

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Candidates", value: candidates.length, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Pending Docs", value: documents.filter((d) => !d.isVerified).length, icon: FileText, color: "text-amber-600 bg-amber-50" },
    { label: "Open Commissions", value: commissions.filter((c) => c.status !== "paid").length, icon: DollarSign, color: "text-green-600 bg-green-50" },
  ];

  const pendingDocs = documents.filter((d) => !d.isVerified);
  const candidateMessages = messages.filter((m) => m.sender === "candidate");
  const selectedCandidateMsgs = selectedCandidateId
    ? messages.filter((m) => m.candidateId === selectedCandidateId).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
    : [];

  return (
    <DashboardLayout navItems={navItems} title="Admin Panel" role="admin" roleColor="bg-red-600">
      <div className="max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Control Panel</h2>
          <p className="text-sm text-gray-500 mt-1">Full access to user management, document verification, and commission oversight</p>
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
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="candidates">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="documents">
              Documents
              {pendingDocs.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">{pendingDocs.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="messages">
              Messages
              {candidateMessages.filter((m) => !m.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-2 h-4 px-1.5 text-xs">
                  {candidateMessages.filter((m) => !m.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  All Candidates — Full Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No candidates registered yet</div>
                ) : (
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <div key={c.userId} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{c.decryptedName}</span>
                              <Badge variant="secondary" className="font-mono text-xs">{c.anonymousId}</Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              {c.decryptedEmail} · {c.profession || "No profession"} · German {c.germanLevel}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              Status: <span className="font-medium text-gray-600">{STATUS_LABELS[c.status]}</span>
                              {c.recruiterId && ` · Recruiter assigned`}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Select value={c.status} onValueChange={(v) => updateCandidateStatus(c.userId, v as CandidateStatus)}>
                              <SelectTrigger className="w-44 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(["in_review", "active", "matched", "interview", "placed"] as CandidateStatus[]).map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs">{STATUS_LABELS[s]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Verification Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No documents uploaded yet</div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => {
                      const owner = candidates.find((c) => c.userId === doc.userId);
                      return (
                        <div key={doc.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                          <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {owner?.decryptedName || "Unknown"} · {owner?.anonymousId} · {formatDate(doc.uploadedAt, locale)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {doc.isVerified ? (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-700 border-green-200 hover:bg-green-50"
                                onClick={() => verifyDocument(doc.id)}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Verify
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Commission Oversight
                </CardTitle>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No commissions yet</div>
                ) : (
                  <div className="space-y-3">
                    {commissions.map((comm) => {
                      const candidate = candidates.find((c) => c.userId === comm.candidateId);
                      return (
                        <div key={comm.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate?.decryptedName || "Unknown"}{" "}
                              <span className="font-mono text-xs text-gray-400">{candidate?.anonymousId}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Triggered: {formatDate(comm.triggeredAt, locale)}
                              {comm.paidAt && ` · Paid: ${formatDate(comm.paidAt, locale)}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-bold text-gray-900">{formatCurrency(comm.amount, locale)}</span>
                            <Select value={comm.status} onValueChange={(v) => updateCommissionStatus(comm.id, v as CommissionStatus)}>
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                                <SelectItem value="in_progress" className="text-xs">In Progress</SelectItem>
                                <SelectItem value="paid" className="text-xs">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: "400px" }}>
              {/* Thread List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Candidate Threads</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea style={{ maxHeight: "400px" }}>
                    {candidates
                      .filter((c) => messages.some((m) => m.candidateId === c.userId))
                      .map((c) => {
                        const unread = messages.filter((m) => m.candidateId === c.userId && !m.isRead && m.sender === "candidate").length;
                        return (
                          <button
                            key={c.userId}
                            onClick={() => setSelectedCandidateId(c.userId)}
                            className={cn(
                              "w-full p-3 text-left flex items-center gap-3 border-b hover:bg-gray-50 transition-colors",
                              selectedCandidateId === c.userId && "bg-blue-50"
                            )}
                          >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 text-xs font-bold">{c.decryptedName?.[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900 truncate">{c.decryptedName}</div>
                              <div className="text-xs text-gray-400 font-mono">{c.anonymousId}</div>
                            </div>
                            {unread > 0 && (
                              <Badge variant="destructive" className="h-5 px-1.5 text-xs">{unread}</Badge>
                            )}
                          </button>
                        );
                      })}
                    {!candidates.some((c) => messages.some((m) => m.candidateId === c.userId)) && (
                      <div className="p-4 text-center text-gray-400 text-sm">No messages</div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat View */}
              <Card className="lg:col-span-2">
                {selectedCandidateId ? (
                  <>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        {candidates.find((c) => c.userId === selectedCandidateId)?.decryptedName} —{" "}
                        <span className="font-mono">{candidates.find((c) => c.userId === selectedCandidateId)?.anonymousId}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <ScrollArea style={{ maxHeight: "280px" }}>
                        <div className="space-y-2 pr-2">
                          {selectedCandidateMsgs.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-2", msg.sender === "msc_admin" ? "justify-end" : "justify-start")}>
                              <div className={cn(
                                "max-w-xs rounded-2xl px-3 py-2 text-sm",
                                msg.sender === "msc_admin"
                                  ? "bg-blue-600 text-white rounded-tr-sm"
                                  : "bg-gray-100 text-gray-900 rounded-tl-sm"
                              )}>
                                <p>{msg.content}</p>
                                <p className={cn("text-xs mt-1", msg.sender === "msc_admin" ? "text-blue-200" : "text-gray-400")}>
                                  {formatDate(msg.sentAt, locale)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2 pt-2 border-t">
                        <Textarea
                          placeholder="Reply to candidate..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                        <Button
                          variant="msc"
                          size="icon"
                          className="flex-shrink-0 self-end"
                          onClick={() => sendReply(selectedCandidateId)}
                          disabled={!replyText.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="flex items-center justify-center h-full py-12 text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Select a conversation</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Users (Decrypted View — Admin Only)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user) => {
                    const decryptedName = decrypt(user.name);
                    const decryptedEmail = decrypt(user.email);
                    return (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border text-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{decryptedName?.[0]}</span>
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{decryptedName}</span>
                          <span className="text-gray-400 ml-2 text-xs">{decryptedEmail}</span>
                        </div>
                        <Badge variant={
                          user.role === "employer" ? "info" :
                          user.role === "recruiter" ? "purple" :
                          "secondary"
                        } className="text-xs capitalize">
                          {user.role.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatDate(user.createdAt, locale)}</span>
                      </div>
                    );
                  })}
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-400">No users registered yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
