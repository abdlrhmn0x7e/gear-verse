export function generateRandomId(isPositive = true) {
  if (isPositive) {
    return Math.floor(Math.random() * 1000000);
  }

  return -Math.floor(Math.random() * 1000000);
}
