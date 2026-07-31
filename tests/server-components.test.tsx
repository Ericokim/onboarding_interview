import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ApplyScreen, LoginScreen, OtpScreen } from "../app/components/auth-screens";
import { AddLeadScreen, DashboardScreen } from "../app/components/dashboard";
import { AppFrame, StatusPill } from "../app/components/ui";
import { seedLeads, seedNotifications, seedPayouts } from "../lib/jiwambe/mock-data";

describe("server-rendered portal components", () => {
  it("renders the app frame with Tailwind classes and no inline styles", () => {
    const html = renderToStaticMarkup(<AppFrame><p>Portal</p></AppFrame>);
    expect(html).toContain("max-w-[430px]");
    expect(html).not.toContain("style=");
  });

  it("renders semantic auth forms on the server", () => {
    const login = renderToStaticMarkup(<LoginScreen loginAction="/test" />);
    const otp = renderToStaticMarkup(<OtpScreen phone="0712 345 678" verifyAction="/test" />);

    expect(login).toContain("Every rider you");
    expect(login).toContain('name="phone"');
    expect(login).toContain("Apply to become an agent");
    expect(login).toContain("bg-[#123E31]");
    expect(login).toContain("rounded-t-[26px]");
    expect(login).not.toContain("transparent_40%),#123E31");
    expect(otp).toContain("123456");
    expect(otp).toContain('autoComplete="one-time-code"');
  });

  it("uploads agent applications through a stable multipart route", () => {
    const html = renderToStaticMarkup(<ApplyScreen />);

    expect(html).toContain('action="/api/portal/applications"');
    expect(html).toContain('method="post"');
    expect(html).toContain('encType="multipart/form-data"');
    expect(html).not.toContain("$ACTION_ID");
  });

  it("renders a Tailwind dashboard with mock leads, tabs, and a selected detail sheet", () => {
    const html = renderToStaticMarkup(
      <DashboardScreen
        agentName="Kevin Njoroge"
        leads={seedLeads}
        payouts={seedPayouts}
        notifications={seedNotifications}
        tab="leads"
        selectedLead={seedLeads[0]}
        showActivity={false}
        activityAction="/activity"
      />,
    );

    expect(html).toContain("Habari,");
    expect(html).toContain("Faith Wanjiru");
    expect(html).toContain("Commission paid");
    expect(html).toContain('role="dialog"');
    expect(html).toContain("Leads (6)");
    expect(html).not.toContain("style=");
  });

  it("renders the v4 notification badge precisely and hides it at zero unread", () => {
    const unreadHtml = renderToStaticMarkup(
      <DashboardScreen
        agentName="Kevin Njoroge"
        leads={seedLeads}
        payouts={seedPayouts}
        notifications={seedNotifications}
        tab="leads"
        showActivity={false}
        activityAction="/activity"
      />,
    );
    const readHtml = renderToStaticMarkup(
      <DashboardScreen
        agentName="Kevin Njoroge"
        leads={seedLeads}
        payouts={seedPayouts}
        notifications={seedNotifications.map((item) => ({ ...item, unread: false }))}
        tab="leads"
        showActivity={false}
        activityAction="/activity"
      />,
    );

    expect(unreadHtml).toContain('aria-label="Activity, 3 unread"');
    expect(unreadHtml).toContain('data-notification-badge="true"');
    expect(unreadHtml).toMatch(/data-notification-badge="true"[^>]*>3<\/span>/);
    expect(unreadHtml).toContain("-right-[5px] -top-[5px]");
    expect(unreadHtml).toContain("h-[18px] min-w-[18px]");
    expect(unreadHtml).toContain("bg-[#4ED99B]");
    expect(unreadHtml).toContain("shadow-[0_0_10px_rgba(78,217,155,.53)]");
    expect(readHtml).toContain('aria-label="Activity, 0 unread"');
    expect(readHtml).not.toContain('data-notification-badge="true"');
  });

  it("renders monthly earnings as an accessible vertical paid and queued chart", () => {
    const html = renderToStaticMarkup(
      <DashboardScreen
        agentName="Kevin Njoroge"
        leads={seedLeads}
        payouts={seedPayouts}
        notifications={seedNotifications}
        tab="stats"
        showActivity={false}
        activityAction="/activity"
      />,
    );

    expect(html).toContain('aria-label="Monthly earnings chart"');
    expect(html).toContain('data-chart-orientation="vertical"');
    expect(html).toContain('aria-label="May: KES 22,500 paid, KES 0 queued"');
    expect(html).toContain("Queued");
    expect(html).not.toContain("grid-cols-[32px_1fr_48px]");
    expect(html).not.toContain("style=");
  });

  it("animates only the leading edge of the conversion charge battery", () => {
    const html = renderToStaticMarkup(
      <DashboardScreen
        agentName="Kevin Njoroge"
        leads={seedLeads}
        payouts={seedPayouts}
        notifications={seedNotifications}
        tab="stats"
        showActivity={false}
        activityAction="/activity"
      />,
    );

    expect(html).toContain('role="img" aria-label="Conversion charge: 33%"');
    expect(html).toContain('data-charge-pulse="true"');
    expect(html.match(/data-charge-pulse="true"/g)).toHaveLength(1);
    expect(html).toContain("charge-pulse");
  });

  it("renders the earnings split as paid and queued segments", () => {
    const html = renderToStaticMarkup(
      <DashboardScreen
        agentName="Kevin Njoroge"
        leads={seedLeads}
        payouts={seedPayouts}
        notifications={seedNotifications}
        tab="stats"
        showActivity={false}
        activityAction="/activity"
      />,
    );

    expect(html).toContain('data-chart="earnings-breakdown"');
    expect(html).toContain('aria-label="Earnings: KES 7,500 queued and KES 30,000 paid"');
    expect(html).toContain('fill="#4ED99B"');
    expect(html).toContain('fill="#1D5C4A"');
    expect(html).not.toContain("<progress");
  });

  it("keeps Bolt conduct qualification conditional without a client component", () => {
    const html = renderToStaticMarkup(<AddLeadScreen />);

    expect(html).toContain('name="bolt"');
    expect(html).toContain('class="bolt-conduct"');
    expect(html).toContain("Do they have good conduct?");
    expect(html).not.toContain('name="conduct" value="true" required=""');
  });

  it("posts new leads to a stable route instead of a generated Server Action", () => {
    const html = renderToStaticMarkup(<AddLeadScreen />);

    expect(html).toContain('action="/api/portal/leads"');
    expect(html).toContain('method="post"');
    expect(html).not.toContain("$ACTION_ID");
  });

  it("maps lead statuses to accessible badges", () => {
    const html = renderToStaticMarkup(<StatusPill status="Converted" />);
    expect(html).toContain("Converted");
    expect(html).toContain("bg-[#E3EFE9]");
  });
});
