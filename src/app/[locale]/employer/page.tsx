"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth";
import { candidateStorage, jobStorage, commissionStorage } from "@/lib/storage";
import { formatDate, formatCurrency, nanoid } from "@/lib/utils";
import type { CandidateProfile, JobListing, GermanLevel } from "@/types";
import { toast } from "sonner";
import {
  LayoutDashboard, Users, Briefcase, FileText, Plus,
  MapPin, Languages, Lock, Shield, Building2, TrendingUp,
  Eye, CheckCircle
} from "lucide-react";

const CATEGORIES = ["Engineering", "Healthcare", "IT", "Business", "Hospitality", "Trades", "Education", "Other"];
const GERMAN_LEVELS: GermanLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "native"];

const STATUS_COLORS = {
  in_review: "warning",
  active: "info",
  matched: "purple",
  interview: "success",
  placed: "success",
} as const;

export default function EmployerDashboard() {
  const locale = useLocale();
  const router = useRouter();
  const [employerId, setEmployerId] = useState("");
  const [myJobs, setMyJobs] = useState<JobListing[]>([]);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    profession: "",
    professionCategory: "Engineering",
    location: "Berlin",
    germanLevelRequired: "B1" as GermanLevel,
    salaryMin: "",
    salaryMax: "",
    requirements: "",
  });

  const navItems = [
    { label: "Dashboard", href: `/${locale}/employer`, icon: LayoutDashboard },
    { label: "Candidate Pool", href: `/${locale}/employer`, icon: Users },
    { label: "My Jobs", href: `/${locale}/employer`, icon: Briefcase },
  ];

  const loadData = (empId: string) => {
    const jobs = jobStorage.getByEmployerId(empId);
    setMyJobs(jobs);
    const allCandidates = candidateStorage.getAll().filter((c) => c.status !== "in_review");
    setCandidates(allCandidates);
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }
    if (session.role !== "employer" && session.role !== "admin") {
      if (session.role === "candidate" || session.role === "apprentice" || session.role === "skilled_worker") {
        router.push(`/${locale}/candidate`);
      } else if (session.role === "recruiter") {
        router.push(`/${locale}/recruiter`);
      }
      return;
    }
    setEmployerId(session.userId);
    loadData(session.userId);
  }, [locale, router]);

  const postJob = () => {
    if (!jobForm.title || !jobForm.description || !jobForm.profession) {
      toast.error("Please fill in required fields");
      return;
    }
    const job: JobListing = {
      id: nanoid(),
      employerId,
      title: jobForm.title,
      company: "Your Company",
      anonymousCompany: `Company #${Math.floor(200 + Math.random() * 300)}`,
      description: jobForm.description,
      requirements: jobForm.requirements.split("\n").filter(Boolean),
      profession: jobForm.profession,
      professionCategory: jobForm.professionCategory,
      location: jobForm.location,
      germanLevelRequired: jobForm.germanLevelRequired,
      salaryMin: jobForm.salaryMin ? parseInt(jobForm.salaryMin) : undefined,
      salaryMax: jobForm.salaryMax ? parseInt(jobForm.salaryMax) : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    jobStorage.create(job);
    setPostDialogOpen(false);
    loadData(employerId);
    toast.success("Job listing posted successfully!");
    setJobForm({ title: "", description: "", profession: "", professionCategory: "Engineering", location: "Berlin", germanLevelRequired: "B1", salaryMin: "", salaryMax: "", requirements: "" });
  };

  const stats = [
    { label: "Active Job Listings", value: myJobs.filter((j) => j.isActive).length, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { label: "Active Candidates", value: candidates.filter((c) => c.status === "active").length, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Matched Candidates", value: candidates.filter((c) => c.status === "matched").length, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: "Placed This Year", value: candidates.filter((c) => c.status === "placed").length, icon: CheckCircle, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Employer Dashboard" role="employer" roleColor="bg-green-600">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employer Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your job listings and review anonymized candidate profiles</p>
          </div>
          <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="msc">
                <Plus className="w-4 h-4 mr-2" />
                Post Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a New Job Listing</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Job Title *</Label>
                    <Input placeholder="e.g. Registered Nurse, Software Developer" value={jobForm.title} onChange={(e) => setJobForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Profession *</Label>
                    <Input placeholder="e.g. Nurse, Developer" value={jobForm.profession} onChange={(e) => setJobForm((f) => ({ ...f, profession: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={jobForm.professionCategory} onValueChange={(v) => setJobForm((f) => ({ ...f, professionCategory: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input placeholder="City in Germany" value={jobForm.location} onChange={(e) => setJobForm((f) => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Minimum German Level</Label>
                    <Select value={jobForm.germanLevelRequired} onValueChange={(v) => setJobForm((f) => ({ ...f, germanLevelRequired: v as GermanLevel }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{GERMAN_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Salary Min (€/year)</Label>
                    <Input type="number" placeholder="35000" value={jobForm.salaryMin} onChange={(e) => setJobForm((f) => ({ ...f, salaryMin: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Salary Max (€/year)</Label>
                    <Input type="number" placeholder="55000" value={jobForm.salaryMax} onChange={(e) => setJobForm((f) => ({ ...f, salaryMax: e.target.value }))} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Job Description *</Label>
                    <Textarea placeholder="Describe the role, responsibilities, and what makes it attractive..." value={jobForm.description} onChange={(e) => setJobForm((f) => ({ ...f, description: e.target.value }))} rows={4} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Requirements (one per line)</Label>
                    <Textarea placeholder="3+ years experience&#10;German B2&#10;Team player" value={jobForm.requirements} onChange={(e) => setJobForm((f) => ({ ...f, requirements: e.target.value }))} rows={3} />
                  </div>
                </div>
                <Button variant="msc" className="w-full" onClick={postJob}>Post Job Listing</Button>
              </div>
            </DialogContent>
          </Dialog>
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
          <TabsList className="mb-4">
            <TabsTrigger value="candidates">Candidate Pool ({candidates.length})</TabsTrigger>
            <TabsTrigger value="jobs">My Job Listings ({myJobs.length})</TabsTrigger>
          </TabsList>

          {/* Candidate Pool */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Anonymized Candidate Pool
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                    <Lock className="w-3.5 h-3.5" />
                    Profiles anonymized until placement
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {candidates.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No active candidates yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {candidates.map((c) => (
                      <div key={c.userId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-bold text-xs">{c.anonymousId.split("#")[1]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-gray-900 text-sm">{c.anonymousId}</span>
                            <Badge variant={STATUS_COLORS[c.status] as "warning" | "info" | "purple" | "success"} className="text-xs">
                              {c.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{c.profession || "Profession not set"}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Languages className="w-3 h-3" />
                              German {c.germanLevel}
                            </span>
                            {c.desiredLocation.length > 0 && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {c.desiredLocation.slice(0, 2).join(", ")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {c.status === "placed" ? (
                            <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                              Contact released
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Lock className="w-3 h-3" />
                              Contact locked
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Jobs */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  My Job Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myJobs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No jobs posted yet</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setPostDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myJobs.map((job) => (
                      <div key={job.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{job.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                              <span>·</span>
                              <Languages className="w-3 h-3" />
                              German {job.germanLevelRequired}+
                              {job.salaryMin && (
                                <>
                                  <span>·</span>
                                  <span>{formatCurrency(job.salaryMin, locale)}–{formatCurrency(job.salaryMax || job.salaryMin, locale)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant={job.isActive ? "success" : "secondary"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Privacy Shield */}
        <Card className="border-green-100 bg-green-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Employer Privacy Policy</p>
                <p className="text-sm text-green-700 mt-1">
                  All candidate profiles shown here are anonymized. You will only see personal details (name, contact, CV) after a candidate reaches "Placed" status. This ensures fair, bias-free candidate evaluation in compliance with GDPR.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
