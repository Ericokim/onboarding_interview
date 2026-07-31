export type LeadStatus =
  | "Referred"
  | "Visited office"
  | "Converted"
  | "Commission paid"
  | "Expired"
  | "Lost";

export type DashboardTab = "leads" | "payouts" | "stats";
export type PortalView = "login" | "otp" | "apply" | "pending" | "dashboard" | "add";

export type LeadEvent = {
  t: string;
  d: string;
};

export type Lead = {
  id: number;
  name: string;
  phone: string;
  bike: string;
  tenure: 18 | 24;
  bolt: boolean;
  conduct: boolean | null;
  hasDL: boolean;
  status: LeadStatus;
  added: string;
  daysLeft: number | null;
  commission: number | null;
  events: LeadEvent[];
};

export type NewLeadInput = {
  name: string;
  phone: string;
  idNo: string;
  hasDL: boolean;
  bike: string;
  tenure: 18 | 24;
  bolt: boolean;
  conduct: boolean | null;
  notes: string;
};

export type Payout = {
  id: string;
  date: string;
  amount: number;
  ref: string;
  note: string;
};

export type Notification = {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export type AgentApplication = {
  name: string;
  phone: string;
  idNo: string;
  area: string;
  hasIdImage: boolean;
};
