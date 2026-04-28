export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
}

export function statusBadgeColor(status: string) {
  switch (status) {
    case "Active": return "success" as const;
    case "Pending": return "warning" as const;
    case "Expired": return "gray" as const;
    case "Rejected": return "error" as const;
    default: return "gray" as const;
  }
}

export function planBadgeColor(plan: string) {
  switch (plan) {
    case "Prarambha": return "success" as const;
    case "Sankalpa": return "pink" as const;
    case "Aaradhana": return "indigo" as const;
    default: return "gray" as const;
  }
}
