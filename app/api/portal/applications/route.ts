import { NextResponse } from "next/server";

import { parseAgentApplicationForm, validateAgentApplication } from "@/lib/jiwambe/domain";
import { saveApplicant } from "@/lib/jiwambe/session";

function redirectTo(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const application = parseAgentApplicationForm(formData);
    const result = validateAgentApplication(application);

    if (!result.ok) {
      return redirectTo(`/?view=apply&error=${encodeURIComponent(result.message)}`);
    }

    await saveApplicant(application);
    return redirectTo("/?view=pending");
  } catch {
    return redirectTo(
      `/?view=apply&error=${encodeURIComponent("We couldn’t read that upload. Choose a clear ID image and try again.")}`,
    );
  }
}
