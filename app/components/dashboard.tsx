import Link from "next/link";

import { formatKes, getDashboardMetrics } from "@/lib/jiwambe/domain";
import { BIKES, EXPIRY_DAYS, monthlyEarnings } from "@/lib/jiwambe/mock-data";
import type { DashboardTab, Lead, Notification, Payout } from "@/lib/jiwambe/types";

import {
  ChoiceGroup,
  Chip,
  ExpiryChip,
  Field,
  inputClass,
  Notice,
  primaryButtonClass,
  Sheet,
  StatusPill,
  type FormAction,
} from "./ui";

const PIPE = ["Referred", "Visited office", "Converted"];

function ChargeBattery({ percentage }: { percentage: number }) {
  const lit = Math.min(10, Math.max(0, Math.round(percentage / 10)));
  return (
    <div role="img" aria-label={`Conversion charge: ${percentage}%`} className="flex items-center gap-3">
      <div aria-hidden="true" className="relative flex gap-[3px] rounded-lg border-2 border-white/35 p-[5px] after:absolute after:-right-[7px] after:top-1/2 after:h-3 after:w-1 after:-translate-y-1/2 after:rounded-r-sm after:bg-white/35">
        {Array.from({ length: 10 }).map((_, index) => (
          <span
            key={index}
            data-charge-pulse={index === lit - 1 ? "true" : undefined}
            className={`h-[22px] w-[11px] rounded-[3px] ${index < lit ? "bg-[#4ED99B] shadow-[0_0_8px_rgba(78,217,155,.4)]" : "bg-white/10"} ${index === lit - 1 ? "charge-pulse" : ""}`}
          />
        ))}
      </div>
      <div>
        <div className="text-[22px] font-bold tracking-[-0.02em] text-white">{percentage}%</div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">conversion charge</div>
      </div>
    </div>
  );
}

