import { nanoid } from 'nanoid'

export function generateShortCode(length: number = 8): string {
  return nanoid(length)
}
