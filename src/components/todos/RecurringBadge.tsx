import { RefreshCw } from "lucide-react";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function formatRecurring(recurring: string, anchorDate?: string | null): string {
  if (!anchorDate) return recurring;

  const date = new Date(anchorDate);
  if (isNaN(date.getTime())) return recurring;

  switch (recurring) {
    case "daily":
      return "Daily";
    case "weekly": {
      const dayName = DAYS_OF_WEEK[date.getDay()];
      return `Weekly on ${dayName}`;
    }
    case "monthly": {
      const dayOfMonth = date.getDate();
      return `Monthly on ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
    }
    case "yearly": {
      const month = MONTHS[date.getMonth()];
      const dayOfMonth = date.getDate();
      return `Yearly on ${month} ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`;
    }
    default:
      return recurring;
  }
}

type Props = {
  recurring: string | null;
  anchorDate?: string | null; // The date used to determine the recurrence pattern (e.g., createdAt or dueDate)
};

export function RecurringBadge({ recurring, anchorDate }: Props) {
  if (!recurring) return null;

  const label = formatRecurring(recurring, anchorDate);

  return (
    <span 
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      title={label}
    >
      <RefreshCw className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

