import { Suspense } from "react";
import { getLoonData } from "@/lib/loon-server";
import LoonsContent from "@/components/loons/LoonsContent";

function LoonsLoading() {
  return (
    <div className="flex h-full items-center justify-center p-4 md:p-8">
      <div className="text-sm text-muted-foreground md:text-base">
        Loading observations...
      </div>
    </div>
  );
}

async function LoonsPageContent() {
  const { observations, savedLocations, currentUserId, isAdmin, isLoonAdmin, notice } =
    await getLoonData();
  return (
    <LoonsContent
      initialObservations={observations}
      initialSavedLocations={savedLocations}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      isLoonAdmin={isLoonAdmin}
      initialNotice={notice}
    />
  );
}

export default function LoonPage() {
  return (
    <Suspense fallback={<LoonsLoading />}>
      <LoonsPageContent />
    </Suspense>
  );
}
