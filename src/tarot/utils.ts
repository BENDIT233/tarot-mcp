/**
 * Generate a random number between 0 and 1.
 * Uses Math.random() for compatibility across all environments.
 */
export function getSecureRandom(): number {
  return Math.random();
}