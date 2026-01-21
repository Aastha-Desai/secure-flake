"use client";

export default function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      aria-label={label ?? "Toggle"}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
        enabled ? "bg-slate-900 border-slate-900" : "bg-white border-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full shadow-sm transition ${
          enabled ? "translate-x-5 bg-white" : "translate-x-1 bg-slate-900"
        }`}
      />
    </button>
  );
}
