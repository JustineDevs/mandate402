export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = "validation_error") {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized request.", code = "unauthorized") {
    super(message, 401, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found.", code = "not_found") {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "conflict") {
    super(message, 409, code);
  }
}

export class InvalidStateError extends ConflictError {
  constructor(message: string, code = "invalid_state") {
    super(message, code);
  }
}
