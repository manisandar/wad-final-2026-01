// src/components/StatusBadge.jsx

export default function StatusBadge({ status }) {
  let badgeStyles = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    case "Open":
      badgeStyles = "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200/50";
      break;
    case "Close":
      badgeStyles = "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200/50";
      break;
    case "Cancel":
      badgeStyles = "bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200/50";
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "Open"
            ? "bg-emerald-500"
            : status === "Close"
            ? "bg-amber-500"
            : "bg-rose-500"
        }`}
      />
      {status}
    </span>
  );
}
