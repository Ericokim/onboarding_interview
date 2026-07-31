import Link from "next/link";

import { Field, inputClass, Notice, primaryButtonClass, type FormAction } from "./ui";

export function LoginScreen({ loginAction, error }: { loginAction: FormAction; error?: string }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#123E31]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(170deg,rgba(27,88,70,.28),transparent_40%)]" />
      <section className="fade-up flex-1 px-[26px] pt-14">
        <div className="mb-8 inline-flex items-center gap-2.5">
          <div className="grid size-11 place-items-center rounded-[14px] bg-white text-xl font-extrabold text-[#1D5C4A] shadow-[0_6px_24px_rgba(0,0,0,.25)]">J</div>
          <div className="text-[13px] font-bold uppercase tracking-[0.19em] text-white">Jiwambe Agents</div>
        </div>
        <h1 className="m-0 text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-white">
          Every rider you<br />bring, <span className="text-[#4ED99B]">you earn.</span>
        </h1>
        <p className="mt-4 max-w-[300px] text-[15px] leading-6 text-white/60">
          Refer people to Jiwambe. When they pay their deposit, your commission is queued the same day.
        </p>
      </section>
      <section className="fade-up rounded-t-[26px] bg-[#F6F7F5] px-6 pb-8 pt-[26px]">
        <Notice message={error} />
        <form action={loginAction}>
          <Field label="Phone number" hint="Sign in with your registered agent number.">
            <input id="login-phone" aria-label="Phone number" className={inputClass} name="phone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" required minLength={10} />
          </Field>
          <button className={primaryButtonClass} type="submit">Send my code</button>
        </form>
        <Link href="/?view=apply" className="mt-4 block w-full text-center text-sm text-[#454D49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D5C4A]">
          New here? <strong className="text-[#123E31]">Apply to become an agent →</strong>
        </Link>
      </section>
    </div>
  );
}

export function OtpScreen({ phone, verifyAction, error }: { phone: string; verifyAction: FormAction; error?: string }) {
  return (
    <section className="fade-up px-6 pb-10">
      <Link href="/" className="inline-block py-5 text-sm font-bold text-[#123E31]">← Change number</Link>
      <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.02em] text-[#111417]">Check your SMS</h1>
      <p className="mb-[26px] mt-1.5 text-[14.5px] text-[#454D49]">We sent a 6-digit code to <strong>{phone || "07XX XXX XXX"}</strong></p>
      <Notice message={error} />
      <form action={verifyAction}>
        <input type="hidden" name="phone" value={phone} />
        <Field label="Verification code" hint="Demo: enter 123456">
          <input aria-label="Verification code" className={`${inputClass} text-center text-2xl font-bold tracking-[0.45em]`} name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="······" required pattern="\d{6}" />
        </Field>
        <button className={primaryButtonClass} type="submit">Verify &amp; open my dashboard</button>
      </form>
    </section>
  );
}

export function ApplyScreen({ error }: { error?: string }) {
  return (
    <section className="fade-up px-6 pb-10">
      <Link href="/" className="inline-block py-5 text-sm font-bold text-[#123E31]">← Sign in instead</Link>
      <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em]">Become a Jiwambe agent</h1>
      <p className="mb-6 mt-1 text-[14.5px] leading-6 text-[#454D49]">Tell us about yourself. Our team reviews applications within <strong>1 business day</strong>. All fields are required.</p>
      <Notice message={error} />
      <form action="/api/portal/applications" method="post" encType="multipart/form-data">
        <Field label="Full name" required><input aria-label="Full name" className={inputClass} name="name" autoComplete="name" placeholder="As it appears on your ID" required minLength={3} /></Field>
        <Field label="Phone number" required hint="You’ll sign in with this number. Commissions are paid to it via M-Pesa."><input aria-label="Phone number" className={inputClass} name="phone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" required /></Field>
        <Field label="National ID number" required><input aria-label="National ID number" className={inputClass} name="idNo" inputMode="numeric" placeholder="e.g. 33456789" required minLength={7} /></Field>
        <Field label="Copy of national ID" required hint="A clear photo of the front of your ID — this mock records only the filename."><input aria-label="Upload national ID" className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#E3EFE9] file:px-3 file:py-2 file:font-bold file:text-[#123E31]`} name="idFile" type="file" accept="image/*" capture="environment" required /></Field>
        <Field label="Where are you based?" required><input aria-label="Area" className={inputClass} name="area" placeholder="e.g. Kasarani, Nairobi" required minLength={2} /></Field>
        <button className={primaryButtonClass} type="submit">Submit application</button>
      </form>
      <p className="mt-3.5 text-center text-xs leading-5 text-[#767E79]">By applying you agree to Jiwambe’s agent terms and commission policy.</p>
    </section>
  );
}

export function PendingReview({ name, phone, approveAction }: { name: string; phone: string; approveAction: FormAction }) {
  return (
    <section className="fade-up px-7 pb-10 pt-20 text-center">
      <div className="relative mx-auto mb-6 grid size-[84px] place-items-center rounded-[26px] bg-[#FBF2DA] text-4xl after:absolute after:-inset-1.5 after:animate-[spinSlow_14s_linear_infinite] after:rounded-[32px] after:border-[2.5px] after:border-dashed after:border-[#B07C0E]/40">📋</div>
      <h1 className="text-2xl font-bold tracking-[-0.02em]">Application received</h1>
      <p className="mx-auto mt-2.5 max-w-[300px] text-[14.5px] leading-6 text-[#454D49]">Karibu, <strong>{name.split(" ")[0] || "agent"}</strong>. Our team is reviewing your application. We’ll SMS <strong>{phone || "your number"}</strong> the moment you’re approved.</p>
      <div className="mt-[26px] flex items-center gap-3 rounded-2xl border border-[#E4E8E4] bg-white px-4 py-3.5 text-left"><span className="text-lg">💡</span><span className="text-[13px] leading-5 text-[#454D49]">Start thinking of your first referrals — riders switching to electric are your fastest conversions.</span></div>
      <form action={approveAction} className="mt-10">
        <button type="submit" className="w-full rounded-2xl border-[1.5px] border-dashed border-[#767E79] px-4 py-4 text-sm font-bold text-[#767E79] focus-visible:ring-4 focus-visible:ring-[#E3EFE9]">▶ Demo: simulate backoffice approval</button>
      </form>
    </section>
  );
}
