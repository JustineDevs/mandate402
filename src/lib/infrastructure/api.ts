import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AppError } from "@/lib/domain/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    init,
  );
}

export function jsonCreated<T>(data: T) {
  return jsonOk(data, { status: 201 });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
    },
    { status },
  );
}

export function jsonErrorFrom(error: unknown) {
  if (error instanceof AppError) {
    return jsonError(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return jsonError("Invalid request body.", 400);
  }

  if (error instanceof SyntaxError) {
    return jsonError("Invalid JSON request body.", 400);
  }

  return null;
}
