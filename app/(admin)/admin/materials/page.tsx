import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaterialActions } from "./_components/material-actions";

type Status = "PENDING" | "APPROVED" | "REJECTED";

const statusColors: Record<Status, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<Status, string> = {
  PENDING: "În așteptare",
  APPROVED: "Aprobat",
  REJECTED: "Respins",
};

const tabs: { status: Status; label: string }[] = [
  { status: "PENDING", label: "În așteptare" },
  { status: "APPROVED", label: "Aprobate" },
  { status: "REJECTED", label: "Respinse" },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminMaterialsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus: Status =
    (params.status as Status) in statusLabels
      ? (params.status as Status)
      : "PENDING";

  const [materials, counts] = await Promise.all([
    db.material.findMany({
      where: { status: activeStatus },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
      },
    }),
    Promise.all([
      db.material.count({ where: { status: "PENDING" } }),
      db.material.count({ where: { status: "APPROVED" } }),
      db.material.count({ where: { status: "REJECTED" } }),
    ]),
  ]);

  const [pendingCount, approvedCount, rejectedCount] = counts;
  const tabCounts: Record<Status, number> = {
    PENDING: pendingCount,
    APPROVED: approvedCount,
    REJECTED: rejectedCount,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Moderare Materiale
        </h1>
        <p className="text-gray-500 mt-1">
          Aprobă sau respinge materialele încărcate de utilizatori
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ status, label }) => (
          <Link
            key={status}
            href={`/admin/materials?status=${status}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeStatus === status
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {tabCounts[status]}
            </span>
          </Link>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {materials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Niciun material cu statusul "{statusLabels[activeStatus]}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Titlu
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Autor
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Categorie
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tip Fișier
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Încarcat
                    </th>
                    {activeStatus === "PENDING" && (
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Acțiuni
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 max-w-xs truncate">
                          {material.title}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {material.author?.name ?? "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {material.author?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {material.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          {material.fileType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[material.status as Status]
                          }`}
                        >
                          {statusLabels[material.status as Status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(material.createdAt)}
                      </td>
                      {activeStatus === "PENDING" && (
                        <td className="py-3 px-4">
                          <MaterialActions materialId={material.id} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
