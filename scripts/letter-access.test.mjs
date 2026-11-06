import assert from "node:assert/strict";
import test from "node:test";
import { createSession, getPublicOrigin, isAccessConfigured, isPasswordCorrect, isSessionValid, SESSION_SECONDS } from "../lib/letter-access.ts";

test("a letter session requires the password and rejects tampering, expiry, and rotated credentials", () => {
  const originalPassword = process.env.LETTER_PASSWORD;
  const originalSecret = process.env.LETTER_SESSION_SECRET;
  try {
    process.env.LETTER_PASSWORD = "87654321";
    process.env.LETTER_SESSION_SECRET = "test-only-session-secret-with-at-least-32-characters";
    assert.equal(isPasswordCorrect("87654321"), true);
    assert.equal(isPasswordCorrect("87654320"), false);
    assert.equal(isPasswordCorrect(" 87654321"), false);
    assert.equal(isPasswordCorrect(null), false);

    const now = Date.UTC(2026, 10, 6);
    const token = createSession(now);
    assert.equal(isSessionValid(token, now), true);
    assert.equal(isSessionValid(token, now - 1000), true);
    assert.equal(isSessionValid(token, now + (SESSION_SECONDS - 1) * 1000), true);
    assert.equal(isSessionValid(token, now + SESSION_SECONDS * 1000), false);
    const tampered = `${token.slice(0, 15)}${token[15] === "x" ? "y" : "x"}${token.slice(16)}`;
    assert.equal(isSessionValid(tampered, now), false);
    assert.equal(isSessionValid("true", now), false);
    assert.equal(isSessionValid(undefined, now), false);

    process.env.LETTER_PASSWORD = "87654320";
    assert.equal(isSessionValid(token, now), false);
    process.env.LETTER_PASSWORD = "87654321";
    process.env.LETTER_SESSION_SECRET = "another-test-secret-with-at-least-32-characters";
    assert.equal(isSessionValid(token, now), false);
    delete process.env.LETTER_SESSION_SECRET;
    assert.equal(isAccessConfigured(), false);
    assert.equal(isSessionValid(token, now), false);
    assert.throws(() => createSession(now));
  } finally {
    if (originalPassword === undefined) delete process.env.LETTER_PASSWORD;
    else process.env.LETTER_PASSWORD = originalPassword;
    if (originalSecret === undefined) delete process.env.LETTER_SESSION_SECRET;
    else process.env.LETTER_SESSION_SECRET = originalSecret;
  }
});

test("browser hosts and ports define the public origin, independently of the listener", () => {
  for (const [url, host, expected] of [
    ["http://0.0.0.0:3123/api/unlock", "localhost:3123", "http://localhost:3123"],
    ["http://0.0.0.0:3123/api/unlock", "192.0.2.10:3123", "http://192.0.2.10:3123"],
    ["http://0.0.0.0:3123/api/unlock", "[::1]:3123", "http://[::1]:3123"],
    ["https://internal:3000/api/unlock", "letter.example:443", "https://letter.example"],
  ]) {
    const request = new Request(url, { headers: { host, "x-forwarded-host": "unrelated.example" } });
    assert.equal(getPublicOrigin(request), expected);
  }
  assert.equal(getPublicOrigin(new Request("http://internal:3000/api/unlock")), null);
  for (const host of ["unrelated.example/elsewhere", "user@unrelated.example", "unrelated.example?query=1"]) {
    assert.equal(getPublicOrigin(new Request("http://internal:3000/api/unlock", { headers: { host } })), null);
  }
});
