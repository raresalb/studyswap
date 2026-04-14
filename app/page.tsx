"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { useLang } from "@/components/i18n/language-provider";
import { t } from "@/lib/i18n/translations";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Logo, LogoIcon } from "@/components/logo";
import {
  BookOpen, Users, Briefcase, Brain, MessageSquare,
  Star, TrendingUp, ArrowRight, CheckCircle,
  Sparkles,
} from "lucide-react";

// Reusable animated section reveal
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  { icon: BookOpen, title: "Study Materials", desc: "Upload PDFs, slides, and notes. Earn credits for every download from students worldwide.", color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { icon: Users, title: "Peer Tutoring", desc: "Book live 1-on-1 sessions with top students. Learn from peers who just aced the same exam.", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: Briefcase, title: "Jobs & Internships", desc: "Student-first job board. Companies post directly. Apply with one click.", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: Brain, title: "AI Study Assistant", desc: "Summarize any document, generate quizzes, and get instant explanations — powered by Claude.", color: "from-orange-500 to-amber-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { icon: MessageSquare, title: "Global Community", desc: "Connect with students from 60+ countries. Ask questions, collaborate, build lasting connections.", color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-950/30" },
  { icon: TrendingUp, title: "Real Earnings", desc: "Turn your knowledge into cash. Withdraw credits as real money via bank transfer or PayPal.", color: "from-indigo-500 to-violet-500", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
];

const stats = [
  { value: "120K+", key: "hero.stats.students" },
  { value: "45K+", key: "hero.stats.materials" },
  { value: "800+", key: "hero.stats.universities" },
  { value: "60+", key: "hero.stats.countries" },
];

const plans = [
  { credits: 100, price: 5, perCredit: "0.05" },
  { credits: 500, price: 20, perCredit: "0.04", popular: true },
  { credits: 1000, price: 35, perCredit: "0.035" },
];

const testimonials = [
  { name: "Sarah M.", flag: "🇩🇪", uni: "TU Berlin", text: "I earned €200 just by sharing my lecture notes. This platform is incredible.", stars: 5 },
  { name: "Marco R.", flag: "🇮🇹", uni: "Politecnico Milano", text: "Got my internship here and found a PhD tutor. Game changer for my career.", stars: 5 },
  { name: "Anna K.", flag: "🇵🇱", uni: "AGH Kraków", text: "The AI quiz generator is unreal. Uploaded my syllabus, got perfect practice questions in seconds.", stars: 5 },
];

export default function LandingPage() {
  const { lang } = useLang();
  const tr = (key: string) => t(lang, key);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14">
        <div className="absolute inset-0 bg-[#fafafa]/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5" />
        <div className="relative max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <Logo iconSize={28} textClassName="text-base" />
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              {tr("nav.login")}
            </Link>
            <Link href="/register" className="text-sm font-semibold bg-foreground text-background px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity">
              {tr("nav.register")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-20 pb-16 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-100/60 via-transparent to-transparent dark:from-violet-900/20 pointer-events-none" />
        <motion.div className="absolute top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-400/25 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-400/15 rounded-full blur-[80px]" />
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-black/8 dark:border-white/10 text-sm font-medium px-4 py-1.5 rounded-full mb-8 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-muted-foreground">{tr("hero.badge")}</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            {tr("hero.title").split("\n")[0]}
            <br />
            <span className="gradient-text">{tr("hero.title").split("\n")[1]}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {tr("hero.subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
          >
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-7 py-3.5 rounded-full text-base shadow-lg"
              >
                {tr("hero.cta.start")}
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="inline-flex items-center gap-2 bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 font-semibold px-7 py-3.5 rounded-full text-base shadow-sm"
              >
                {tr("hero.cta.login")}
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.key}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="bg-white dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-2xl p-4 shadow-sm"
              >
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{tr(s.key)}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 border-2 border-black/20 dark:border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-black/30 dark:bg-white/30 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{tr("features.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{tr("features.subtitle")}</p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeUp key={i} delay={i * 0.07}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="group bg-white dark:bg-white/5 border border-black/6 dark:border-white/8 rounded-3xl p-6 h-full cursor-default"
                  >
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-5 bg-white dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Up and running in minutes</h2>
          </FadeUp>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: "01", title: "Create your account", desc: "Sign up as a student, company, or admin. Takes under 30 seconds." },
              { n: "02", title: "Explore or contribute", desc: "Browse thousands of study materials or upload your own notes to start earning." },
              { n: "03", title: "Earn & succeed", desc: "Collect credits, land internships, get tutored, and withdraw real money." },
            ].map((step, idx) => (
              <FadeUp key={idx} delay={idx * 0.12}>
                <div className="text-center">
                  <div className="text-6xl font-bold gradient-text opacity-30 mb-3">{step.n}</div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{tr("pricing.title")}</h2>
            <p className="text-xl text-muted-foreground">{tr("pricing.subtitle")}</p>
          </FadeUp>
          <div className="grid sm:grid-cols-3 gap-4">
            {plans.map((p, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`relative rounded-3xl p-6 text-center h-full flex flex-col ${p.popular
                    ? "bg-foreground text-background shadow-2xl shadow-black/20"
                    : "bg-white dark:bg-white/5 border border-black/8 dark:border-white/10"}`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      Best value
                    </div>
                  )}
                  <div className={`text-5xl font-bold mb-1 ${p.popular ? "text-background" : "gradient-text"}`}>{p.credits}</div>
                  <div className={`text-sm mb-5 ${p.popular ? "text-background/60" : "text-muted-foreground"}`}>{tr("common.credits")}</div>
                  <div className={`text-4xl font-bold mb-6 ${p.popular ? "" : ""}`}>€{p.price}</div>
                  <Link href="/register" className="mt-auto">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`w-full py-3 rounded-2xl font-semibold text-sm ${p.popular
                        ? "bg-white text-foreground hover:bg-white/90"
                        : "bg-foreground text-background hover:opacity-80"} transition-opacity`}
                    >
                      Get started
                    </motion.div>
                  </Link>
                  <div className="mt-5 space-y-2">
                    {["Instant delivery", "Never expires", "All features included"].map((f) => (
                      <div key={f} className={`flex items-center gap-2 text-xs ${p.popular ? "text-background/70" : "text-muted-foreground"}`}>
                        <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${p.popular ? "text-emerald-400" : "text-emerald-500"}`} />
                        {f}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-5 bg-white dark:bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Students love it</h2>
          </FadeUp>
          <div className="grid sm:grid-cols-3 gap-4">
            {testimonials.map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-white dark:bg-white/5 border border-black/6 dark:border-white/8 rounded-3xl p-6 h-full"
                >
                  <div className="flex mb-4">
                    {Array.from({ length: item.stars }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-5">{item.text}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {item.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.flag} {item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.uni}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-12 text-white text-center"
            >
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
              <div className="relative">
                <LogoIcon size={48} className="mx-auto mb-5 opacity-90" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-3">Ready to study smarter?</h2>
                <p className="text-violet-100 mb-8 text-lg">Join 120,000+ students already on StudySwap.</p>
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-8 py-4 rounded-full text-lg shadow-lg"
                  >
                    {tr("hero.cta.start")} <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 dark:border-white/5 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo iconSize={26} textClassName="text-sm" />
          <p className="text-sm text-muted-foreground">{tr("footer.tagline")}</p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">{tr("nav.login")}</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">{tr("nav.register")}</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-black/5 dark:border-white/5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} StudySwap · All rights reserved
        </div>
      </footer>
    </div>
  );
}
