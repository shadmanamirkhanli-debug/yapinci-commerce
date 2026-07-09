export function toNumber(value: { toString(): string } | number | null | undefined) {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value);
}
