import { BIKES, EXPIRY_DAYS } from "./mock-data";
import type {
  AgentApplication,
  DashboardTab,
  Lead,
  NewLeadInput,
  Payout,
  PortalView,
} from "./types";

const ACTIVE_STATUSES = new Set(["Referred", "Visited office", "Converted"]);
const VIEWS: PortalView[] = ["login", "otp", "apply", "pending", "dashboard", "add"];
const TABS: DashboardTab[] = ["leads", "payouts", "stats"];

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  return digits;
}

export function formatPhoneForDisplay(value: string) {
  const normalized = normalizeKenyanPhone(value);
  if (normalized.length !== 12) return value;
  return `+254 ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
}

export function validateOtp(value: string) {
  return value.replace(/\D/g, "") === "123456";
}

export function validateAgentApplication(application: AgentApplication): { ok: true } | { ok: false; message: string } {
  if (application.name.trim().length < 3) return { ok: false, message: "Enter your full name." };
  if (normalizeKenyanPhone(application.phone).length !== 12) return { ok: false, message: "Enter a valid Kenyan phone number." };
  if (!/^\d{7,10}$/.test(application.idNo.trim())) return { ok: false, message: "Enter a valid national ID number." };
  if (application.area.trim().length < 2) return { ok: false, message: "Tell us where you are based." };
  if (!application.hasIdImage) return { ok: false, message: "Attach a clear photo of your ID." };
  return { ok: true };
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseAgentApplicationForm(formData: FormData): AgentApplication {
  const idImage = formData.get("idFile");
  return {
    name: formString(formData, "name"),
    phone: formString(formData, "phone"),
    idNo: formString(formData, "idNo"),
    area: formString(formData, "area"),
    hasIdImage: idImage instanceof File && idImage.size > 0,
  };
}

export function parseNewLeadForm(formData: FormData): NewLeadInput {
  const tenureValue = Number(formString(formData, "tenure"));
  const bike = formString(formData, "bike");
  if (tenureValue !== 18 && tenureValue !== 24) throw new Error("Choose a valid loan tenure.");
  if (!BIKES.includes(bike as (typeof BIKES)[number])) throw new Error("Choose a valid bike.");
  const bolt = formString(formData, "bolt") === "true";
  const conductValue = formString(formData, "conduct");
  return {
    name: formString(formData, "name"),
    phone: formString(formData, "phone"),
    idNo: formString(formData, "idNo"),
    hasDL: formString(formData, "hasDL") === "true",
    bike,
    tenure: tenureValue,
    bolt,
    conduct: bolt ? (conductValue ? conductValue === "true" : null) : null,
    notes: formString(formData, "notes"),
  };
}

export function createMockLead(input: NewLeadInput, existingLeads: Lead[]): Lead {
  const normalized = normalizeKenyanPhone(input.phone);
  if (input.name.trim().length < 3) throw new Error("Enter the rider’s full name.");
  if (normalized.length !== 12) throw new Error("Enter a valid Kenyan phone number.");
  if (!/^\d{7,10}$/.test(input.idNo.trim())) throw new Error("Enter a valid national ID number.");
  if (!input.bike || ![18, 24].includes(input.tenure)) throw new Error("Choose a bike and loan tenure.");
  if (input.bolt && input.conduct === null) throw new Error("Confirm the rider’s conduct status.");

  const duplicate = existingLeads.some(
    (lead) => ACTIVE_STATUSES.has(lead.status) && normalizeKenyanPhone(lead.phone) === normalized,
  );
  if (duplicate) throw new Error("This number already has an active lead.");

  return {
    id: Date.now(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    bike: input.bike,
    tenure: input.tenure,
    bolt: input.bolt,
    conduct: input.bolt ? input.conduct : null,
    hasDL: input.hasDL,
    status: "Referred",
    added: "Today",
    daysLeft: EXPIRY_DAYS,
    commission: null,
    events: [{ t: "Referred by you", d: "Today" }],
  };
}

export function getDashboardMetrics(leads: Lead[], payouts: Payout[]) {
  const converted = leads.filter((lead) => ["Converted", "Commission paid"].includes(lead.status)).length;
  return {
    total: leads.length,
    active: leads.filter((lead) => ["Referred", "Visited office"].includes(lead.status)).length,
    converted,
    expired: leads.filter((lead) => ["Expired", "Lost"].includes(lead.status)).length,
    conversionRate: leads.length ? Math.round((converted / leads.length) * 100) : 0,
    pendingTotal: leads.filter((lead) => lead.status === "Converted").reduce((sum, lead) => sum + (lead.commission ?? 0), 0),
    paidTotal: payouts.reduce((sum, payout) => sum + payout.amount, 0),
  };
}

export function resolvePortalView(value: string | string[] | undefined): PortalView {
  const candidate = firstParam(value);
  return VIEWS.includes(candidate as PortalView) ? candidate as PortalView : "login";
}

export function resolveDashboardTab(value: string | string[] | undefined): DashboardTab {
  const candidate = firstParam(value);
  return TABS.includes(candidate as DashboardTab) ? candidate as DashboardTab : "leads";
}

export function formatKes(value: number) {
  return `KES ${value.toLocaleString("en-KE")}`;
}
