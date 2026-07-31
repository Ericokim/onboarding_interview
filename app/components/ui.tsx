import Link from "next/link";
import type { ReactNode } from "react";

import type { LeadStatus } from "@/lib/jiwambe/types";

export type FormAction = string | ((formData: FormData) => void | Promise<void>);

const statusClasses: Record<LeadStatus, string> = {
  Referred: "bg-[#ECEFEC] text-[#454D49]",
  "Visited office": "bg-[#E9EEFC] text-[#2F5FE3]",
  Converted: "bg-[#E3EFE9] text-[#123E31]",
  "Commission paid": "bg-[#111417] text-[#8BDDB6]",
  Expired: "bg-[#ECEFEC] text-[#767E79]",
  Lost: "bg-[#FAE7E5] text-[#C03A30]",
};

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh justify-center bg-[#D9DDD9] text-[#111417]">
      <div className="relative min-h-dvh w-full max-w-[430px] overflow-x-hidden bg-[#F6F7F5] shadow-[0_0_44px_rgba(0,0,0,0.16)]">
        {children}
      </div>
    </main>
  );
}

export function Field({
  children,
  label,
  hint,
  required,
}: {
  children: ReactNode;
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-[18px] block">
      <span className="mb-[7px] block text-[11px] font-bold uppercase tracking-[0.12em] text-[#454D49]">
        {label}
        {required && <><span className="ml-1 text-[#C03A30]" aria-hidden="true">*</span><span className="sr-only"> (required)</span></>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-5 text-[#767E79]">{hint}</span>}
    </label>
  );
}

export const inputClass = "w-full rounded-[14px] border-[1.5px] border-[#E4E8E4] bg-white px-[15px] py-[14px] text-base text-[#111417] outline-none transition focus:border-[#1D5C4A] focus:ring-4 focus:ring-[#E3EFE9]";

export const primaryButtonClass = "jw-tap w-full rounded-2xl bg-[#1D5C4A] px-4 py-4 text-center text-base font-bold text-white shadow-[0_10px_24px_-12px_rgba(29,92,74,0.8)] transition hover:bg-[#174d3d] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8BDDB6]";

export function StatusPill({ status }: { status: LeadStatus }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClasses[status]}`}>{status}</span>;
}

export function Chip({ children, tone = "mute" }: { children: ReactNode; tone?: "ok" | "warn" | "mute" }) {
  const tones = {
    ok: "bg-[#E3EFE9] text-[#123E31]",
    warn: "bg-[#FBF2DA] text-[#B07C0E]",
    mute: "bg-[#ECEFEC] text-[#454D49]",
  };
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}

export function ExpiryChip({ daysLeft, status }: { daysLeft: number | null; status: LeadStatus }) {
  if (daysLeft === null || ["Converted", "Commission paid", "Lost", "Expired"].includes(status)) return null;
  const classes = daysLeft <= 3
    ? "animate-pulse bg-[#FAE7E5] text-[#C03A30]"
    : daysLeft <= 7
      ? "bg-[#FBF2DA] text-[#B07C0E]"
      : "bg-[#ECEFEC] text-[#767E79]";
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${classes}`}>⏳ {daysLeft}d left</span>;
}

export function Notice({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <div role="status" className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-semibold leading-5 ${tone === "error" ? "border-[#C03A30]/20 bg-[#FAE7E5] text-[#9b2f27]" : "border-[#1D5C4A]/20 bg-[#E3EFE9] text-[#123E31]"}`}>
      {tone === "success" ? "⚡ " : ""}{message}
    </div>
  );
}

export function Sheet({ title, closeHref, children }: { title: string; closeHref: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#0C0D10]/55 animate-[fadeIn_.2s_ease_both]" role="presentation">
      <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[78dvh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-[#F6F7F5] px-[22px] pb-8 pt-2.5 shadow-2xl animate-[sheetUp_.32s_cubic-bezier(.2,.8,.2,1)_both]">
        <div className="mx-auto mb-4 mt-1.5 h-1 w-10 rounded-full bg-[#E4E8E4]" />
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[19px] font-bold text-[#111417]">{title}</h2>
          <Link href={closeHref} aria-label="Close" className="grid size-[30px] place-items-center rounded-full bg-[#ECEFEC] text-sm font-bold text-[#454D49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D5C4A]">✕</Link>
        </header>
        {children}
      </section>
    </div>
  );
}

export function ChoiceGroup({
  legend,
  name,
  options,
  required = true,
}: {
  legend: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <fieldset className="mb-[18px]">
      <legend className="mb-[7px] text-[11px] font-bold uppercase tracking-[0.12em] text-[#454D49]">
        {legend}{required && <span className="ml-1 text-[#C03A30]" aria-hidden="true">*</span>}
      </legend>
      <div className="flex gap-2">
        {options.map((option) => (
          <label key={option.value} className="flex-1 cursor-pointer">
            <input className="peer sr-only" type="radio" name={name} value={option.value} required={required} />
            <span className="block rounded-[14px] border-[1.5px] border-[#E4E8E4] bg-white px-2 py-[14px] text-center text-[15px] font-bold text-[#454D49] transition peer-checked:border-[#1D5C4A] peer-checked:bg-[#E3EFE9] peer-checked:text-[#123E31] peer-focus-visible:ring-4 peer-focus-visible:ring-[#8BDDB6]">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
