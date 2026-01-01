export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  color: string | null;
  createdAt: string;
};

export type OwnedEntry = {
  id: string;
  token: string;
};

export type GuestbookCreateInput = {
  name: string;
  message: string;
  color: string;
};

export type GuestbookUpdateInput = {
  id: string;
  name: string;
  message: string;
  color: string;
  ownerToken: string;
};

