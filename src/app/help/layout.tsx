import { getAllDocs } from "@/lib/help-server";
import HelpSidebar from "@/components/help/HelpSidebar";

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docs = getAllDocs();

  return (
    <div className="flex h-full min-h-0">
      <HelpSidebar docs={docs} />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
