"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { candidateStorage } from "@/lib/storage";
import type { CandidateProfile, GermanLevel } from "@/types";
import { toast } from "sonner";
import { LayoutDashboard, User, FileText, MessageSquare, Briefcase, Plus, X } from "lucide-react";

const GERMAN_LEVELS: GermanLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "native"];
const CATEGORIES = ["Engineering", "Healthcare", "IT", "Business", "Hospitality", "Trades", "Education", "Other"];
const GERMAN_CITIES = ["Berlin", "Munich", "Hamburg", "Frankfurt", "Stuttgart", "Cologne", "Düsseldorf", "Leipzig", "Dresden", "Anywhere"];

export default function CandidateProfile() {
  const locale = useLocale();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [form, setForm] = useState({
    profession: "",
    professionCategory: "",
    germanLevel: "A1" as GermanLevel,
    currentLocation: "",
    desiredLocation: [] as string[],
    skills: [] as string[],
    yearsOfExperience: 0,
    bio: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

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
    const prof = candidateStorage.getById(session.userId);
    if (prof) {
      setProfile(prof);
      setForm({
        profession: prof.profession,
        professionCategory: prof.professionCategory,
        germanLevel: prof.germanLevel,
        currentLocation: prof.currentLocation,
        desiredLocation: prof.desiredLocation,
        skills: prof.skills,
        yearsOfExperience: prof.yearsOfExperience,
        bio: prof.bio,
      });
    }
  }, [locale, router]);

  const handleSave = () => {
    const session = getSession();
    if (!session) return;
    setSaving(true);
    candidateStorage.update(session.userId, form);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile saved successfully!");
    }, 500);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));
  };

  const toggleLocation = (city: string) => {
    setForm((f) => ({
      ...f,
      desiredLocation: f.desiredLocation.includes(city)
        ? f.desiredLocation.filter((l) => l !== city)
        : [...f.desiredLocation, city],
    }));
  };

  return (
    <DashboardLayout navItems={navItems} title="My Profile" role="candidate">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Professional Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              Anonymous ID: <span className="font-mono text-blue-600">{profile?.anonymousId}</span>
            </p>
          </div>
          <Button variant="msc" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Professional Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Profession / Job Title</Label>
                <Input
                  placeholder="e.g. Registered Nurse, Software Developer"
                  value={form.profession}
                  onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.professionCategory} onValueChange={(v) => setForm((f) => ({ ...f, professionCategory: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>German Language Level</Label>
                <Select value={form.germanLevel} onValueChange={(v) => setForm((f) => ({ ...f, germanLevel: v as GermanLevel }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GERMAN_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={form.yearsOfExperience}
                  onChange={(e) => setForm((f) => ({ ...f, yearsOfExperience: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>About Me</Label>
              <Textarea
                placeholder="Brief description of your professional background, goals, and why you want to work in Germany..."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Location (Country/City)</Label>
              <Input
                placeholder="e.g. Manila, Philippines"
                value={form.currentLocation}
                onChange={(e) => setForm((f) => ({ ...f, currentLocation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred German Cities (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {GERMAN_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => toggleLocation(city)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      form.desiredLocation.includes(city)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader><CardTitle className="text-base">Skills & Qualifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g. Python, CNC Operation, Pediatrics)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button variant="outline" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-2.5 py-1 gap-1.5">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button variant="msc" onClick={handleSave} disabled={saving} className="w-full">
          {saving ? "Saving..." : "Save Profile Changes"}
        </Button>
      </div>
    </DashboardLayout>
  );
}
