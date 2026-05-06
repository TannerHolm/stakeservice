import { getServiceClient, PHOTOS_BUCKET, type Submission } from "@/lib/supabase";
import { UNITS } from "@/lib/units";
import { AdminCharts } from "./charts";
import { DeleteButton } from "./delete-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Row = Submission;

export default async function AdminPage() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Admin</h1>
        <p className="text-red-600">Failed to load: {error.message}</p>
      </main>
    );
  }

  const rows: Row[] = data ?? [];

  const totalHours = rows.reduce((sum, r) => sum + Number(r.hours || 0), 0);
  const totalSubmissions = rows.length;
  const totalParticipants = new Set(
    rows.map((r) => (r.name ? r.name.trim().toLowerCase() : null)).filter(Boolean)
  ).size;
  const totalPhotos = rows.reduce((sum, r) => sum + (r.photo_paths?.length || 0), 0);

  const byUnit = UNITS.map((unit) => {
    const subset = rows.filter((r) => r.unit === unit);
    return {
      unit,
      hours: subset.reduce((s, r) => s + Number(r.hours || 0), 0),
      submissions: subset.length,
    };
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const photoUrl = (path: string) =>
    `${supabaseUrl}/storage/v1/object/public/${PHOTOS_BUCKET}/${path}`;

  return (
    <main className="px-6 py-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Service Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/api/admin/export"
            className="px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-medium"
          >
            Export CSV
          </Link>
          <Link
            href="/admin/login"
            className="px-4 py-2 rounded-full text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          >
            Sign out
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Metric label="Total hours" value={totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} />
        <Metric label="Submissions" value={totalSubmissions.toLocaleString()} />
        <Metric label="Participants" value={totalParticipants.toLocaleString()} />
        <Metric label="Photos" value={totalPhotos.toLocaleString()} />
      </div>

      <AdminCharts byUnit={byUnit} />

      <h2 className="text-xl font-semibold mt-10 mb-4">Submissions</h2>
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Hours</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 font-medium">Story</th>
              <th className="px-4 py-3 font-medium">Photos</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-neutral-500">
                  No submissions yet.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-800 align-top">
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{r.unit}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.name || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{r.hours}</td>
                <td className="px-4 py-3 max-w-xs">{r.project}</td>
                <td className="px-4 py-3 max-w-md text-neutral-600 dark:text-neutral-400">
                  {r.story || "—"}
                </td>
                <td className="px-4 py-3">
                  {r.photo_paths && r.photo_paths.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {r.photo_paths.map((p) => (
                        <a
                          key={p}
                          href={photoUrl(p)}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoUrl(p)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-neutral-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <DeleteButton id={r.id} label={r.name || r.unit} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-gradient-to-br from-transparent to-[#5BB0C8]/5">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="text-3xl font-semibold mt-1 text-[#3D8AA5] dark:text-[#5BB0C8]">
        {value}
      </div>
    </div>
  );
}
