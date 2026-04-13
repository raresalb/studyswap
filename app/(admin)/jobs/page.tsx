import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const jobStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
};

const jobStatusLabels: Record<string, string> = {
  ACTIVE: "Activ",
  CLOSED: "Închis",
  DRAFT: "Ciornă",
};

export default async function AdminJobsPage() {
  const jobs = await db.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { name: true, companyName: true, email: true } },
      _count: { select: { applications: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Joburi</h1>
        <p className="text-gray-500 mt-1">
          {jobs.length} joburi înregistrate pe platformă
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Niciun job înregistrat.</p>
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
                      Companie
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Tip
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Locație
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Aplicații
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Publicat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 max-w-[220px] truncate">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">{job.domain}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {job.company?.companyName ??
                              job.company?.name ??
                              "—"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.company?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{job.type}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {job.isRemote
                          ? "Remote"
                          : job.location ?? "—"}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-gray-900">
                        {job._count.applications}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            jobStatusColors[job.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {jobStatusLabels[job.status] ?? job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {formatDate(job.createdAt)}
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
