"use client";

import { useEffect, useState } from "react";
import IssueReportModal from "@/components/IssueReportModal";
import ArrivalModePanel from "@/components/ArrivalModePanel";
import LeavingModePanel from "@/components/LeavingModePanel";

export default function CabinSiteModals() {
  const [issueOpen, setIssueOpen] = useState(false);
  const [arrivalOpen, setArrivalOpen] = useState(false);
  const [leavingOpen, setLeavingOpen] = useState(false);

  useEffect(() => {
    function onOpenIssue() {
      setIssueOpen(true);
    }
    function onOpenArrival() {
      setArrivalOpen(true);
    }
    function onOpenLeaving() {
      setLeavingOpen(true);
    }

    window.addEventListener("openIssueReportModal", onOpenIssue);
    window.addEventListener("openArrivalMode", onOpenArrival);
    window.addEventListener("openLeavingMode", onOpenLeaving);
    return () => {
      window.removeEventListener("openIssueReportModal", onOpenIssue);
      window.removeEventListener("openArrivalMode", onOpenArrival);
      window.removeEventListener("openLeavingMode", onOpenLeaving);
    };
  }, []);

  return (
    <>
      <IssueReportModal isOpen={issueOpen} onClose={() => setIssueOpen(false)} />
      <ArrivalModePanel isOpen={arrivalOpen} onClose={() => setArrivalOpen(false)} />
      <LeavingModePanel isOpen={leavingOpen} onClose={() => setLeavingOpen(false)} />
    </>
  );
}
