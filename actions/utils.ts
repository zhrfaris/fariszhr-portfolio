/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export async function countRequestDuration<Input, Output>(
  fn: (input: Input) => Promise<Output>,
  input: Input
): Promise<Output> {
  const startTime = new Date().getTime();
  const result = await fn(input);
  const endTime = new Date().getTime();
  const duration = endTime - startTime; // in milliseconds

  if (process.env.NODE_ENV === "development") {
    console.log(`${fn.name} took ${duration}ms`);
  }

  return result;
}

/**
 * The message to return from a failed action: the generic one in production,
 * with the real reason appended in development. Prisma validation errors dump
 * the whole query first, so only their last line (the actual reason) is kept.
 */
export function actionErrorMessage(generic: string, error: unknown): string {
  if (process.env.NODE_ENV !== "development") return generic;
  const raw = error instanceof Error ? error.message : String(error);
  const reason =
    raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .pop() ?? raw;
  return `${generic}: ${reason}`;
}
