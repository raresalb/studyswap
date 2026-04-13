import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Sparkles,
  Star,
  Users,
  Wallet,
  ArrowRight,
  CheckCircle,
  Coins,
  Shield,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-xl gradient-text">StudySwap</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Funcționalități</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">Cum funcționează</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Credite</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimoniale</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link href="/login">Intră în cont</Link></Button>
            <Button variant="gradient" asChild><Link href="/register">Înregistrează-te gratuit</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto text-center relative">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            🎓 Platforma #1 pentru studenți din România
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Studiezi mai smart,{" "}
            <span className="gradient-text">câștigi real</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            StudySwap conectează studenți din toată România. Schimbi materiale de studiu,
            oferi tutoriat, aplici la joburi și folosești AI — totul într-un singur loc.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="gradient" size="xl" asChild>
              <Link href="/register" className="gap-2">
                Începe gratuit <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link href="/login">Intră în cont</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            {[
              { value: "12,000+", label: "Studenți activi" },
              { value: "45,000+", label: "Materiale" },
              { value: "€120K+", label: "Câștiguri utilizatori" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tot ce ai nevoie, într-o platformă
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              De la materiale de studiu la joburi și AI, StudySwap are tot ce îți trebuie pentru succes academic și profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Marketplace Materiale",
                description: "Cumpără și vinde notițe, rezumate, cursuri PDF. Câștigă credite pentru fiecare descărcare.",
                color: "text-violet-600",
                bg: "bg-violet-50 dark:bg-violet-950/30",
              },
              {
                icon: GraduationCap,
                title: "Tutoriat Peer-to-Peer",
                description: "Sesiuni live sau înregistrate cu tutori verificați. Programare ușoară, plată în credite.",
                color: "text-blue-600",
                bg: "bg-blue-50 dark:bg-blue-950/30",
              },
              {
                icon: Coins,
                title: "Sistem de Credite",
                description: "Câștigă credite prin contribuții și retrage-i ca bani reali. 500 credite = 15€ retragere.",
                color: "text-yellow-600",
                bg: "bg-yellow-50 dark:bg-yellow-950/30",
              },
              {
                icon: Briefcase,
                title: "Joburi & Internshipuri",
                description: "Oportunități de angajare direct din platforma ta. Companii top din România caută studenți.",
                color: "text-green-600",
                bg: "bg-green-50 dark:bg-green-950/30",
              },
              {
                icon: Sparkles,
                title: "Asistent AI",
                description: "Rezumă documente, generează quiz-uri, primește ajutor personalizat de la Claude AI.",
                color: "text-pink-600",
                bg: "bg-pink-50 dark:bg-pink-950/30",
              },
              {
                icon: Users,
                title: "Comunitate Activă",
                description: "Forum pe domenii, sistem de follow, chat direct și notificări în timp real.",
                color: "text-indigo-600",
                bg: "bg-indigo-50 dark:bg-indigo-950/30",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="card-hover border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cum funcționează</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Creează-ți contul", desc: "Înregistrare gratuită cu email sau Google în sub 2 minute.", icon: Zap },
              { step: "2", title: "Contribuie și câștigă", desc: "Uploadează materiale, oferă tutoriat și câștigă credite pentru fiecare contribuție.", icon: Coins },
              { step: "3", title: "Retrage sau cheltuiește", desc: "Folosește creditele pentru materiale, tutori, sau retrage-i ca bani în cont.", icon: Wallet },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Pasul {item.step}</div>
                  <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing / Credits */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pachete de Credite</h2>
            <p className="text-muted-foreground">Cumpără credite pentru acces premium la materiale și tutori</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: "Starter", credits: 100, price: 5, features: ["100 credite", "Acces materiale de bază", "1-2 descărcări"] },
              { name: "Pro", credits: 500, price: 20, popular: true, features: ["500 credite", "Acces materiale premium", "5-10 descărcări", "2 sesiuni tutoriat"] },
              { name: "Elite", credits: 1000, price: 35, features: ["1000 credite", "Acces complet", "Sesiuni tutoriat nelimitate", "Prioritate support"] },
            ].map((pkg) => (
              <Card key={pkg.name} className={`relative card-hover ${pkg.popular ? "border-primary shadow-lg scale-105" : ""}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-blue-500 text-white border-0">Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-xl mb-2">{pkg.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{pkg.price}€</span>
                    <span className="text-muted-foreground"> / {pkg.credits} credite</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm text-left">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={pkg.popular ? "gradient" : "outline"} className="w-full" asChild>
                    <Link href="/register">Cumpără acum</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Shield className="w-4 h-4 inline mr-1" />
            Plăți securizate prin Stripe. Poți retrage creditele câștigate ca bani reali.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce spun studenții</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Alexandra M.", uni: "UPB, Informatică", text: "Am câștigat 200€ în prima lună din materialele mele de Algoritmi. StudySwap e genial!", rating: 5 },
              { name: "Radu P.", uni: "ASE, Finanțe", text: "Găsesc tutori pentru orice materie în câteva minute. Mi-a salvat sesiunea de examene.", rating: 5 },
              { name: "Ioana T.", uni: "UMF Cluj, Medicină", text: "Materialele de Anatomie de pe platformă sunt incredibil de bune. Merită fiecare credit!", rating: 5 },
            ].map((t) => (
              <Card key={t.name} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.uni}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-violet-600 to-blue-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Alătură-te a 12,000+ studenți
          </h2>
          <p className="text-violet-100 text-lg mb-8 max-w-xl mx-auto">
            Înregistrare gratuită. Fără card de credit. Primești 50 credite bonus la prima înregistrare.
          </p>
          <Button size="xl" variant="outline" className="bg-white text-violet-600 hover:bg-white/90 border-0" asChild>
            <Link href="/register" className="gap-2">
              Înregistrează-te gratuit <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SS</span>
                </div>
                <span className="font-bold gradient-text">StudySwap</span>
              </div>
              <p className="text-sm text-muted-foreground">Platforma educațională și socială pentru studenții din România.</p>
            </div>
            {[
              { title: "Platformă", links: ["Marketplace", "Tutoriat", "Joburi", "AI Asistent"] },
              { title: "Companie", links: ["Despre noi", "Blog", "Cariere", "Contact"] },
              { title: "Legal", links: ["Termeni și condiții", "Politică GDPR", "Cookie Policy", "Confidențialitate"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © 2026 StudySwap. Toate drepturile rezervate. Construit cu ❤️ pentru studenți.
          </div>
        </div>
      </footer>
    </div>
  );
}
