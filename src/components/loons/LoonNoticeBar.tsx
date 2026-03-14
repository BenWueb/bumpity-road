"use client";

import NoticeBar, { type Notice } from "@/components/ui/NoticeBar";

interface Props {
  notice: Notice;
  isLoonAdmin: boolean;
}

export default function LoonNoticeBar({ notice, isLoonAdmin }: Props) {
  return (
    <NoticeBar
      notice={notice}
      canEdit={isLoonAdmin}
      apiEndpoint="/api/loon-notice"
      placeholder="Enter an important update for loon watchers..."
      addLabel="Add a notice for loon watchers"
    />
  );
}
