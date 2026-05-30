import { expect, test } from "@playwright/test";

test.describe("public and operator surfaces", () => {
  test("landing loads operator entry copy", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: /social links/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /mandate402 on x/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /mandate402 on github/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /sign in to operator console/i }).first(),
    ).toBeVisible();
  });

  test("operator sign-in surface loads", async ({ page }) => {
    await page.goto("/operator");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /^sign in$/i,
      }),
    ).toBeVisible();
  });
});

test.describe("console auth gate", () => {
  test("unauthenticated /settings redirects to /operator with sanitized next", async ({
    page,
  }) => {
    await page.goto("/settings");
    // App Router client navigation does not always fire `load`; poll the URL.
    await expect(page).toHaveURL(/\/operator\?/, { timeout: 15_000 });
    const url = new URL(page.url());
    expect(url.pathname).toBe("/operator");
    const next = url.searchParams.get("next");
    expect(next).toBeTruthy();
    expect(decodeURIComponent(next ?? "")).toMatch(/^\/settings/);
  });

  test("legacy /operator/connect redirects to settings treasury section", async ({
    page,
  }) => {
    await page.goto("/operator/connect");
    await expect(page).toHaveURL(/\/settings/, { timeout: 15_000 });
    expect(new URL(page.url()).searchParams.get("treasury")).toBe("1");
  });
});
