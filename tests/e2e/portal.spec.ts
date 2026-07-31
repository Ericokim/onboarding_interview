import { expect, test } from "@playwright/test";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Phone number").fill("0712 345 678");
  await page.getByRole("button", { name: "Send my code" }).click();
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: /Verify & open/i }).click();
  await expect(page).toHaveURL(/view=dashboard/);
}

test("demo OTP opens the SSR dashboard and a lead can be saved", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Every rider you/i })).toBeVisible();

  await page.getByLabel("Phone number").fill("0712 345 678");
  await page.getByRole("button", { name: "Send my code" }).click();
  await expect(page).toHaveURL(/view=otp/);

  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: /Verify & open/i }).click();
  await expect(page).toHaveURL(/view=dashboard/);
  await expect(page.getByText("Faith Wanjiru")).toBeVisible();

  await page.getByRole("link", { name: "stats" }).click();
  await expect(page.getByText("conversion charge")).toBeVisible();

  await page.getByRole("link", { name: /Leads \(6\)/ }).click();
  await page.getByRole("link", { name: /Faith Wanjiru/ }).click();
  await expect(page.getByRole("dialog", { name: "Faith Wanjiru" })).toBeVisible();
  await page.getByRole("link", { name: "Close" }).click();

  await page.getByRole("link", { name: "+ Refer", exact: true }).click();
  await page.getByLabel("Full name").fill("Peter Maina");
  await page.getByLabel("Phone number").fill("0700 000 001");
  await page.getByLabel("National ID number").fill("33445566");
  await page.getByRole("group", { name: /driving licence/i }).getByText("Yes", { exact: true }).click();
  await page.getByLabel("Bike").selectOption("Spiro");
  await page.getByRole("group", { name: /loan tenure/i }).getByText("24 months", { exact: true }).click();
  await page.getByRole("group", { name: /onboarded to Bolt/i }).getByText("No, own work", { exact: true }).click();
  await page.getByRole("button", { name: "Save lead" }).click();

  await expect(page).toHaveURL(/view=dashboard/);
  await expect(page.getByText(/Peter saved/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Peter Maina/ })).toBeVisible();
});

test("agent application and mock backoffice approval work without a database", async ({ page }) => {
  await page.goto("/?view=apply");
  await page.getByLabel("Full name").fill("Jane Wanjiku");
  await page.getByLabel("Phone number").fill("0722 111 222");
  await page.getByLabel("National ID number").fill("33456789");
  await page.getByLabel("Upload national ID").setInputFiles({
    name: "national-id.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("mock national id"),
  });
  await page.getByLabel("Area").fill("Kasarani, Nairobi");
  await page.getByRole("button", { name: "Submit application" }).click();

  await expect(page).toHaveURL(/view=pending/);
  await expect(page.getByText(/Karibu, Jane/)).toBeVisible();
  await page.getByRole("button", { name: /simulate backoffice approval/i }).click();

  await expect(page).toHaveURL(/view=dashboard/);
  await expect(page.getByText("Jane Wanjiku")).toBeVisible();
  await expect(page.getByText("No leads yet")).toBeVisible();
});

test("stats match the paid and queued mock earnings and Bolt conduct is conditional", async ({ page }) => {
  await page.goto("/?view=dashboard&tab=stats");
  await expect(page.getByRole("group", { name: "Monthly earnings chart" })).toBeVisible();
  await expect(page.getByRole("img", { name: "May: KES 22,500 paid, KES 0 queued" })).toBeVisible();
  await expect(page.getByLabel("Earnings: KES 7,500 queued and KES 30,000 paid")).toBeVisible();
  const pulse = page.locator('[data-charge-pulse="true"]');
  await expect(pulse).toHaveCount(1);
  await expect(pulse).toHaveCSS("animation-name", "chargePulse");
  await expect(pulse).toHaveCSS("animation-duration", "2.2s");

  await page.goto("/?view=add");
  const conduct = page.getByRole("group", { name: /good conduct/i });
  await expect(conduct).toBeHidden();
  await page.getByRole("group", { name: /onboarded to Bolt/i }).getByText("Yes, Bolt rides", { exact: true }).click();
  await expect(conduct).toBeVisible();
});

test("notification badge shows the unread number with v4 geometry", async ({ page }) => {
  await page.goto("/?view=dashboard");
  const button = page.getByRole("button", { name: "Activity, 3 unread" });
  const badge = page.locator('[data-notification-badge="true"]');

  await expect(button).toBeVisible();
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText("3");

  const box = await badge.boundingBox();
  expect(box?.height).toBeCloseTo(18, 4);
  expect(box?.width).toBeGreaterThanOrEqual(18);
});

test("invalid OTP, activity, payouts, and lead contact details match the prototype", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Phone number").fill("0712 345 678");
  await page.getByRole("button", { name: "Send my code" }).click();
  await page.getByLabel("Verification code").fill("654321");
  await page.getByRole("button", { name: /Verify & open/i }).click();
  await expect(page.getByText(/code is incorrect/i)).toBeVisible();

  await signIn(page);
  await page.getByRole("button", { name: "Activity, 3 unread" }).click();
  await expect(page.getByRole("dialog", { name: "Activity" })).toBeVisible();
  await expect(page.getByText("Amina Hassan visited the office")).toBeVisible();
  await page.getByRole("link", { name: "Close" }).click();
  await expect(page.getByRole("button", { name: "Activity, 0 unread" })).toBeVisible();

  await page.getByRole("link", { name: "payouts" }).click();
  await expect(page.getByText("UGK3XG91TQ")).toBeVisible();
  await expect(page.getByText("KES 15,000")).toBeVisible();

  await page.getByRole("link", { name: /Leads \(6\)/ }).click();
  await page.getByRole("link", { name: /Amina Hassan/ }).click();
  await expect(page.getByRole("link", { name: /Call/ })).toHaveAttribute("href", "tel:0722409336");
  await expect(page.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/254722409336");
});

test("an active rider phone cannot be referred twice", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "+ Refer", exact: true }).click();
  await page.getByLabel("Full name").fill("Duplicate Rider");
  await page.getByLabel("Phone number").fill("0798 115 402");
  await page.getByLabel("National ID number").fill("33445566");
  await page.getByRole("group", { name: /driving licence/i }).getByText("Yes", { exact: true }).click();
  await page.getByLabel("Bike").selectOption("Spiro");
  await page.getByRole("group", { name: /loan tenure/i }).getByText("24 months", { exact: true }).click();
  await page.getByRole("group", { name: /onboarded to Bolt/i }).getByText("No, own work", { exact: true }).click();
  await page.getByRole("button", { name: "Save lead" }).click();

  await expect(page).toHaveURL(/view=add/);
  await expect(page.getByText(/already has an active lead/i)).toBeVisible();
});
