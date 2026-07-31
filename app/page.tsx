import {
  approveMockApplication,
  openActivity,
  startLogin,
  verifyMockOtp,
} from "./actions";
import { ApplyScreen, LoginScreen, OtpScreen, PendingReview } from "./components/auth-screens";
import { AddLeadScreen, DashboardScreen } from "./components/dashboard";
import { AppFrame } from "./components/ui";
import { firstParam, resolveDashboardTab, resolvePortalView } from "@/lib/jiwambe/domain";
import { getMockPortalState } from "@/lib/jiwambe/session";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const view = resolvePortalView(query.view);
  const error = firstParam(query.error);
  const state = await getMockPortalState();

  let content;
  if (view === "otp") {
    content = <OtpScreen phone={firstParam(query.phone) || ""} verifyAction={verifyMockOtp} error={error} />;
  } else if (view === "apply") {
    content = <ApplyScreen error={error} />;
  } else if (view === "pending") {
    content = <PendingReview name={state.applicant?.name || "Agent"} phone={state.applicant?.phone || "your number"} approveAction={approveMockApplication} />;
  } else if (view === "dashboard") {
    const tab = resolveDashboardTab(query.tab);
    const selectedId = Number(firstParam(query.lead));
    content = (
      <DashboardScreen
        agentName={state.agentName}
        leads={state.leads}
        payouts={state.payouts}
        notifications={state.notifications}
        tab={tab}
        selectedLead={state.leads.find((lead) => lead.id === selectedId)}
        showActivity={firstParam(query.activity) === "1"}
        activityAction={openActivity}
        notice={firstParam(query.saved)}
      />
    );
  } else if (view === "add") {
    content = <AddLeadScreen error={error} />;
  } else {
    content = <LoginScreen loginAction={startLogin} error={error} />;
  }

  return <AppFrame>{content}</AppFrame>;
}
