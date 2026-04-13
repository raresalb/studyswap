import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { WithdrawalActions } from "./_components/withdrawal-actions";

type WStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED";

const statusColors: Record<WStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<WStatus, string> = {
  PENDING: "În așteptare",
  PROCESSING: "În procesare",
  COMPLETED: "Completat",
  REJECTED: "Respins",
};

const tabs: { status: WStatus; label: string }[] = [
  { status: "PENDING", label: "În așteptare" },
  { status: "PROCESSING", label: "În procesare" },
  { status: "COMPLETED", label: "Completate" },
  { status: "REJECTED", label: "Respinse" },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminWithdrawalsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const activeStatus: WStatus =
    (params.status as WStatus) in statusLabels
      ? (params.status as WStatus)
      : "PENDING";

  const [withdrawals, counts] = await Promise.all([
    db.withdrawal.findMany({
      where: { status: activeStatus },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, companyName: true } },
      },
    }),
    Promise.all([
      db.withdrawal.count({ where: { status: "PENDING" } }),
      db.withdrawal.count({ where: { status: "PROCESSING" } }),
      db.withdrawal.count({ where: { status: "COMPLETED" } }),
      db.withdrawal.count({ where: { status: "REJECTED" } }),
    ]),
  ]);

  const [pendingCnt, processingCnt, completedCnt, rejectedCnt] = counts;
  const tabCounts: Record<WStatus, number> = {
    PENDING: pendingCnt,
    PROCESSING: processingCnt,
    COMPLETED: completedCnt,
    REJECTED: rejectedCnt,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Retrageri de Credite
        </h1>
        <p className="text-gray-500 mt-1">
          Gestionează cererile de retragere ale utilizatorilor
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ status, label }) => (
          <Link
            key={status}
            href={`/admin/withdrawals?status=${status}`}
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
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>
                Nicio retragere cu statusul "{statusLabels[activeStatus]}".
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Utilizator
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Credite
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Sumă EUR
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Metodă
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Cont / Info
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Data
                    </th>
                    {(activeStatus === "PENDING" ||
                      activeStatus === "PROCESSING") && (
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Acțiuni
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {w.user?.name ?? w.user?.companyName ?? "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {w.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {w.credits.toLocaleString("ro-RO")}
                      </td>
                      <td className="py-3 px-4 font-medium text-green-700">
                        {w.amountEur.toFixed(2)} €
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {w.method ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-[160px] truncate">
                        {w.accountInfo ?? "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[w.status as WStatus]
                          }`}
                        >
                          {statusLabels[w.status as WStatus] ?? w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(w.createdAt)}
                      </td>
                      {(activeStatus === "PENDING" ||
                        activeStatus === "PROCESSING") && (
                        <td className="py-3 px-4">
                          <WithdrawalActions withdrawalId={w.id} />
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
