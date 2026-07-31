import { describe, expect, it } from "vitest";

import {
  createMockLead,
  getDashboardMetrics,
  normalizeKenyanPhone,
  parseAgentApplicationForm,
  parseNewLeadForm,
  resolvePortalView,
  validateAgentApplication,
  validateOtp,
} from "../lib/jiwambe/domain";
import { seedLeads, seedPayouts } from "../lib/jiwambe/mock-data";

describe("Jiwambe mock domain", () => {
  it("normalizes local and international Kenyan phone numbers", () => {
    expect(normalizeKenyanPhone("0712 345 678")).toBe("254712345678");
    expect(normalizeKenyanPhone("+254 712 345 678")).toBe("254712345678");
  });

  it("accepts only the documented demo OTP", () => {
    expect(validateOtp("123456")).toBe(true);
    expect(validateOtp("654321")).toBe(false);
  });

  it("validates all required agent application fields", () => {
    expect(validateAgentApplication({
      name: "Jane Wanjiku",
      phone: "0712 345 678",
      idNo: "33456789",
      area: "Kasarani, Nairobi",
      hasIdImage: true,
    })).toEqual({ ok: true });

    expect(validateAgentApplication({
      name: "J",
      phone: "0712",
      idNo: "12",
      area: "",
      hasIdImage: false,
    })).toMatchObject({ ok: false });
  });

  it("creates a working mock lead and blocks active duplicate numbers", () => {
    const lead = createMockLead({
      name: "Peter Maina",
      phone: "0700 000 001",
      idNo: "33445566",
      hasDL: true,
      bike: "Spiro",
      tenure: 24,
      bolt: false,
      conduct: null,
      notes: "Ready this week",
    }, seedLeads);

    expect(lead).toMatchObject({
      name: "Peter Maina",
      status: "Referred",
      daysLeft: 30,
      bike: "Spiro",
    });

    expect(() => createMockLead({
      name: "Duplicate Lead",
      phone: "0798 115 402",
      idNo: "33445566",
      hasDL: true,
      bike: "Spiro",
      tenure: 24,
      bolt: false,
      conduct: null,
      notes: "",
    }, seedLeads)).toThrow(/active lead/i);
  });

  it("derives dashboard stats from the mock records", () => {
    expect(getDashboardMetrics(seedLeads, seedPayouts)).toEqual({
      total: 6,
      active: 3,
      converted: 2,
      expired: 1,
      conversionRate: 33,
      pendingTotal: 7500,
      paidTotal: 30000,
    });
  });

  it("allows only known server-rendered views", () => {
    expect(resolvePortalView("dashboard")).toBe("dashboard");
    expect(resolvePortalView("not-a-screen")).toBe("login");
    expect(resolvePortalView(["apply", "dashboard"])).toBe("apply");
  });

  it("parses untrusted server-action form data into typed mock inputs", () => {
    const applicationData = new FormData();
    applicationData.set("name", "Jane Wanjiku");
    applicationData.set("phone", "0712 345 678");
    applicationData.set("idNo", "33456789");
    applicationData.set("area", "Kasarani");
    applicationData.set("idFile", new File(["mock-id"], "id.jpg", { type: "image/jpeg" }));
    expect(parseAgentApplicationForm(applicationData)).toMatchObject({ name: "Jane Wanjiku", hasIdImage: true });

    const leadData = new FormData();
    leadData.set("name", "Peter Maina");
    leadData.set("phone", "0700 000 001");
    leadData.set("idNo", "33445566");
    leadData.set("hasDL", "true");
    leadData.set("bike", "Spiro");
    leadData.set("tenure", "24");
    leadData.set("bolt", "false");
    leadData.set("notes", "Ready this week");
    expect(parseNewLeadForm(leadData)).toEqual({
      name: "Peter Maina",
      phone: "0700 000 001",
      idNo: "33445566",
      hasDL: true,
      bike: "Spiro",
      tenure: 24,
      bolt: false,
      conduct: null,
      notes: "Ready this week",
    });
  });
});
