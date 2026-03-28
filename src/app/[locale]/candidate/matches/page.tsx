"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { candidateStorage, jobStorage } from "@/lib/storage";
import { getTopMatches } from "@/lib/matching";
import { formatCurrency } from "@/lib/utils";
import type { JobListing, Match } from "@/types";
import {
  LayoutDashboard, User, FileText, MessageSquare, Briefcase,
  MapPin, Languages, TrendingUp, Lock, Star
} from "lucide-react";

export default function CandidateMatches() {
  const locale = useLocale();
  const router = useRouter();
  const [matches, setMatches] = useState<{ job: JobListing; match: Match }[]>([]);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: "Dashboard", href: `/${locale}/candidate`, icon: LayoutDashboard },
    { label: "My Profile", href: `/${locale}/candidate/profile`, icon: User },
    { label: "Documents", href: `/${locale}/candidate/documents`, icon: FileText },
    { label: "Messages", href: `/${locale}/candidate/messages`, icon: MessageSquare },
    { label: "Job Matches", href: `/${locale}/candidate/matches`, icon: Briefcase },
  ];

  useEffect(() => {
    const session = getSession();
    if (!session || !["candidate", "apprentice", "skilled_worker"].includes(session.role)) {
      router.push(`/${locale}/login`);
      return;
    }
    const profile = candidateStorage.getById(session.userId);
    if (profile) {
      const jobs = jobStorage.getAll();
      const topMatches = getTopMatches(profile, jobs, 20);
      const enriched = topMatches
        .map((m) => ({ job: jobs.find((j) => j.id === m.jobId)!, match: m }))
        .filter((m) => m.job);
      setMatches(enriched);
    }
    setLoading(false);
  }, [locale, router]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Possible Match";
    return "Partial Match";
  };

  return (
    <DashboardLayout navItems={navItems} title="Job Matches" role="candidate">
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Job Matches</h2>
          <p className="text-sm text-gray-500 mt-1">
            Based on your profession, German level, and location preferences. Company names are shown anonymously until placement.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading matches...</div>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Matches Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Complete your profile with your profession, German level, and location preferences to see matching jobs.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map(({ job, match }) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-500">{job.anonymousCompany}</span>
                            <span className="text-gray-300">·</span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${getScoreColor(match.score)}`}>
                          {match.score}%
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="info" className="gap-1">
                          <Languages className="w-3 h-3" />
                          German {job.germanLevelRequired}+
                        </Badge>
                        <Badge variant="secondary">{job.professionCategory}</Badge>
                        {job.salaryMin && (
                          <Badge variant="outline">
                            {formatCurrency(job.salaryMin, locale)} – {formatCurrency(job.salaryMax || job.salaryMin * 1.3, locale)}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {getScoreLabel(match.score)}
                          </span>
                          <span>{match.score}% match</span>
                        </div>
                        <Progress value={match.score} className="h-1.5" />
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  {job.requirements.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Requirements:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requirements.map((req) => (
                          <span key={req} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">{req}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    Company details and contact information are revealed only when you reach "Placed" status.
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
