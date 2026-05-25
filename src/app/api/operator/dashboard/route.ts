import { getDashboardData } from "@/lib/dashboard-data";
import { jsonErrorFrom, jsonOk } from "@/lib/infrastructure/api";
import { requireOperator } from "@/lib/modules/auth";
import { getOperatorAccessState } from "@/lib/operator-access";

function readBearerToken(request: Request) {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) {
    return undefined;
  }
  return bearer.slice("Bearer ".length);
}

export async function GET(request: Request) {
  try {
    const operator = await requireOperator(request);
    const accessToken = readBearerToken(request);
    const [dashboard, access] = await Promise.all([
      getDashboardData(),
      accessToken
        ? getOperatorAccessState(accessToken, operator.operatorId)
        : Promise.resolve({ profile: null, walletAccounts: [] }),
    ]);
    return jsonOk({
      operator: {
        ...operator,
        onboardingState: access.profile?.onboarding_state,
        preferredWalletProvider: access.profile?.preferred_wallet_provider,
        preferredTreasuryMode: access.profile?.preferred_treasury_mode,
      },
      dashboard,
    });
  } catch (error) {
    const response = jsonErrorFrom(error);
    if (response) {
      return response;
    }

    throw error;
  }
}
