export type AnnouncementColor =
  | "amber"
  | "green"
  | "emerald"
  | "sky"
  | "violet"
  | "rose"
  | "slate";

export type AnnouncementLink = {
  label: string;
  href?: string;
  target?: "_blank" | "_self";
  action?: "feedbackModal";
};

export type AnnouncementConfig = {
  enabled: boolean;
  color: AnnouncementColor;
  message: string;
  link?: AnnouncementLink;
};

export const ANNOUNCEMENT: AnnouncementConfig = {
  enabled: true,
  color: "green",
  message: "Help us out by",
  link: {
    label: "sending feedback and reporting bugs",
    action: "feedbackModal",
  },
};
