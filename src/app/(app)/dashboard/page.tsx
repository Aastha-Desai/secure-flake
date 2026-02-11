'use client' 

import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { assets } from "@/lib/mock/data";
import Link from "next/link";

import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null) // Changed: You need the setter!
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await fetch('http://localhost:4000/api/metrics', {
          method:'GET',
          credentials: 'include'
        });
        const parsedMetric = await data.json();
        console.log('Fetched metrics on page load: ', parsedMetric);
        setMetrics(parsedMetric); // ADD THIS LINE - actually store the metrics!
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, []);

  // Now you can use the metrics in your UI
  console.log('Current metrics state:', metrics);

  return (
    <div className="space-y-6">
      <Topbar
        title="Dashboard"
        subtitle="Decision readiness overview across monitored tables"
        right={
          <>
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
              GET METRICS
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
        {/* Display metrics here if you want */}
        {loading && <p>Loading metrics...</p>}
        {metrics && <pre>{JSON.stringify(metrics, null, 2)}</pre>}
      </div>

      {/* ... rest of your component */}
    </div>
  );
}