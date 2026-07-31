"use server";

import { redirect } from "next/navigation";

import {
  formatPhoneForDisplay,
  normalizeKenyanPhone,
  resolveDashboardTab,
  validateOtp,
} from "@/lib/jiwambe/domain";
import {
  approveApplicant,
  signInMockAgent,
} from "@/lib/jiwambe/session";

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

export async function approveMockApplication() {
  const approved = await approveApplicant();
  if (!approved) errorRedirect("apply", "Submit an application before simulating approval.");
  redirect(`/?view=dashboard&saved=${encodeURIComponent("You’re approved! Add your first lead to get started.")}`);
}

export async function openActivity(formData: FormData) {
  const tab = resolveDashboardTab(stringValue(formData, "tab"));
  redirect(`/?view=dashboard&tab=${tab}&activity=1`);
}
