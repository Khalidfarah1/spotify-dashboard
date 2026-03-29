import { describe, it, expect } from 'vitest'
import { generateCodeVerifier, generateCodeChallenge } from './auth'

describe('generateCodeVerifier', () => {
  it('returns a string of length between 43 and 128', () => {
    const verifier = generateCodeVerifier()
    expect(verifier.length).toBeGreaterThanOrEqual(43)
    expect(verifier.length).toBeLessThanOrEqual(128)
  })

  it('only contains URL-safe characters', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/)
  })
})

describe('generateCodeChallenge', () => {
  it('returns a non-empty base64url string', async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    expect(challenge.length).toBeGreaterThan(0)
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/)
  })
})
