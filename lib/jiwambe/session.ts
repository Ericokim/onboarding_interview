import "server-only";

import { cookies } from "next/headers";

import { seedLeads, seedNotifications, seedPayouts } from "./mock-data";
import type { AgentApplication, Lead } from "./types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decode<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export async function getMockPortalState() {
  const store = await cookies();
  const storedLeads = decode<Lead[]>(store.get("jiwambe_leads")?.value);
  const freshAgent = store.get("jiwambe_fresh")?.value === "1";
  return {
    agentName: store.get("jiwambe_agent")?.value || "Kevin Njoroge",
    applicant: decode<AgentApplication>(store.get("jiwambe_applicant")?.value),
    leads: storedLeads ?? (freshAgent ? [] : seedLeads),
    payouts: seedPayouts,
    notifications: seedNotifications.map((item) => ({ ...item })),
    authenticated: Boolean(store.get("jiwambe_agent")?.value),
  };
}

export async function saveApplicant(application: AgentApplication) {
  const store = await cookies();
  store.set("jiwambe_applicant", encode(application), COOKIE_OPTIONS);
}

export async function approveApplicant() {
  const store = await cookies();
  const application = decode<AgentApplication>(store.get("jiwambe_applicant")?.value);
  if (!application) return false;
  store.set("jiwambe_agent", application.name, COOKIE_OPTIONS);
  store.set("jiwambe_fresh", "1", COOKIE_OPTIONS);
  store.delete("jiwambe_leads");
  return true;
}

export async function signInMockAgent() {
  const store = await cookies();
  store.set("jiwambe_agent", "Kevin Njoroge", COOKIE_OPTIONS);
  store.delete("jiwambe_fresh");
}

export async function saveMockLeads(leads: Lead[]) {
  const store = await cookies();
  store.set("jiwambe_leads", encode(leads.slice(0, 12)), COOKIE_OPTIONS);
  store.delete("jiwambe_fresh");
}
