/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate that a string is a valid UUID v4
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validate age is within supported range (2-10)
 */
export function isValidChildAge(age: number): boolean {
  return Number.isInteger(age) && age >= 2 && age <= 10
}

/**
 * Validate page count is within range (8-24)
 */
export function isValidPageCount(count: number): boolean {
  return Number.isInteger(count) && count >= 8 && count <= 24
}
