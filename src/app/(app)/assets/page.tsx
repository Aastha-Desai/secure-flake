"use client";

import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import Toggle from "@/components/Toggle";
import { assets as seedAssets, Asset } from "@/lib/mock/data";
import Link from "next/link";
import { useMemo, useState } from "react";

const criticalityOptions: Asset["criticality"][] = ["High", "Medium", "Low"];
const cadenceOptions: Asset["cadence"][] = ["Hourly", "Daily", "Weekly"];

export default function AssetsPage() {
  const [q, setQ] = useState("");
  const [onlyMonitored, setOnlyMonitored] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(seedAssets);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return assets.filter((a) => {
      const name = `${a.database}.${a.schema}.${a.table}`.toLowerCase();
      const matches = !query || name.includes(query);
      const matchesMonitored = !onlyMonitored || a.monitored;
      return matches && matchesMonitored;
    });
  }, [assets, q, onlyMonitored]);

  function updateAsset(id: string, patch: Partial<Asset>) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  return (
    <div className="space-y-6">
      <Topbar
        title="Assets"
        subtitle="Select what to monitor and set expectations (UI-only)"
        right={
          <button className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800">
            Add tables
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search database.schema.table…"
          className="w-full md:max-w-lg rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />

        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Toggle enabled={onlyMonitored} onChange={setOnlyMonitored} label="Only monitored" />
          Only monitored
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500">
          <div className="col-span-5">Table</div>
          <div className="col-span-2">Monitor</div>
          <div className="col-span-2">Criticality</div>
          <div className="col-span-2">Cadence</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <div className="divide-y divide-slate-200">
          {filtered.map((a) => (
            <div key={a.id} className="px-5 py-4 hover:bg-slate-50">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Link href={`/assets/${a.id}`} className="font-semibold hover:underline">
                    {a.database}.{a.schema}.{a.table}
                  </Link>
                  <div className="text-xs text-slate-500 mt-1">{a.why}</div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Toggle
                      enabled={a.monitored}
                      onChange={(next) => updateAsset(a.id, { monitored: next })}
                      label={`Monitor ${a.table}`}
                    />
                    <span className="text-xs text-slate-600">
                      {a.monitored ? "On" : "Off"}
                    </span>
                  </div>
                </div>

                <div className="col-span-2">
                  <select
                    value={a.criticality}
                    onChange={(e) =>
                      updateAsset(a.id, {
                        criticality: e.target.value as Asset["criticality"],
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {criticalityOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <select
                    value={a.cadence}
                    onChange={(e) =>
                      updateAsset(a.id, {
                        cadence: e.target.value as Asset["cadence"],
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {cadenceOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 flex justify-end">
                  <StatusBadge status={a.status} />
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="font-semibold">No assets found</div>
              <div className="text-sm text-slate-500 mt-2">
                Try a different search or disable “Only monitored”.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
