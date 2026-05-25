import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

const { decodeJwt } = await import("jose");

const requiredEnv = ["MANDATE402_BASE_URL"];

const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error("Production proof failed. Missing required env:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const baseUrl = process.env.MANDATE402_BASE_URL.replace(/\/$/, "");

function tryDecodeJwt(token) {
  try {
    return decodeJwt(token);
  } catch {
    return null;
  }
}

function assertOperatorBearerToken(token) {
  const payload = tryDecodeJwt(token);
  if (!payload) {
    throw new Error(
      "MANDATE402_OPERATOR_BEARER_TOKEN is not a valid operator session token.",
    );
  }

  if (payload.role === "anon") {
    throw new Error(
      "MANDATE402_OPERATOR_BEARER_TOKEN is an anonymous Supabase token, not an operator session token.",
    );
  }
}

function readOperatorToken() {
  const envToken = process.env.MANDATE402_OPERATOR_BEARER_TOKEN?.trim();
  const decodedEnvToken = envToken ? tryDecodeJwt(envToken) : null;

  if (envToken && decodedEnvToken?.role && decodedEnvToken.role !== "anon") {
    return envToken;
  }

  const email = process.env.MANDATE402_OPERATOR_EMAIL?.trim();
  const password = process.env.MANDATE402_OPERATOR_PASSWORD?.trim();
  if (!email || !password) {
    if (envToken && decodedEnvToken?.role === "anon") {
      throw new Error(
        "MANDATE402_OPERATOR_BEARER_TOKEN is an anonymous Supabase token. Provide a real operator access token or set MANDATE402_OPERATOR_EMAIL and MANDATE402_OPERATOR_PASSWORD.",
      );
    }
    throw new Error(
      "Provide either MANDATE402_OPERATOR_BEARER_TOKEN or the pair MANDATE402_OPERATOR_EMAIL + MANDATE402_OPERATOR_PASSWORD.",
    );
  }

  return null;
}

async function readOperatorTokenFromBrowser() {
  const email = process.env.MANDATE402_OPERATOR_EMAIL?.trim();
  const password = process.env.MANDATE402_OPERATOR_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error(
      "Provide either MANDATE402_OPERATOR_BEARER_TOKEN or the pair MANDATE402_OPERATOR_EMAIL + MANDATE402_OPERATOR_PASSWORD.",
    );
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/operator`, {
      waitUntil: "domcontentloaded",
      timeout: 120_000,
    });

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await page.waitForFunction(
      () =>
        location.pathname === "/operator" ||
        location.pathname === "/operator/connect" ||
        location.pathname.startsWith("/operator/"),
      undefined,
      { timeout: 120_000 },
    );

    const token = await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (!key.includes("auth-token")) {
          continue;
        }

        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        try {
          const parsed = JSON.parse(raw);
          if (
            typeof parsed?.access_token === "string" &&
            parsed.access_token.length > 0
          ) {
            return parsed.access_token;
          }

          if (
            Array.isArray(parsed) &&
            typeof parsed[0] === "object" &&
            parsed[0] !== null &&
            typeof parsed[0].access_token === "string"
          ) {
            return parsed[0].access_token;
          }
        } catch {}
      }

      return null;
    });

    if (!token) {
      throw new Error(
        "Browser sign-in completed, but no Supabase access token was found in storage.",
      );
    }

    return token;
  } finally {
    await browser.close();
  }
}

async function expectStatus(name, url, expected, init = {}) {
  const response = await fetch(url, init);
  if (response.status !== expected) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `${name} expected ${expected} but got ${response.status}. ${text}`.trim(),
    );
  }
  return response;
}

async function main() {
  const operatorToken =
    readOperatorToken() ?? (await readOperatorTokenFromBrowser());
  assertOperatorBearerToken(operatorToken);
  await expectStatus("Public homepage", `${baseUrl}/`, 200);
  await expectStatus("Protected vendor route without auth", `${baseUrl}/api/vendors`, 401);
  await expectStatus(
    "Protected vendor route with auth",
    `${baseUrl}/api/vendors`,
    200,
    {
      headers: {
        authorization: `Bearer ${operatorToken}`,
      },
    },
  );
  await expectStatus(
    "Protected system route without auth",
    `${baseUrl}/api/system`,
    401,
  );
  await expectStatus(
    "Protected system route with auth",
    `${baseUrl}/api/system`,
    200,
    {
      headers: {
        authorization: `Bearer ${operatorToken}`,
      },
    },
  );
  await expectStatus(
    "Protected fallback route without auth",
    `${baseUrl}/api/fallback-gate`,
    401,
  );
  await expectStatus(
    "Protected fallback route with auth",
    `${baseUrl}/api/fallback-gate`,
    200,
    {
      headers: {
        authorization: `Bearer ${operatorToken}`,
      },
    },
  );
  await expectStatus(
    "Protected operator dashboard with auth",
    `${baseUrl}/api/operator/dashboard`,
    200,
    {
      headers: {
        authorization: `Bearer ${operatorToken}`,
      },
    },
  );

  if (process.env.MANDATE402_WORKER_CONTROL_URL?.trim()) {
    const workerUrl = process.env.MANDATE402_WORKER_CONTROL_URL.replace(
      /\/$/,
      "",
    );
    await expectStatus(
      "Worker control route without auth",
      `${workerUrl}/control/execute`,
      401,
      {
        method: "POST",
      },
    );
  }

  console.log("Production proof checks passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
