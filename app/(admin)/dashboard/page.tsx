import { db } from "@/lib/db";
import { creditsToEur, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalMaterials,
    pendingMaterials,
    pendingWithdrawals,
    recentTransactions,
    revenueResult,
    approvedMaterials,
  ] = await Promise.all([
    db.user.count(),
    db.material.count(),
    db.material.count({ where: { status: "PENDING" } }),
    db.withdrawal.count({ where: { status: "PENDING" } }),
    db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
      },
    }),
    db.transaction.aggregate({
      where: { type: "PURCHASE_CREDITS", status: "COMPLETED" },
      _sum: { amount: true },
    }),
    db.material.count({ where: { status: "APPROVED" } }),
  ]);

  const totalRevenue = revenueResult._sum.amount ?? 0;

  const stats = [
    {
      title: "Utilizatori Totali",
      value: totalUsers.toLocaleString("ro-RO"),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Materiale Totale",
      value: totalMaterials.toLocaleString("ro-RO"),
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Materiale în Așteptare",
      value: pendingMaterials.toLocaleString("ro-RO"),
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Venituri Totale",
      value: `${creditsToEur(totalRevenue).toFixed(2)} €`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Retrageri în Așteptare",
      value: pendingWithdrawals.toLocaleString("ro-RO"),
      icon: Wallet,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Materiale Aprobate",
      value: approvedMaterials.toLocaleString("ro-RO"),
      icon: CheckCircle,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  const transactionTypeLabels: Record<string, string> = {
    EARN_UPLOAD: "Câștig Upload",
    EARN_TUTORING: "Câștig Tutoriat",
    EARN_REVIEW: "Câștig Review",
    EARN_DAILY: "Bonus Zilnic",
    EARN_REFERRAL: "Bonus Referral",
    PURCHASE_CREDITS: "Cumpărare Credite",
    SPEND_MATERIAL: "Cheltuire Material",
    SPEND_TUTORING: "Cheltuire Tutoriat",
    WITHDRAW: "Retragere",
    REFUND: "Rambursare",
    COMMISSION: "Comision",
  };

  const transactionStatusColors: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">Statistici generale ale platformei</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(({ title, value, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tranzacții Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              Nicio tranzacție încă.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Utilizator
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tip
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Sumă
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {tx.user?.name ?? "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.user?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {transactionTypeLabels[tx.type] ?? tx.type}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            tx.amount >= 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {tx.amount >= 0 ? "+" : ""}
                          {tx.amount} credite
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            transactionStatusColors[tx.status] ??
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(tx.createdAt)}
                      </td>
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
