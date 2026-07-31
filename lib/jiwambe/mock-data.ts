import type { Lead, Notification, Payout } from "./types";

export const EXPIRY_DAYS = 30;
export const BIKES = ["Spiro", "TankVolt", "Kofa", "ENZI", "Mazi", "Powerhive", "TAILG"] as const;

export const seedLeads: Lead[] = [
  {
    id: 7,
    name: "Faith Wanjiru",
    phone: "0712 664 210",
    bike: "Spiro",
    tenure: 24,
    bolt: true,
    conduct: true,
    hasDL: true,
    status: "Commission paid",
    added: "12 Jun",
    daysLeft: null,
    commission: 7500,
    events: [
      { t: "Referred by you", d: "12 Jun, 09:14" },
      { t: "Visited Riverside Lane office", d: "14 Jun, 11:02" },
      { t: "Converted · deposit KES 150,000 paid", d: "17 Jun, 15:40" },
      { t: "Commission KES 7,500 paid · M-Pesa UGK3XG91TQ", d: "18 Jun, 08:01" },
    ],
  },
  {
    id: 6,
    name: "Brian Otieno",
    phone: "0798 115 402",
    bike: "TankVolt",
    tenure: 18,
    bolt: true,
    conduct: true,
    hasDL: true,
    status: "Converted",
    added: "24 Jun",
    daysLeft: null,
    commission: 7500,
    events: [
      { t: "Referred by you", d: "24 Jun, 17:26" },
      { t: "Visited Riverside Lane office", d: "28 Jun, 10:15" },
      { t: "Converted · deposit KES 150,000 paid", d: "1 Jul, 13:22" },
      { t: "Commission KES 7,500 queued for payout", d: "1 Jul, 13:22" },
    ],
  },
  {
    id: 5,
    name: "Amina Hassan",
    phone: "0722 409 336",
    bike: "Spiro",
    tenure: 24,
    bolt: false,
    conduct: null,
    hasDL: true,
    status: "Visited office",
    added: "29 Jun",
    daysLeft: 26,
    commission: null,
    events: [
      { t: "Referred by you", d: "29 Jun, 08:47" },
      { t: "Visited Riverside Lane office", d: "3 Jul, 09:05" },
    ],
  },
  {
    id: 4,
    name: "Dennis Kiprop",
    phone: "0791 552 078",
    bike: "Kofa",
    tenure: 18,
    bolt: true,
    conduct: true,
    hasDL: true,
    status: "Referred",
    added: "28 Jun",
    daysLeft: 5,
    commission: null,
    events: [{ t: "Referred by you", d: "28 Jun, 12:31" }],
  },
  {
    id: 3,
    name: "Kevin Mwangi",
    phone: "0705 883 917",
    bike: "Spiro",
    tenure: 24,
    bolt: false,
    conduct: null,
    hasDL: false,
    status: "Referred",
    added: "1 Jul",
    daysLeft: 28,
    commission: null,
    events: [{ t: "Referred by you", d: "1 Jul, 16:09" }],
  },
  {
    id: 2,
    name: "Grace Achieng",
    phone: "0714 227 605",
    bike: "TankVolt",
    tenure: 18,
    bolt: false,
    conduct: null,
    hasDL: false,
    status: "Expired",
    added: "2 May",
    daysLeft: 0,
    commission: null,
    events: [
      { t: "Referred by you", d: "2 May, 10:12" },
      { t: "Expired after 30 days without conversion", d: "1 Jun, 00:00" },
    ],
  },
];

export const seedPayouts: Payout[] = [
  { id: "p3", date: "18 Jun", amount: 7500, ref: "UGK3XG91TQ", note: "Faith Wanjiru · deposit paid" },
  { id: "p2", date: "30 May", amount: 15000, ref: "UGQ8B2M4LP", note: "2 conversions · daily batch" },
  { id: "p1", date: "9 May", amount: 7500, ref: "UGM1K7Q2RW", note: "Mary Wairimu · deposit paid" },
];

export const monthlyEarnings = [
  { month: "May", paid: 22500, pending: 0 },
  { month: "Jun", paid: 7500, pending: 0 },
  { month: "Jul", paid: 0, pending: 7500 },
];

export const seedNotifications: Notification[] = [
  { id: "n1", icon: "🏢", title: "Amina Hassan visited the office", body: "Your lead checked in at Riverside Lane this morning. Conversion usually follows within 3 days.", time: "2h ago", unread: true },
  { id: "n2", icon: "⚡", title: "Brian Otieno converted!", body: "Deposit of KES 150,000 paid. Your KES 7,500 commission is queued for the next daily payout.", time: "2d ago", unread: true },
  { id: "n3", icon: "⏳", title: "Dennis Kiprop expires in 5 days", body: "Give him a nudge — unconverted leads are released after 30 days.", time: "2d ago", unread: true },
  { id: "n4", icon: "📲", title: "Payout sent · KES 7,500", body: "M-Pesa UGK3XG91TQ for Faith Wanjiru’s conversion.", time: "15 Jun", unread: false },
];
