export class IncError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function requireInput(condition, code, message, details) {
  if (!condition) throw new IncError(code, message, details);
}
