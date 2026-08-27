/**
 * Returns the currency symbol for a given currency code.
 * Shared across invoice and receipt modules.
 */
export const getCurrencySymbol = (currency: string): string =>
  ({ NGN: "₦", USD: "$", GBP: "£", EUR: "€" })[currency] ?? "₦";
