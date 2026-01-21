type Status = "OK" | "WARN" | "FAIL";

const styles: Record<Status, string> = {
  OK: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WARN: "bg-amber-50 text-amber-700 border-amber-200",
  FAIL: "bg-rose-50 text-rose-700 border-rose-200",
};

const icons: Record<Status, string> = {
  OK: "✅",
  WARN: "⚠️",
  FAIL: "❌",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span aria-hidden>{icons[status]}</span>
      {status}
    </span>
  );
}
