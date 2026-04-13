/**
 * StudySwap — Database Seed
 * Run: npm run db:seed
 * Creates demo users, materials, jobs for development
 */

import { PrismaClient, UserRole, MaterialStatus, JobType, JobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding StudySwap database...");

  // ── Admin user ───────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@studyswap.ro" },
    update: {},
    create: {
      email: "admin@studyswap.ro",
      name: "Admin StudySwap",
      password: adminPassword,
      role: UserRole.ADMIN,
      credits: 9999,
      referralCode: "ADMIN01",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── Student users ────────────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("student123!", 12);

  const students = await Promise.all([
    db.user.upsert({
      where: { email: "ion.popescu@studyswap.ro" },
      update: {},
      create: {
        email: "ion.popescu@studyswap.ro",
        name: "Ion Popescu",
        password: studentPassword,
        role: UserRole.STUDENT,
        university: "Universitatea Politehnica București",
        faculty: "Automatică și Calculatoare",
        studyYear: 3,
        specialization: "Calculatoare și IT",
        bio: "Pasionat de programare și inteligență artificială. Ofer tutoriat la Algoritmi și Structuri de Date.",
        credits: 450,
        totalEarned: 650,
        reputationPoints: 120,
        level: 3,
        referralCode: "ION001",
      },
    }),
    db.user.upsert({
      where: { email: "maria.ionescu@studyswap.ro" },
      update: {},
      create: {
        email: "maria.ionescu@studyswap.ro",
        name: "Maria Ionescu",
        password: studentPassword,
        role: UserRole.STUDENT,
        university: "Academia de Studii Economice",
        faculty: "Economie Generală",
        studyYear: 2,
        bio: "Studentă la ASE, interesată de finanțe și marketing digital.",
        credits: 230,
        totalEarned: 380,
        reputationPoints: 75,
        level: 2,
        referralCode: "MAR001",
      },
    }),
    db.user.upsert({
      where: { email: "andrei.gheorghe@studyswap.ro" },
      update: {},
      create: {
        email: "andrei.gheorghe@studyswap.ro",
        name: "Andrei Gheorghe",
        password: studentPassword,
        role: UserRole.STUDENT,
        university: "Universitatea Babeș-Bolyai Cluj",
        faculty: "Matematică și Informatică",
        studyYear: 4,
        bio: "Absolvent aproape. Specialist în web development și machine learning.",
        credits: 820,
        totalEarned: 1200,
        reputationPoints: 210,
        level: 5,
        referralCode: "AND001",
      },
    }),
  ]);
  console.log(`✅ ${students.length} student users created`);

  // ── Company user ─────────────────────────────────────────────────────────────
  const companyPassword = await bcrypt.hash("company123!", 12);
  const company = await db.user.upsert({
    where: { email: "hr@techstartup.ro" },
    update: {},
    create: {
      email: "hr@techstartup.ro",
      name: "TechStartup România",
      password: companyPassword,
      role: UserRole.COMPANY,
      companyName: "TechStartup România SRL",
      companyWebsite: "https://techstartup.ro",
      companyDescription: "Startup tech din București, construim produse SaaS pentru piața din Europa de Est.",
      credits: 100,
      referralCode: "TECH01",
    },
  });
  console.log("✅ Company user:", company.email);

  // ── Materials ────────────────────────────────────────────────────────────────
  const materials = await Promise.all([
    db.material.upsert({
      where: { id: "mat-001" },
      update: {},
      create: {
        id: "mat-001",
        title: "Rezumat Analiză Matematică — Limite și Derivate",
        description: "Rezumat complet pentru examenul de Analiză Matematică. Cuprinde: limite de funcții, continuitate, derivabilitate, regula lui L'Hôpital, seria Taylor.",
        category: "Matematică",
        subject: "Analiză Matematică",
        university: "Universitatea Politehnica București",
        studyYear: 1,
        language: "ro",
        fileType: "PDF",
        tags: ["matematică", "analiză", "limite", "derivate"],
        isPremium: false,
        creditCost: 0,
        status: MaterialStatus.APPROVED,
        downloadCount: 234,
        viewCount: 891,
        avgRating: 4.7,
        authorId: students[0].id,
      },
    }),
    db.material.upsert({
      where: { id: "mat-002" },
      update: {},
      create: {
        id: "mat-002",
        title: "Algoritmi și Structuri de Date — Curs Complet",
        description: "Note de curs complete pentru ASD. Include: sortări (QuickSort, MergeSort, HeapSort), arbori (AVL, roșu-negru), grafuri (BFS, DFS, Dijkstra, Floyd-Warshall), programare dinamică.",
        category: "Informatică",
        subject: "Algoritmi și Structuri de Date",
        university: "Universitatea Politehnica București",
        faculty: "Automatică și Calculatoare",
        studyYear: 2,
        language: "ro",
        fileType: "PDF",
        tags: ["algoritmi", "programare", "grafuri", "sortare"],
        isPremium: true,
        creditCost: 30,
        status: MaterialStatus.APPROVED,
        downloadCount: 156,
        viewCount: 543,
        avgRating: 4.9,
        authorId: students[2].id,
      },
    }),
    db.material.upsert({
      where: { id: "mat-003" },
      update: {},
      create: {
        id: "mat-003",
        title: "Macroeconomie — Rezumate pentru Examen",
        description: "Rezumate structurate pentru examenul de Macroeconomie: PIB, inflație, șomaj, politici monetare și fiscale, modele IS-LM, teoria creșterii economice.",
        category: "Economie",
        subject: "Macroeconomie",
        university: "Academia de Studii Economice",
        studyYear: 1,
        language: "ro",
        fileType: "PDF",
        tags: ["economie", "macro", "PIB", "inflație"],
        isPremium: false,
        creditCost: 0,
        status: MaterialStatus.APPROVED,
        downloadCount: 89,
        viewCount: 312,
        avgRating: 4.3,
        authorId: students[1].id,
      },
    }),
    db.material.upsert({
      where: { id: "mat-004" },
      update: {},
      create: {
        id: "mat-004",
        title: "React + TypeScript — Ghid Practic pentru Începători",
        description: "Ghid complet pentru a învăța React cu TypeScript din zero. Include: hooks (useState, useEffect, useContext), componente, routing cu Next.js, state management cu Zustand.",
        category: "Informatică",
        subject: "Programare Web",
        studyYear: 2,
        language: "ro",
        fileType: "PDF",
        tags: ["react", "typescript", "web", "frontend", "javascript"],
        isPremium: true,
        creditCost: 50,
        status: MaterialStatus.APPROVED,
        downloadCount: 412,
        viewCount: 1203,
        avgRating: 4.8,
        authorId: students[2].id,
      },
    }),
    db.material.upsert({
      where: { id: "mat-005" },
      update: {},
      create: {
        id: "mat-005",
        title: "Fizică Mecanică — Formule și Exerciții Rezolvate",
        description: "Colecție de formule esențiale și exerciții rezolvate pentru Mecanica din Fizică: cinematică, dinamică, lucru mecanic, energie, impuls, oscilații.",
        category: "Fizică",
        subject: "Fizică — Mecanică",
        studyYear: 1,
        language: "ro",
        fileType: "PDF",
        tags: ["fizică", "mecanică", "formule", "exerciții"],
        isPremium: false,
        creditCost: 0,
        status: MaterialStatus.APPROVED,
        downloadCount: 178,
        viewCount: 567,
        avgRating: 4.5,
        authorId: students[0].id,
      },
    }),
  ]);
  console.log(`✅ ${materials.length} materials created`);

  // ── Tutoring sessions ────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);

  const sessions = await Promise.all([
    db.tutoringSession.upsert({
      where: { id: "ses-001" },
      update: {},
      create: {
        id: "ses-001",
        title: "Tutoriat Algoritmi — Grafuri și BFS/DFS",
        description: "Sesiune de 60 minute pentru clarificarea conceptelor de grafuri: BFS, DFS, detecție cicluri, componente conexe. Rezolvăm exerciții practice.",
        subject: "Algoritmi și Structuri de Date",
        scheduledAt: tomorrow,
        durationMin: 60,
        creditCost: 25,
        status: "PENDING",
        tutorId: students[2].id,
      },
    }),
    db.tutoringSession.upsert({
      where: { id: "ses-002" },
      update: {},
      create: {
        id: "ses-002",
        title: "Analiză Matematică — Integrala Riemann",
        description: "Pregătire pentru examen. Vom lucra serii de exerciții de integrare: substituție, integrare prin părți, integrale improprii.",
        subject: "Analiză Matematică",
        scheduledAt: nextWeek,
        durationMin: 90,
        creditCost: 35,
        status: "PENDING",
        tutorId: students[0].id,
      },
    }),
  ]);
  console.log(`✅ ${sessions.length} tutoring sessions created`);

  // ── Jobs ─────────────────────────────────────────────────────────────────────
  const jobs = await Promise.all([
    db.job.upsert({
      where: { id: "job-001" },
      update: {},
      create: {
        id: "job-001",
        title: "Junior React Developer",
        description: "Căutăm un Junior React Developer entuziast să se alăture echipei noastre. Vei lucra la produse SaaS inovatoare, alături de seniori care te vor mentora.",
        requirements: "- Cunoștințe de JavaScript/TypeScript\n- Experiență cu React (hooks, componente)\n- Cunoștințe de bază HTML/CSS\n- Git și lucrul în echipă\n- Studii în informatică sau domeniu similar",
        benefits: "- Salariu competitiv: 1500-2500 RON net\n- Mentoring din partea seniorilor\n- Flexibilitate program (hibrid)\n- Abonament gym\n- Laptop performant",
        salary: "1500-2500 RON net",
        type: JobType.INTERNSHIP,
        status: JobStatus.ACTIVE,
        location: "București",
        isRemote: false,
        domain: "IT & Software",
        isFeatured: true,
        viewCount: 234,
        companyId: company.id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    db.job.upsert({
      where: { id: "job-002" },
      update: {},
      create: {
        id: "job-002",
        title: "Marketing Digital — Internship",
        description: "Internship în echipa de marketing digital. Vei gestiona campanii pe rețele sociale, vei crea conținut și vei analiza metrici de performanță.",
        requirements: "- Pasiune pentru marketing digital\n- Cunoaștere platforme social media\n- Cunoștințe de bază Canva sau Adobe\n- Abilități de comunicare scrisă\n- Disponibilitate 20-30h/săptămână",
        benefits: "- Stipendiu 800 RON/lună\n- Certificare internship\n- Experiență reală\n- Posibilitate angajare după absolvire",
        salary: "800 RON stipendiu",
        type: JobType.INTERNSHIP,
        status: JobStatus.ACTIVE,
        location: "Cluj-Napoca",
        isRemote: true,
        domain: "Marketing & PR",
        viewCount: 89,
        companyId: company.id,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    }),
    db.job.upsert({
      where: { id: "job-003" },
      update: {},
      create: {
        id: "job-003",
        title: "Data Analyst Part-time",
        description: "Oportunitate pentru studenți la statistică, informatică sau economie. Vei analiza date de business, vei crea dashboarduri și rapoarte pentru managementul companiei.",
        requirements: "- Excel avansat (pivot tables, VLOOKUP)\n- Python sau R de bază\n- SQL cunoștințe\n- Gândire analitică\n- Student în an final sau masterand",
        benefits: "- 25 RON/oră\n- Program flexibil (4-6h/zi)\n- Remote 100%\n- Proiecte reale de business",
        salary: "25 RON/oră",
        type: JobType.PART_TIME,
        status: JobStatus.ACTIVE,
        location: "Remote",
        isRemote: true,
        domain: "IT & Software",
        viewCount: 156,
        companyId: company.id,
      },
    }),
  ]);
  console.log(`✅ ${jobs.length} jobs created`);

  // ── Forum posts ──────────────────────────────────────────────────────────────
  const posts = await Promise.all([
    db.forumPost.upsert({
      where: { id: "post-001" },
      update: {},
      create: {
        id: "post-001",
        title: "Cum am trecut examenul de Algoritmi cu 10 — strategia mea",
        content: "Salut! Am vrut să împărtășesc experiența mea din sesiunea trecută. Am luat 10 la Algoritmi după ce am eșuat în primul semestru.\n\nCe m-a ajutat:\n1. Rezolvat leetcode zilnic (minim 1 problemă Easy/Medium)\n2. Înțeles algoritmii, nu memorat\n3. Implementat fiecare algoritm de la zero\n4. Grupuri de studiu cu colegii\n\nSunt fericit să ajut pe oricine are dificultăți la ASD!",
        category: "Informatică",
        tags: ["algoritmi", "examen", "sfaturi", "studiu"],
        status: "ACTIVE",
        viewCount: 234,
        likeCount: 45,
        authorId: students[2].id,
      },
    }),
    db.forumPost.upsert({
      where: { id: "post-002" },
      update: {},
      create: {
        id: "post-002",
        title: "Recomandări cărți pentru Analiză Matematică (UPB)",
        content: "Căutați recomandări de cărți/resurse pentru Analiză Matematică la UPB? Iată lista mea:\n\n📚 Cărți recomandate:\n- Fihtenholt — Curs de calcul diferențial și integral\n- Apostol — Mathematical Analysis\n- 3Blue1Brown pe YouTube (Essence of Calculus)\n\nCe altceva mai folosiți?",
        category: "Matematică",
        tags: ["matematică", "cărți", "resurse", "UPB"],
        status: "ACTIVE",
        viewCount: 178,
        likeCount: 32,
        authorId: students[0].id,
      },
    }),
  ]);
  console.log(`✅ ${posts.length} forum posts created`);

  console.log("\n🎉 Seed complet! Conturi demo:");
  console.log("   Admin:   admin@studyswap.ro / admin123!");
  console.log("   Student: ion.popescu@studyswap.ro / student123!");
  console.log("   Student: andrei.gheorghe@studyswap.ro / student123!");
  console.log("   Companie: hr@techstartup.ro / company123!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
