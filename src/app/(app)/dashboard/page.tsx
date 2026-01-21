import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { assets } from "@/lib/mock/data";
import Link from "next/link";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const total = assets.length;
  const ok = assets.filter((a) => a.status === "OK").length;
  const warn = assets.filter((a) => a.status === "WARN").length;
  const fail = assets.filter((a) => a.status === "FAIL").length;
  const healthyPct = total ? Math.round((ok / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <Topbar
        title="Dashboard"
        subtitle="Decision readiness overview across monitored tables"
        right={
          <>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              Export
            </button>
            <Link
              href="/assets"
              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800"
            >
              View Assets
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Healthy assets" value={`${healthyPct}%`} />
        <StatCard label="OK" value={`${ok}`} />
        <StatCard label="Warnings" value={`${warn}`} />
        <StatCard label="Failures" value={`${fail}`} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-semibold">Monitored assets</div>
            <div className="text-sm text-slate-500">What’s safe to use right now</div>
          </div>
          <Link className="text-sm font-semibold text-slate-900 hover:underline" href="/assets">
            View all
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {assets.map((a) => (
            <Link
              key={a.id}
              href={`/assets/${a.id}`}
              className="block p-5 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    {a.database}.{a.schema}.{a.table}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{a.why}</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Updated: {a.updatedAt} • Criticality: {a.criticality} • Cadence: {a.cadence}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
