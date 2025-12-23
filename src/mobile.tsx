// Deprecated entry. Keep file only to avoid 404 on legacy links.
console.warn("[mobile.tsx] Deprecated. Redirecting to root.");
if (typeof window !== "undefined") {
  window.location.replace("/");
}
