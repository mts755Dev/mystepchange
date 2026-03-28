import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Users, Zap, Globe, ArrowRight, CheckCircle,
  Star, TrendingUp, Lock, Stethoscope, Wrench, Computer,
  ChefHat, Building2, GraduationCap, MapPin, Quote,
} from "lucide-react";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("landing");

  const stats = [
    { value: "500+", label: t("hero.stats.jobs") },
    { value: "40+", label: t("hero.stats.countries") },
    { value: "1,200+", label: t("hero.stats.placements") },
    { value: "98%", label: t("hero.stats.satisfaction") },
  ];

  const steps = [
    { icon: Users, key: "register", color: "bg-blue-100 text-blue-700" },
    { icon: Zap, key: "match", color: "bg-purple-100 text-purple-700" },
    { icon: Shield, key: "review", color: "bg-green-100 text-green-700" },
    { icon: Star, key: "interview", color: "bg-amber-100 text-amber-700" },
    { icon: CheckCircle, key: "placed", color: "bg-emerald-100 text-emerald-700" },
  ];

  const features = [
    { icon: Lock, key: "privacy", color: "text-blue-600 bg-blue-50" },
    { icon: Shield, key: "anonymous", color: "text-green-600 bg-green-50" },
    { icon: Zap, key: "automated", color: "text-amber-600 bg-amber-50" },
    { icon: Globe, key: "multilingual", color: "text-purple-600 bg-purple-50" },
  ];

  const professions = [
    { icon: Wrench, name: "Engineering", count: "120+ jobs", color: "bg-blue-500" },
    { icon: Stethoscope, name: "Healthcare", count: "85+ jobs", color: "bg-red-500" },
    { icon: Computer, name: "IT & Tech", count: "200+ jobs", color: "bg-purple-500" },
    { icon: ChefHat, name: "Hospitality", count: "60+ jobs", color: "bg-amber-500" },
    { icon: Building2, name: "Business", count: "95+ jobs", color: "bg-green-500" },
    { icon: GraduationCap, name: "Apprenticeships", count: "140+ jobs", color: "bg-indigo-500" },
  ];

  const testimonials = [
    {
      name: "Anna K.",
      origin: "🇵🇭 Philippines → Berlin",
      role: "Registered Nurse",
      text: "MyStepChange handled everything — from document verification to my work permit. I started at Charité within 4 months.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
    },
    {
      name: "Carlos M.",
      origin: "🇧🇷 Brazil → Munich",
      role: "Software Developer",
      text: "The anonymized matching was genius. I got selected purely on my skills — no bias. Joined SAP and love it here.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    },
    {
      name: "Priya S.",
      origin: "🇮🇳 India → Frankfurt",
      role: "Mechatronics Engineer",
      text: "The 5-step status tracker kept me informed throughout. When I was placed, everything happened smoothly.",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-msc" />
        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
            alt="Frankfurt skyline Germany"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="outline" className="border-white/40 text-white bg-white/10 mb-6 px-4 py-1.5">
                <Shield className="w-3.5 h-3.5 mr-2" />
                {t("hero.badge")}
              </Badge>

              <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
                {t("hero.title")}
              </h1>

              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                {t("hero.subtitle")}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href={`/${locale}/jobs`}>
                  <Button size="lg" variant="solid-white" className="font-semibold px-8 h-12 text-base">
                    {t("hero.cta")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href={`/${locale}/register?role=employer`}>
                  <Button size="lg" variant="ghost-white" className="font-semibold px-8 h-12 text-base">
                    {t("hero.ctaEmployer")}
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-14 pt-8 border-t border-white/20">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image card */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                <Image
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=80"
                  alt="International professionals working in Germany"
                  width={700}
                  height={480}
                  className="object-cover w-full"
                />
                {/* Floating card */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Anna K. — Placed Successfully</p>
                      <p className="text-xs text-gray-500">Registered Nurse · Charité Berlin</p>
                    </div>
                    <Badge variant="success" className="ml-auto text-xs">Placed</Badge>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow-lg text-sm">
                🇩🇪 GDPR Compliant
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 font-medium">
            <span>Trusted by professionals from:</span>
            {["🇵🇭 Philippines", "🇮🇳 India", "🇧🇷 Brazil", "🇵🇱 Poland", "🇲🇦 Morocco", "🇹🇷 Turkey", "🇻🇳 Vietnam"].map((c) => (
              <span key={c} className="text-gray-600">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">Process</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("howItWorks.title")}</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-1 gap-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const stepKey = step.key as "register" | "match" | "review" | "interview" | "placed";
                return (
                  <div key={step.key} className="flex items-start gap-4 p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <h3 className="font-semibold text-gray-900">{t(`howItWorks.steps.${stepKey}.title`)}</h3>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{t(`howItWorks.steps.${stepKey}.desc`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&q=80"
                alt="Team working together in an office"
                width={700}
                height={580}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="font-semibold text-lg">Transparent at every step</p>
                <p className="text-sm text-blue-200 mt-1">Track your progress from first application to your first day at work in Germany.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="success" className="mb-4">Why MSC</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{t("features.title")}</h2>
              <div className="space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  const key = feature.key as "privacy" | "anonymous" | "automated" | "multilingual";
                  return (
                    <div key={feature.key} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{t(`features.${key}.title`)}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{t(`features.${key}.desc`)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-md col-span-2">
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=700&q=80"
                  alt="Data privacy and security"
                  width={700}
                  height={300}
                  className="object-cover w-full h-48"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80"
                  alt="Medical professional"
                  width={400}
                  height={250}
                  className="object-cover w-full h-40"
                />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"
                  alt="Engineer at work"
                  width={400}
                  height={250}
                  className="object-cover w-full h-40"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professions */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">Sectors</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("professions.title")}</h2>
            <p className="text-lg text-gray-500">{t("professions.subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {professions.map((prof) => {
              const Icon = prof.icon;
              return (
                <Link href={`/${locale}/jobs`} key={prof.name}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 ${prof.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{prof.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{prof.count}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Germany image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1400&q=80"
              alt="Germany skyline and business district"
              width={1400}
              height={400}
              className="object-cover w-full h-64"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center px-10">
              <div>
                <h3 className="text-white text-2xl font-bold mb-2">Germany is waiting for you</h3>
                <p className="text-blue-200 text-sm max-w-md">Over 1.8 million vacancies in Germany. Your skills are in demand — let MSC connect you.</p>
                <Link href={`/${locale}/jobs`} className="mt-4 inline-block">
                  <Button variant="solid-white" className="font-semibold mt-3">
                    Browse All Jobs
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="purple" className="mb-4">Success Stories</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real People, Real Placements</h2>
            <p className="text-lg text-gray-500">Hear from professionals who made their step change to Germany</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-blue-200 mb-4" />
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{t.text}</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                      <p className="text-xs text-blue-600 font-medium">{t.origin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-msc relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80"
            alt="Working professionals"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-blue-900/30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready for Your Step Change?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of international professionals building their careers in Germany.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href={`/${locale}/register`}>
              <Button size="lg" variant="solid-white" className="font-semibold px-10 h-12">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href={`/${locale}/jobs`}>
              <Button size="lg" variant="ghost-white" className="font-semibold px-10 h-12">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
