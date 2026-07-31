import { NextResponse } from "next/server";

import { createMockLead, parseNewLeadForm } from "@/lib/jiwambe/domain";
import { getMockPortalState, saveMockLeads } from "@/lib/jiwambe/session";

function redirectTo(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(request: Request) {
  const state = await getMockPortalState();
  if (!state.authenticated) {
    return redirectTo("/?view=login&error=Sign%20in%20before%20adding%20a%20lead.");
  }

  try {
    const formData = await request.formData();
    const lead = createMockLead(parseNewLeadForm(formData), state.leads);
    await saveMockLeads([lead, ...state.leads]);

    const notice = encodeURIComponent(`${lead.name.split(" ")[0]} saved — we’ll notify you when they visit.`);
    return redirectTo(`/?view=dashboard&tab=leads&saved=${notice}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Check the lead details and try again.";
    return redirectTo(`/?view=add&error=${encodeURIComponent(message)}`);
  }
}
