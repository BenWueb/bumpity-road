import { Suspense } from "react";
import { getFishingData } from "@/lib/fishing-server";
import FishingContent from "@/components/fishing/FishingContent";

function FishingLoading() {
  return (
    <div className="flex h-full items-center justify-center p-4 md:p-8">
      <div className="text-sm text-muted-foreground md:text-base">
        Loading fishing reports...
      </div>
    </div>
  );
}

async function FishingPageContent() {
  const { observations, savedLocations, currentUserId, isAdmin } =
    await getFishingData();
  return (
    <FishingContent
      initialObservations={observations}
      initialSavedLocations={savedLocations}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
    />
  );
}

export default function FishingPage() {
  return (
    <Suspense fallback={<FishingLoading />}>
      <FishingPageContent />
    </Suspense>
  );
}
