import * as crypto from 'crypto'

export function createHash(src: string): string {
  const hash = crypto
    .createHash('md5')
    .update(src)
    .digest('base64')
  return hash
    .replace('+', '-')
    .replace('/', '_')
    .replace('=', '')
}
