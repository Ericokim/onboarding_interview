"use server";

import { redirect } from "next/navigation";

import {
  createMockLead,
  formatPhoneForDisplay,
  normalizeKenyanPhone,
  parseAgentApplicationForm,
  parseNewLeadForm,
  resolveDashboardTab,
  validateAgentApplication,
  validateOtp,
} from "@/lib/jiwambe/domain";
import {
  approveApplicant,
  getMockPortalState,
  saveApplicant,
  saveMockLeads,
  signInMockAgent,
} from "@/lib/jiwambe/session";
import type { Lead } from "@/lib/jiwambe/types";

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorRedirect(view: string, message: string): never {
  redirect(`/?view=${view}&error=${encodeURIComponent(message)}`);
}

export async function startLogin(formData: FormData) {
  const phone = stringValue(formData, "phone");
  if (normalizeKenyanPhone(phone).length !== 12) errorRedirect("login", "Enter a valid Kenyan phone number.");
  redirect(`/?view=otp&phone=${encodeURIComponent(formatPhoneForDisplay(phone))}`);
}

export async function verifyMockOtp(formData: FormData) {
  if (!validateOtp(stringValue(formData, "code"))) errorRedirect("otp", "That code is incorrect. Use 123456 for this demo.");
  await signInMockAgent();
  redirect("/?view=dashboard");
}

export async function submitAgentApplication(formData: FormData) {
  const application = parseAgentApplicationForm(formData);
  const result = validateAgentApplication(application);
  if (!result.ok) errorRedirect("apply", result.message);
  await saveApplicant(application);
  redirect("/?view=pending");
}

export async function approveMockApplication() {
  const approved = await approveApplicant();
  if (!approved) errorRedirect("apply", "Submit an application before simulating approval.");
  redirect(`/?view=dashboard&saved=${encodeURIComponent("You’re approved! Add your first lead to get started.")}`);
}

export async function saveLead(formData: FormData) {
  const state = await getMockPortalState();
  if (!state.authenticated) errorRedirect("login", "Sign in before adding a lead.");
  let lead: Lead;
  try {
    lead = createMockLead(parseNewLeadForm(formData), state.leads);
  } catch (error) {
    errorRedirect("add", error instanceof Error ? error.message : "Check the lead details and try again.");
  }
  await saveMockLeads([lead, ...state.leads]);
  redirect(`/?view=dashboard&tab=leads&saved=${encodeURIComponent(`${lead.name.split(" ")[0]} saved — we’ll notify you when they visit.`)}`);
}

export async function openActivity(formData: FormData) {
  const tab = resolveDashboardTab(stringValue(formData, "tab"));
  redirect(`/?view=dashboard&tab=${tab}&activity=1`);
}