function LeadCard({ lead, tab }: { lead: Lead; tab: DashboardTab }) {
  const dead = ["Expired", "Lost"].includes(lead.status);
  const activeIndex = lead.status === "Commission paid" ? 2 : PIPE.indexOf(lead.status);
  return (
    <Link href={`/?view=dashboard&tab=${tab}&lead=${lead.id}`} className={`jw-card3d fade-up mb-3 block rounded-[18px] p-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8BDDB6] ${dead ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold tracking-[-0.01em]">{lead.name}</h3>
          <p className="mt-0.5 text-[13px] text-[#767E79]">{lead.phone} · {lead.bike} · {lead.tenure} mo{!lead.hasDL && <span className="font-semibold text-[#B07C0E]"> · No DL</span>}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5"><ExpiryChip daysLeft={lead.daysLeft} status={lead.status} /><StatusPill status={lead.status} /></div>
      </div>
      {!dead && (
        <div className="mt-[13px] flex items-center gap-[5px]" aria-label={`Pipeline status: ${lead.status}`}>
          {PIPE.map((step, index) => <span key={step} className={`h-1.5 flex-1 rounded-full ${index <= activeIndex ? "bg-gradient-to-b from-[#1D5C4A] to-[#123E31] shadow-[0_1px_4px_rgba(29,92,74,.35)]" : "bg-[#E4E8E4]"}`} />)}
          <span className="ml-1 whitespace-nowrap text-[10.5px] font-semibold text-[#767E79]">{lead.status === "Commission paid" ? "Paid ✓" : PIPE[activeIndex]}</span>
        </div>
      )}
      <div className="mt-2.5 flex justify-between gap-3 text-xs text-[#767E79]">
        <span>Added {lead.added}</span>
        {lead.commission ? <span className="font-bold text-[#123E31]">{formatKes(lead.commission)}{lead.status === "Converted" ? " queued" : ""}</span> : <span>Tap for timeline →</span>}
      </div>
    </Link>
  );
}

function PayoutsTab({ payouts }: { payouts: Payout[] }) {
  return (
    <>
      <p className="mx-0.5 mb-3 mt-1.5 text-[12.5px] leading-5 text-[#767E79]">Commissions are paid to your M-Pesa in the daily batch after a deposit clears.</p>
      {payouts.map((payout) => (
        <article key={payout.id} className="jw-card3d fade-up mb-3 flex items-center gap-[13px] rounded-[18px] p-4">
          <div className="grid size-[42px] shrink-0 place-items-center rounded-[13px] bg-[#E3EFE9] text-lg">📲</div>
          <div className="min-w-0 flex-1"><h3 className="text-[15.5px] font-bold">{formatKes(payout.amount)}</h3><p className="mt-0.5 text-[12.5px] text-[#767E79]">{payout.note}</p><p className="mt-0.5 text-[11.5px] font-bold text-[#123E31]">M-Pesa · {payout.ref}</p></div>
          <time className="whitespace-nowrap text-[11.5px] text-[#767E79]">{payout.date}</time>
        </article>
      ))}
    </>
  );
}

function StatTile({ value, label, sub }: { value: string | number; label: string; sub: string }) {
  return <article className="jw-card3d fade-up rounded-2xl px-[15px] py-3.5"><div className="text-2xl font-extrabold tracking-[-0.03em]">{value}</div><h3 className="mt-0.5 text-[11.5px] font-bold text-[#454D49]">{label}</h3><p className="mt-0.5 text-[11px] text-[#767E79]">{sub}</p></article>;
}

function MonthlyEarningsChart() {
  const maxTotal = Math.max(...monthlyEarnings.map((item) => item.paid + item.pending), 1);
  const chartHeight = 70;

  return (
    <div role="group" aria-label="Monthly earnings chart" data-chart-orientation="vertical">
      <div className="flex h-[118px] items-end gap-3.5">
        {monthlyEarnings.map((item) => {
          const total = item.paid + item.pending;
          const paidHeight = (item.paid / maxTotal) * chartHeight;
          const queuedHeight = (item.pending / maxTotal) * chartHeight;
          const paidY = chartHeight - paidHeight;
          const queuedY = paidY - queuedHeight;
          const gradientId = `paid-${item.month.toLowerCase()}`;
          const patternId = `queued-${item.month.toLowerCase()}`;

          return (
            <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className={`mb-1 text-[10.5px] font-bold ${total ? "text-[#111417]" : "text-[#767E79]"}`}>{total ? `${total / 1000}k` : "—"}</span>
              <svg
                role="img"
                aria-label={`${item.month}: ${formatKes(item.paid)} paid, ${formatKes(item.pending)} queued`}
                className="h-[70px] w-full max-w-[54px] overflow-visible"
                viewBox={`0 0 54 ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#1D5C4A" />
                    <stop offset="1" stopColor="#123E31" />
                  </linearGradient>
                  <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="4" height="8" fill="#4ED99B" />
                    <rect x="4" width="4" height="8" fill="#B7F0D4" />
                  </pattern>
                </defs>
                {total === 0 && <rect x="0" y="66" width="54" height="4" rx="2" fill="#E4E8E4" />}
                {item.pending > 0 && <rect x="0" y={queuedY} width="54" height={queuedHeight} rx="5" fill={`url(#${patternId})`} />}
                {item.paid > 0 && <rect x="0" y={paidY} width="54" height={paidHeight} rx="5" fill={`url(#${gradientId})`} />}
              </svg>
              <span className="mt-2 text-[11.5px] font-semibold text-[#454D49]">{item.month}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-3.5 text-[11px] text-[#767E79]">
        <span className="inline-flex items-center gap-1.5"><span className="size-[9px] rounded-[3px] bg-[#1D5C4A]" />Paid</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-[9px] rounded-[3px] bg-[#4ED99B]" />Queued</span>
      </div>
    </div>
  );
}

function EarningsBreakdown({ queued, paid }: { queued: number; paid: number }) {
  const total = queued + paid;
  const queuedWidth = total ? (queued / total) * 100 : 0;
  const paidWidth = total ? (paid / total) * 100 : 0;

  return (
    <svg
      role="img"
      aria-label={`Earnings: ${formatKes(queued)} queued and ${formatKes(paid)} paid`}
      data-chart="earnings-breakdown"
      className="h-2 w-full"
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
    >
      <defs>
        <clipPath id="earnings-track">
          <rect width="100" height="8" rx="4" />
        </clipPath>
      </defs>
      <g clipPath="url(#earnings-track)">
        <rect width="100" height="8" fill="#ECEFEC" />
        {queuedWidth > 0 && <rect width={queuedWidth} height="8" fill="#4ED99B" />}
        {paidWidth > 0 && <rect x={queuedWidth} width={paidWidth} height="8" fill="#1D5C4A" />}
      </g>
    </svg>
  );
}

function StatsTab({ leads, payouts }: { leads: Lead[]; payouts: Payout[] }) {
  const metrics = getDashboardMetrics(leads, payouts);
  return (
    <>
      <section className="fade-up mb-3 flex items-center justify-between rounded-[20px] bg-gradient-to-br from-[#226A55] to-[#123E31] p-[18px]">
        <ChargeBattery percentage={metrics.conversionRate} />
        <div className="text-right"><div className="text-xl font-bold text-white">{metrics.converted}<span className="font-medium text-white/40">/{metrics.total}</span></div><div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">converted</div></div>
      </section>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <StatTile label="Total leads" value={metrics.total} sub="all time" />
        <StatTile label="Active now" value={metrics.active} sub="in your pipeline" />
        <StatTile label="Converted" value={metrics.converted} sub={`${metrics.conversionRate}% of all leads`} />
        <StatTile label="Expired / lost" value={metrics.expired} sub="released numbers" />
      </div>
      <section className="jw-card3d fade-up mb-3 rounded-[18px] p-4">
        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#454D49]">Earnings</h3>
        <div className="mb-2 flex justify-between"><div><div className="text-[19px] font-extrabold text-[#123E31]">{formatKes(metrics.pendingTotal)}</div><div className="text-[11.5px] text-[#767E79]">pending payout</div></div><div className="text-right"><div className="text-[19px] font-extrabold">{formatKes(metrics.paidTotal)}</div><div className="text-[11.5px] text-[#767E79]">paid to date</div></div></div>
        <EarningsBreakdown queued={metrics.pendingTotal} paid={metrics.paidTotal} />
        <p className="mt-2.5 text-[11.5px] leading-5 text-[#767E79]">Your commission rate: <strong className="text-[#111417]">5% of deposit</strong> · paid daily via M-Pesa after deposits clear.</p>
      </section>
      <section className="jw-card3d fade-up rounded-[18px] p-4">
        <h3 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#454D49]">Monthly earnings</h3>
        <MonthlyEarningsChart />
      </section>
    </>
  );
}

function LeadDetail({ lead }: { lead: Lead }) {
  const firstName = lead.name.split(" ")[0];
  return (
    <>
      <div className="mb-[18px] flex flex-wrap gap-1.5"><StatusPill status={lead.status} /><ExpiryChip daysLeft={lead.daysLeft} status={lead.status} /><Chip>🏍️ {lead.bike} · {lead.tenure} mo</Chip><Chip tone={lead.hasDL ? "ok" : "warn"}>{lead.hasDL ? "DL ✓" : "No DL yet"}</Chip>{lead.bolt ? <Chip tone={lead.conduct ? "ok" : "warn"}>{lead.conduct ? "Bolt · good conduct" : "Bolt · conduct unverified"}</Chip> : <Chip>Own work</Chip>}</div>
      {["Referred", "Visited office"].includes(lead.status) && <div className="mb-[18px] flex gap-2"><a className="flex-1 rounded-[13px] border-[1.5px] border-[#111417] bg-white p-3 text-center text-sm font-bold" href={`tel:${lead.phone.replace(/\s/g, "")}`}>📞 Call</a><a className="flex-1 rounded-[13px] bg-[#1FA855] p-3 text-center text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgba(31,168,85,.55)]" href={`https://wa.me/254${lead.phone.replace(/\D/g, "").slice(1)}`} target="_blank" rel="noreferrer">💬 WhatsApp</a></div>}
      <ol>
        {lead.events.map((event, index) => {
          const last = index === lead.events.length - 1;
          return <li key={`${event.t}-${event.d}`} className="fade-up flex gap-3.5"><div className="flex w-4 shrink-0 flex-col items-center"><span className={`mt-0.5 size-3.5 shrink-0 rounded-full border-[3px] ${last ? "border-[#1D5C4A] bg-[#1D5C4A] shadow-[0_0_10px_rgba(78,217,155,.4)]" : "border-[#E4E8E4] bg-white"}`} />{!last && <span className="mt-1 w-0.5 flex-1 rounded-full bg-[#E4E8E4]" />}</div><div className={last ? "pb-1" : "pb-[22px]"}><div className={`text-[14.5px] leading-5 ${last ? "font-bold" : "font-semibold"}`}>{event.t}</div><time className="mt-0.5 block text-xs text-[#767E79]">{event.d}</time></div></li>;
        })}
      </ol>
      {["Referred", "Visited office"].includes(lead.status) && <div className="mt-5 rounded-[14px] border border-[#B07C0E]/20 bg-[#FBF2DA] px-3.5 py-3 text-[13px] font-semibold leading-5 text-[#B07C0E]">💡 We’ll notify you the moment {firstName} visits the office or converts.</div>}
    </>
  );
}

function ActivitySheet({ notifications, closeHref }: { notifications: Notification[]; closeHref: string }) {
  return <Sheet title="Activity" closeHref={closeHref}>{notifications.map((item) => <article key={item.id} className="jw-card3d fade-up mb-2.5 flex gap-[13px] rounded-2xl p-[15px]"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ECEFEC] text-[17px]">{item.icon}</div><div className="flex-1"><h3 className="text-[14.5px] font-bold">{item.title}</h3><p className="mt-0.5 text-[13px] leading-5 text-[#454D49]">{item.body}</p><time className="mt-1 block text-[11.5px] text-[#767E79]">{item.time}</time></div></article>)}</Sheet>;
}

export function DashboardScreen({
  agentName,
  leads,
  payouts,
  notifications,
  tab,
  selectedLead,
  showActivity,
  activityAction,
  notice,
}: {
  agentName: string;
  leads: Lead[];
  payouts: Payout[];
  notifications: Notification[];
  tab: DashboardTab;
  selectedLead?: Lead;
  showActivity: boolean;
  activityAction: FormAction;
  notice?: string;
}) {
  const metrics = getDashboardMetrics(leads, payouts);
  const unread = notifications.filter((item) => item.unread).length;
  const closeHref = `/?view=dashboard&tab=${tab}`;
  return (
    <>
      <header className="rounded-b-[26px] bg-gradient-to-br from-[#226A55] to-[#123E31] px-[22px] pb-5 pt-[18px] text-white">
        <div className="fade-up flex items-center justify-between"><div><div className="text-xs text-white/55">Habari,</div><div className="text-[19px] font-bold tracking-[-0.02em]">{agentName}</div></div><form action={activityAction}><input type="hidden" name="tab" value={tab} /><button type="submit" aria-label={`Activity, ${unread} unread`} className="jw-tap relative isolate grid size-10 overflow-visible place-items-center rounded-[13px] border border-white/12 bg-white/8 text-base leading-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8BDDB6]"><span aria-hidden="true">🔔</span>{unread > 0 && <span aria-hidden="true" data-notification-badge="true" className="absolute -right-[5px] -top-[5px] z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#4ED99B] px-1 text-[10.5px] font-extrabold leading-none tabular-nums text-[#123E31] shadow-[0_0_10px_rgba(78,217,155,.53)]">{unread}</span>}</button></form></div>
        <div className="fade-up mt-3.5 flex items-end justify-between"><div><div className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-[#8BDDB6]">Pending payout</div><div className="mt-0.5 text-[33px] font-extrabold leading-tight tracking-[-0.04em]">{formatKes(metrics.pendingTotal)}</div></div><div className="pb-1 text-right text-[11.5px] text-white/60">Paid to date<br /><strong className="text-[13px] text-white/90">{formatKes(metrics.paidTotal)}</strong></div></div>
      </header>
      <nav aria-label="Dashboard sections" className="flex gap-2 px-[22px] pb-2.5 pt-4">
        {(["leads", "payouts", "stats"] as DashboardTab[]).map((item) => <Link key={item} aria-current={tab === item ? "page" : undefined} href={`/?view=dashboard&tab=${item}`} className={`rounded-full border-[1.5px] px-[15px] py-2 text-[13.5px] font-bold capitalize ${tab === item ? "border-[#111417] bg-[#111417] text-white" : "border-[#E4E8E4] bg-white text-[#454D49]"}`}>{item === "leads" ? `Leads (${leads.length})` : item}</Link>)}
      </nav>
      <div className="px-[22px] pb-28 pt-1"><Notice message={notice} tone="success" />{tab === "leads" && (leads.length ? leads.map((lead) => <LeadCard key={lead.id} lead={lead} tab={tab} />) : <div className="rounded-[18px] border border-dashed border-[#1D5C4A]/30 bg-[#E3EFE9] p-6 text-center"><div className="text-3xl">🏍️</div><h2 className="mt-3 font-bold text-[#123E31]">No leads yet</h2><p className="mt-1 text-sm leading-5 text-[#454D49]">Refer your first rider to start building your conversion pipeline.</p></div>)}{tab === "payouts" && <PayoutsTab payouts={payouts} />}{tab === "stats" && <StatsTab leads={leads} payouts={payouts} />}</div>
      <Link href="/?view=add" className="jw-tap fixed bottom-6 right-[max(22px,calc(50%_-_193px))] z-30 flex items-center gap-2 rounded-full bg-[#1D5C4A] px-[22px] py-4 text-base font-bold text-white shadow-[0_14px_28px_-8px_rgba(29,92,74,.55)] focus-visible:ring-4 focus-visible:ring-[#8BDDB6]"><span className="text-xl leading-none">+</span> Refer</Link>
      {selectedLead && <Sheet title={selectedLead.name} closeHref={closeHref}><LeadDetail lead={selectedLead} /></Sheet>}
      {showActivity && <ActivitySheet notifications={notifications} closeHref={closeHref} />}
    </>
  );
}

export function AddLeadScreen({ error }: { error?: string }) {
  return (
    <section className="fade-up px-6 pb-10">
      <Link href="/?view=dashboard" className="inline-block py-5 text-sm font-bold text-[#123E31]">← Dashboard</Link>
      <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em]">New lead</h1>
      <p className="mb-6 mt-1 text-[14.5px] leading-6 text-[#454D49]">Quick KYC — under a minute. Leads expire after <strong>{EXPIRY_DAYS} days</strong> if they don’t convert.</p>
      <Notice message={error} />
      <form action="/api/portal/leads" method="post">
        <Field label="Full name" required><input aria-label="Full name" className={inputClass} name="name" autoComplete="name" placeholder="As it appears on their ID" required minLength={3} /></Field>
        <Field label="Phone number" required hint="Their Safaricom line — used for follow-up."><input aria-label="Phone number" className={inputClass} name="phone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" required /></Field>
        <Field label="National ID number" required><input aria-label="National ID number" className={inputClass} name="idNo" inputMode="numeric" placeholder="e.g. 33456789" required minLength={7} /></Field>
        <ChoiceGroup legend="Do they have a driving licence?" name="hasDL" options={[{ value: "true", label: "Yes" }, { value: "false", label: "Not yet" }]} />
        <Field label="Which bike?" required hint="The OEM they’re leaning towards."><select aria-label="Bike" className={inputClass} name="bike" defaultValue="" required><option value="" disabled>Select a bike…</option>{BIKES.map((bike) => <option key={bike} value={bike}>{bike}</option>)}</select></Field>
        <ChoiceGroup legend="Loan tenure" name="tenure" options={[{ value: "18", label: "18 months" }, { value: "24", label: "24 months" }]} />
        <ChoiceGroup legend="Do they want to be onboarded to Bolt?" name="bolt" options={[{ value: "true", label: "Yes, Bolt rides" }, { value: "false", label: "No, own work" }]} />
        <div className="bolt-conduct">
          <ChoiceGroup legend="Do they have good conduct?" name="conduct" required={false} options={[{ value: "true", label: "Yes" }, { value: "false", label: "Not sure" }]} />
        </div>
        <Field label="Notes (optional)"><textarea aria-label="Notes" className={`${inputClass} min-h-[84px] resize-y`} name="notes" placeholder="e.g. Rides boda in Kasarani, ready this week" /></Field>
        <button className={primaryButtonClass} type="submit">Save lead</button>
      </form>
      <p className="mt-3.5 text-center text-xs leading-5 text-[#767E79]">By saving, you confirm this person agreed to be contacted by Jiwambe.</p>
    </section>
  );
}
