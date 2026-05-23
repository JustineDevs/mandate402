const requiredEnv = ["MANDATE402_BASE_URL", "MANDATE402_OPERATOR_BEARER_TOKEN"];

const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error("Production proof failed. Missing required env:");
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

const baseUrl = process.env.MANDATE402_BASE_URL.replace(/\/$/, "");
const operatorToken = process.env.MANDATE402_OPERATOR_BEARER_TOKEN;

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
  await expectStatus("Public homepage", `${baseUrl}/`, 200);
  await expectStatus("Public vendor route", `${baseUrl}/api/vendors`, 200);
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
