import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/cloudinary";
import { z } from "zod";
import { MaterialType } from "@prisma/client";

const schema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(1000),
  category: z.string().min(1),
  subject: z.string().min(2),
  university: z.string().optional(),
  faculty: z.string().optional(),
  studyYear: z.string().optional(),
  language: z.string().default("ro"),
  isPremium: z.boolean().default(false),
  creditCost: z.number().min(0).max(500),
  tags: z.array(z.string()).optional(),
});

function getFileType(mimeType: string): MaterialType {
  if (mimeType.includes("pdf")) return MaterialType.PDF;
  if (mimeType.includes("word") || mimeType.includes("docx")) return MaterialType.DOCX;
  if (mimeType.includes("presentation") || mimeType.includes("ppt")) return MaterialType.PPT;
  if (mimeType.includes("image")) return MaterialType.IMAGE;
  return MaterialType.OTHER;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Neautorizat" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dataStr = formData.get("data") as string;

    if (!file) return NextResponse.json({ message: "Fișier lipsă" }, { status: 400 });
    if (!dataStr) return NextResponse.json({ message: "Date lipsă" }, { status: 400 });

    const data = schema.parse(JSON.parse(dataStr));

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadFile(buffer, {
      folder: "materials",
      resourceType: "auto",
    });

    const material = await db.material.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        subject: data.subject,
        university: data.university,
        faculty: data.faculty,
        studyYear: data.studyYear ? parseInt(data.studyYear) : undefined,
        language: data.language,
        isPremium: data.isPremium,
        creditCost: data.isPremium ? data.creditCost : 0,
        fileUrl: url,
        fileType: getFileType(file.type),
        tags: data.tags ?? [],
        authorId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, materialId: material.id });
  } catch (error) {
    console.error("Material upload error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Date invalide", errors: error.errors }, { status: 422 });
    }
    return NextResponse.json({ message: "Eroare internă" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 12;

  const where = {
    status: "APPROVED" as const,
    ...(category && { category }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [materials, total] = await Promise.all([
    db.material.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      include: { author: { select: { name: true, image: true } } },
    }),
    db.material.count({ where }),
  ]);

  return NextResponse.json({ materials, total, page, pages: Math.ceil(total / limit) });
}
