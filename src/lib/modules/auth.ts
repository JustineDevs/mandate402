import {
  DEMO_OPERATOR_TOKEN,
  getOperatorToken,
} from "@/lib/infrastructure/env";

export type OperatorContext = {
  operatorId: string;
  role: "operator";
};

export class AuthError extends Error {
  constructor(message = "Unauthorized operator request.") {
    super(message);
    this.name = "AuthError";
  }
}

function readPresentedToken(request?: Request) {
  if (!request) {
    return DEMO_OPERATOR_TOKEN;
  }

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return bearer.slice("Bearer ".length);
  }

  return request.headers.get("x-operator-token");
}

export function requireOperator(request?: Request) {
  const expected = getOperatorToken();
  const presented = readPresentedToken(request);

  if (!presented || presented !== expected) {
    throw new AuthError();
  }

  return {
    operatorId:
      expected === DEMO_OPERATOR_TOKEN ? "operator_demo" : "operator_live",
    role: "operator",
  } satisfies OperatorContext;
}
