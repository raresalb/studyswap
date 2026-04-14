"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLang } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n/translations";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import {
  BookOpen, Users, Briefcase, Brain, MessageSquare,
  Star, Globe, TrendingUp, Zap, ArrowRight, CheckCircle,
} from "lucide-react";

const stats = [
  { key: "hero.stats.students", value: "120K+" },
  { key: "hero.stats.materials", value: "45K+" },
  { key: "hero.stats.universities", value: "800+" },
  { key: "hero.stats.countries", value: "60+" },
];

const features = [
  {
    icon: BookOpen,
    titleEn: "Study Materials",
    descEn: "Upload and download PDFs, notes, and presentations. Earn credits for every download.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    titleEn: "Peer Tutoring",
    descEn: "Book 1-on-1 sessions with top students in your field. Learn from peers who just passed.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Briefcase,
    titleEn: "Jobs & Internships",
    descEn: "Find student-friendly jobs and internships. Companies post directly on the platform.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    titleEn: "AI Study Assistant",
    descEn: "Summarize documents, generate quizzes, and chat with an AI tutor powered by Claude.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: MessageSquare,
    titleEn: "Community Forum",
    descEn: "Connect with students worldwide. Ask questions, share tips, build your network.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    titleEn: "Credit Economy",
    descEn: "Earn real money by sharing knowledge. Withdraw your credits via bank transfer or PayPal.",
    color: "from-indigo-500 to-violet-500",
  },
];

const creditPackages = [
  { credits: 100, price: 5, popular: false },
  { credits: 500, price: 20, popular: true },
  { credits: 1000, price: 35, popular: false },
];

const testimonials = [
  {
    name: "Sarah M.",
    country: "🇩🇪 Germany",
    university: "TU Berlin",
    text: "StudySwap helped me pass my exams and earn €200 by sharing my notes. Incredible platform!",
    rating: 5,
  },
  {
    name: "Marco R.",
    country: "🇮🇹 Italy",
    university: "Politecnico di Milano",
    text: "Found my internship here and got tutored by a PhD student. This platform is a game changer.",
    rating: 5,
  },
  {
    name: "Anna K.",
    country: "🇵🇱 Poland",
    university: "AGH Kraków",
    text: "The AI quiz generator saved me during finals. Uploaded my syllabus and got perfect practice questions.",
    rating: 5,
  },
];

export default function LandingPage() {
  const { lang } = useLang();
  const tr = (key: string) => t(lang, key);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">SS</span>
              </div>
              <span className="font-bold text-lg gradient-text">StudySwap</span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{tr("nav.features")}</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">{tr("nav.pricing")}</a>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
                {tr("nav.login")}
              </Link>
              <Link href="/register" className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {tr("nav.register")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <Globe className="w-4 h-4" />
              {tr("hero.badge")}
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {tr("hero.title").split("\n")[0]}
              <br />
              <span className="gradient-text">{tr("hero.title").split("\n")[1]}</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {tr("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-semibold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25 text-lg">
                {tr("hero.cta.start")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-xl border border-border hover:bg-accent transition-colors text-lg">
                {tr("hero.cta.login")}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-2xl p-4">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{tr(stat.key)}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{tr("features.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{tr("features.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-6 card-hover">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.titleEn}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.descEn}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">Get started in minutes</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Users, title: "Create your account", desc: "Sign up as a student, company, or admin in seconds." },
              { step: "2", icon: BookOpen, title: "Upload or explore", desc: "Share your notes and browse thousands of study materials." },
              { step: "3", icon: TrendingUp, title: "Earn & grow", desc: "Collect credits, withdraw real money, land your dream job." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-violet-600 mb-1">STEP {item.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{tr("pricing.title")}</h2>
            <p className="text-xl text-muted-foreground">{tr("pricing.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {creditPackages.map((pkg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative bg-card border rounded-2xl p-6 text-center ${pkg.popular ? "border-violet-500 shadow-lg shadow-violet-500/10" : "border-border"}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="text-4xl font-bold gradient-text mb-1">{pkg.credits}</div>
                <div className="text-muted-foreground text-sm mb-4">{tr("common.credits")}</div>
                <div className="text-3xl font-bold mb-6">€{pkg.price}</div>
                <Link href="/register" className={`block w-full py-3 rounded-xl font-semibold transition-opacity ${pkg.popular ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white hover:opacity-90" : "bg-accent hover:bg-accent/80"}`}>
                  Get started
                </Link>
                <div className="mt-4 space-y-2">
                  {["Instant delivery", "Never expires", "Use for any feature"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by students worldwide</h2>
            <p className="text-xl text-muted-foreground">Join 120,000+ students already on StudySwap</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex mb-3">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{item.text}</p>
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.country} · {item.university}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-violet-600 to-blue-500 rounded-3xl p-12 text-white">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">Ready to study smarter?</h2>
            <p className="text-violet-100 mb-8 text-lg">Join thousands of students already using StudySwap.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-violet-600 font-bold px-8 py-4 rounded-xl hover:bg-violet-50 transition-colors text-lg">
              {tr("hero.cta.start")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">SS</span>
              </div>
              <span className="font-bold gradient-text">StudySwap</span>
            </div>
            <p className="text-sm text-muted-foreground">{tr("footer.tagline")}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">{tr("nav.login")}</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">{tr("nav.register")}</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} StudySwap. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
