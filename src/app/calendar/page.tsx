import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import CalendarView from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Calendar"
        subtitle="View and browse all upcoming events"
        icon={<CalendarDays className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-sky-600 text-white shadow-lg md:h-12 md:w-12"
      />
      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <CalendarView />
      </div>
    </div>
  );
}
