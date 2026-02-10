"use client";

import { useEffect, useMemo, useState } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { assets } from "@/lib/mock/data";
import Link from "next/link";

function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const toneStyles =
    tone === "good"
      ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-700"
      : tone === "warn"
      ? "border-amber-500/25 bg-amber-500/5 text-amber-700"
      : tone === "bad"
      ? "border-rose-500/25 bg-rose-500/5 text-rose-700"
      : "border-slate-200 bg-white text-slate-700";

  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-sm",
        "transition-transform duration-200 hover:-translate-y-0.5",
        "bg-white/80 backdrop-blur",
        toneStyles,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-wide uppercase text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-slate-500">{hint}</div>
          ) : null}
        </div>

        <div
          className={[
            "h-9 w-9 rounded-xl border",
            tone === "good"
              ? "border-emerald-500/20 bg-emerald-500/10"
              : tone === "warn"
              ? "border-amber-500/20 bg-amber-500/10"
              : tone === "bad"
              ? "border-rose-500/20 bg-rose-500/10"
              : "border-slate-200 bg-slate-50",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="w-full">
          <div className="h-4 w-64 rounded bg-slate-200/70 animate-pulse" />
          <div className="mt-3 h-3 w-96 rounded bg-slate-200/60 animate-pulse" />
          <div className="mt-3 h-3 w-72 rounded bg-slate-200/50 animate-pulse" />
        </div>
        <div className="h-7 w-20 rounded-full bg-slate-200/60 animate-pulse" />
      </div>
    </div>
  );
}

function downloadTextFile(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  //Get metrics

  const getMetrics = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/metrics')

      if (!response.ok) {
        console.error('Failed to fetch metrics: ', response.status);
      }

      const metricsData = await response.json();
      return metricsData;

    }catch (err) {
      console.error('Error fetching metrics: ', err);
    }
  }

  // ✅ We can ADD usage around it (without changing it)
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      setMetricsLoading(true);
      const data = await getMetrics();
      if (alive) {
        setMetrics(data ?? null);
        setMetricsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fallback to mock assets if backend metrics aren’t ready / shape differs
  const computed = useMemo(() => {
    const fallbackTotal = assets.length;
    const fallbackOk = assets.filter((a) => a.status === "OK").length;
    const fallbackWarn = assets.filter((a) => a.status === "WARN").length;
    const fallbackFail = assets.filter((a) => a.status === "FAIL").length;

    const ok = metrics?.ok ?? metrics?.OK ?? fallbackOk;
    const warn = metrics?.warn ?? metrics?.WARN ?? fallbackWarn;
    const fail = metrics?.fail ?? metrics?.FAIL ?? fallbackFail;
    const total = metrics?.total ?? fallbackTotal;

    const lastRun =
      metrics?.lastRun ??
      metrics?.last_run ??
      metrics?.timestamp ??
      "Just now";

    return { ok, warn, fail, total, lastRun };
  }, [metrics]);

  const attentionAsset = useMemo(() => {
    const fail = assets.find((a) => a.status === "FAIL");
    if (fail) return fail;
    const warn = assets.find((a) => a.status === "WARN");
    return warn ?? assets[0];
  }, []);

  const handleExport = () => {
    const headers = [
      "database",
      "schema",
      "table",
      "criticality",
      "cadence",
      "status",
      "updatedAt",
      "why",
    ];
    const rows = assets.map((a) => [
      a.database,
      a.schema,
      a.table,
      a.criticality,
      a.cadence,
      a.status,
      a.updatedAt,
      a.why.replaceAll('"', '""'),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return `"${s.replaceAll('"', '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    downloadTextFile("secureflake-assets.csv", csv, "text/csv");
  };

  return (
    <div className="min-h-[calc(100vh-40px)] space-y-6">
      {/* Background polish (subtle, enterprise) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(1000px_600px_at_15%_10%,rgba(37,99,235,0.25),transparent_55%),radial-gradient(900px_600px_at_85%_20%,rgba(14,165,233,0.18),transparent_55%),radial-gradient(900px_700px_at_55%_90%,rgba(99,102,241,0.16),transparent_60%)]" />
      </div>

      <Topbar
        title="Dashboard"
        subtitle="Decision readiness overview across monitored tables"
        right={
          <>
            <button
              onClick={handleExport}
              className="rounded-xl border border-slate-200/60 bg-white/85 px-3 py-2 text-sm text-slate-900 shadow-sm backdrop-blur hover:bg-white"
            >
              Export
            </button>

            <Link
              href="/assets"
              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm shadow-sm hover:bg-slate-800"
            >
              View Assets
            </Link>
          </>
        }
      />

      <div className="px-1">
        <div className="rounded-3xl border border-slate-200/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_140px_rgba(0,0,0,0.55)]">
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-semibold text-white/90">
                  Trust Overview
                </div>
                <div className="mt-1 text-sm text-white/60">
                  Last run:{" "}
                  <span className="text-white/80">
                    {metricsLoading ? "Loading…" : computed.lastRun}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
                  ✅ OK + ⚠️ WARN + ❌ FAIL
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  Read-only • Evidence-first
                </span>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Healthy"
                value={metricsLoading ? "—" : String(computed.ok)}
                hint="No active warnings"
                tone="good"
              />
              <StatCard
                label="Warnings"
                value={metricsLoading ? "—" : String(computed.warn)}
                hint="Needs review"
                tone="warn"
              />
              <StatCard
                label="Failures"
                value={metricsLoading ? "—" : String(computed.fail)}
                hint="Decision risk"
                tone="bad"
              />
              <StatCard
                label="Monitored"
                value={metricsLoading ? "—" : String(computed.total)}
                hint="Tables tracked"
                tone="neutral"
              />
            </div>

            {/* Attention banner */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold tracking-wide uppercase text-white/60">
                    Needs attention
                  </div>
                  <div className="mt-2 font-semibold text-white/90">
                    {attentionAsset.database}.{attentionAsset.schema}.
                    {attentionAsset.table}
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    {attentionAsset.why}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={attentionAsset.status} />
                  <Link
                    href={`/assets/${attentionAsset.id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
                  >
                    Open details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitored assets list */}
        <div className="mt-6 rounded-3xl border border-slate-200/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_110px_rgba(0,0,0,0.45)]">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="font-semibold text-white/90">Monitored assets</div>
              <div className="text-sm text-white/60">
                What’s safe to use right now
              </div>
            </div>

            <Link
              className="text-sm font-semibold text-white/85 hover:underline"
              href="/assets"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {/* If you want a loading feel while metrics load */}
            {metricsLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              assets.map((a) => (
                <Link
                  key={a.id}
                  href={`/assets/${a.id}`}
                  className="block p-6 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-semibold text-white/90">
                          {a.database}.{a.schema}.{a.table}
                        </div>
                        <span className="hidden md:inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-semibold text-white/70">
                          {a.criticality} • {a.cadence}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-white/65">{a.why}</div>

                      <div className="mt-3 text-xs text-white/55">
                        Updated: {a.updatedAt} • Criticality: {a.criticality} •
                        Cadence: {a.cadence}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
