"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jobStorage } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import type { JobListing, GermanLevel } from "@/types";
import Link from "next/link";
import {
  Search, MapPin, Languages, Briefcase, Filter, X,
  SlidersHorizontal, Euro, Building2
} from "lucide-react";

const CATEGORIES = ["All", "Engineering", "Healthcare", "IT", "Business", "Hospitality", "Trades", "Education", "Other"];
const GERMAN_LEVELS: GermanLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2", "native"];
const CITIES = ["All", "Berlin", "Munich", "Hamburg", "Frankfurt", "Stuttgart", "Cologne", "Düsseldorf", "Leipzig", "Walldorf"];

export default function JobsPage() {
  const locale = useLocale();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filtered, setFiltered] = useState<JobListing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [germanLevel, setGermanLevel] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const allJobs = jobStorage.getAll();
    setJobs(allJobs);
    setFiltered(allJobs);
  }, []);

  useEffect(() => {
    let result = jobs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || j.profession.toLowerCase().includes(q)
      );
    }
    if (category !== "All") {
      result = result.filter((j) => j.professionCategory === category);
    }
    if (location !== "All") {
      result = result.filter((j) => j.location === location);
    }
    if (germanLevel !== "All") {
      const levels = ["A1", "A2", "B1", "B2", "C1", "C2", "native"];
      const minIdx = levels.indexOf(germanLevel);
      result = result.filter((j) => levels.indexOf(j.germanLevelRequired) <= minIdx);
    }
    setFiltered(result);
  }, [search, category, location, germanLevel, jobs]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setGermanLevel("All");
  };

  const hasFilters = search || category !== "All" || location !== "All" || germanLevel !== "All";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="gradient-msc pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-2">Find Jobs in Germany</h1>
          <p className="text-blue-100 mb-6">Browse {jobs.length} open positions from German employers</p>

          {/* Search Bar */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by job title, profession, or keyword..."
                className="pl-10 h-12 bg-white text-gray-900 border-0 shadow-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="h-12 px-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasFilters && <span className="ml-2 w-5 h-5 bg-amber-400 text-gray-900 text-xs rounded-full flex items-center justify-center font-bold">!</span>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`w-64 flex-shrink-0 space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">Clear all</button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category</label>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          category === cat ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Location</label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">My German Level</label>
                  <Select value={germanLevel} onValueChange={setGermanLevel}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Any level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Any level</SelectItem>
                      {GERMAN_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {filtered.length} job{filtered.length !== 1 ? "s" : ""} found
                {hasFilters && <span className="text-blue-600 ml-1">(filtered)</span>}
              </p>
              <button
                className="lg:hidden flex items-center gap-2 text-sm text-blue-600"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>

            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs found</h3>
                  <p className="text-sm text-gray-500 mb-4">Try adjusting your search filters</p>
                  <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filtered.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {job.title}
                            </h3>
                            {job.salaryMin && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 flex-shrink-0">
                                <Euro className="w-3.5 h-3.5" />
                                {Math.round(job.salaryMin / 1000)}k–{Math.round((job.salaryMax || job.salaryMin * 1.3) / 1000)}k
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>{job.anonymousCompany}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant="info" className="gap-1 text-xs">
                              <Languages className="w-3 h-3" />
                              German {job.germanLevelRequired}+
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{job.professionCategory}</Badge>
                            {job.requirements.slice(0, 2).map((req) => (
                              <Badge key={req} variant="outline" className="text-xs">{req}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <p className="text-xs text-gray-400">Company details revealed after placement</p>
                        <Link href={`/${locale}/register`}>
                          <Button size="sm" variant="msc">Apply Now</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
