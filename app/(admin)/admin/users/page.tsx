import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BanUserButton } from "./_components/ban-user-button";

const roleColors: Record<string, string> = {
  STUDENT: "bg-blue-100 text-blue-800",
  COMPANY: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

const roleLabels: Record<string, string> = {
  STUDENT: "Student",
  COMPANY: "Companie",
  ADMIN: "Admin",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const users = await db.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      credits: true,
      isBanned: true,
      createdAt: true,
      companyName: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gestionare Utilizatori
        </h1>
        <p className="text-gray-500 mt-1">
          {users.length} utilizatori găsiți
        </p>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/users">
        <div className="flex gap-3 max-w-md">
          <input
            name="q"
            defaultValue={query}
            placeholder="Caută după email sau nume..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Caută
          </button>
          {query && (
            <a
              href="/admin/users"
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Resetează
            </a>
          )}
        </div>
      </form>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Niciun utilizator găsit.</p>
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
                      Rol
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Credite
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Data Înregistrării
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Acțiuni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name ??
                              (user.role === "COMPANY"
                                ? user.companyName
                                : null) ??
                              "—"}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            roleColors[user.role] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {roleLabels[user.role] ?? user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {user.credits.toLocaleString("ro-RO")}
                      </td>
                      <td className="py-3 px-4">
                        {user.isBanned ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Banat
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <BanUserButton
                          userId={user.id}
                          isBanned={user.isBanned}
                          userName={user.name ?? user.email ?? user.id}
                        />
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
