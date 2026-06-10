import {
  getAllDocs,
  filterDocsByAccess,
  isCurrentUserAdmin,
} from "@/lib/help-server";
import HelpSidebar from "@/components/help/HelpSidebar";

export default async function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserAdmin();
  const docs = filterDocsByAccess(getAllDocs(), isAdmin);

  return (
    <div className="flex h-full min-h-0">
      <HelpSidebar docs={docs} />
      <div className="min-w-0 flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
