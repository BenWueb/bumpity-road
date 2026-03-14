import { getAllDocs } from "@/lib/sop-server";
import SopSidebar from "@/components/sop/SopSidebar";

export default function SopLayout({ children }: { children: React.ReactNode }) {
  const docs = getAllDocs();

  return (
    <div className="flex h-full min-h-0">
      <SopSidebar docs={docs} />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
