export const TAX_RATE = Number(process.env.TAX_RATE ?? 0);

export function calculateTax(subtotal: number) {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}
