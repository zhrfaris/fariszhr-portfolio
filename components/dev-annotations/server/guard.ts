// Shared dev-only gate for every annotation API route. In production these
// routes behave as if they don't exist.
export function prod404(): Response | null {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }
  return null;
}
