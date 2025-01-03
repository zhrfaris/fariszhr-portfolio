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
