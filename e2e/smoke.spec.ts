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
      page.getByRole("link", { name: /continue to operator console/i }).first(),
    ).toBeVisible();
  });

  test("operator sign-in surface loads", async ({ page }) => {
    await page.goto("/operator");
    await expect(
      page.getByText("Sign in with your Supabase operator account.", {
        exact: true,
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
});
