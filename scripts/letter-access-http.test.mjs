import assert from "node:assert/strict";
import test from "node:test";

// Run against `next start --hostname 0.0.0.0`, not a loopback-only listener.
const base = new URL(process.env.LETTER_TEST_URL ?? "http://localhost:3124").origin;
const password = process.env.LETTER_PASSWORD;
// Set LETTER_TEST_ACCESS_UNCONFIGURED=1 only against a server started without gate credentials.
const unconfigured = process.env.LETTER_TEST_ACCESS_UNCONFIGURED === "1";

test("the public portal exposes exactly two generic entries without requiring a session", async () => {
  for (const cookie of [undefined, "letter_access=invalid"]) {
    const page = await fetch(`${base}/`, { headers: cookie ? { cookie } : {}, redirect: "manual" });
    assert.equal(page.status, 200);
    assert.equal(page.headers.has("location"), false, "the portal is not a letter compatibility redirect");
    const html = await page.text();
    const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(links, ["/1000", "/christmas"]);
    assert.match(html, /1000天情书/);
    assert.match(html, /圣诞树/);
    assert.doesNotMatch(html, /\/api\/memories\//);
    assert.equal(page.headers.has("set-cookie"), false);
  }
});

test("anonymous private pages and RSC requests return to their own native login destination", async () => {
  for (const destination of ["/1000", "/christmas"]) {
    for (const headers of [{}, { RSC: "1" }]) {
      const locked = await fetch(`${base}${destination}`, { headers, redirect: "manual" });
      assert.equal(locked.status, 307);
      const location = new URL(locked.headers.get("location"));
      assert.equal(location.origin, base);
      assert.equal(location.pathname, "/unlock");
      assert.equal(location.searchParams.get("next"), destination);
      assert.match(locked.headers.get("cache-control"), /private.*no-store/);
    }
    const form = await fetch(`${base}/unlock?next=${encodeURIComponent(destination)}`);
    assert.equal(form.status, 200);
    const html = await form.text();
    assert.match(html, /<form\b[^>]*action="\/api\/unlock"[^>]*method="post"/);
    const returnInput = html.match(/<input\b[^>]*name="returnTo"[^>]*>/)?.[0] ?? "";
    assert.match(returnInput, new RegExp(`value="${destination}"`));
  }
});

test("a browser can unlock and stay on its own origin behind a wildcard listener", { skip: unconfigured }, async () => {
  assert.ok(/^\d{8}$/.test(password ?? ""), "Load the local server credentials with --env-file=.env.local");
  const submit = (value, origin = base, returnTo = "/1000") => fetch(`${base}/api/unlock`, {
    method: "POST",
    headers: { origin },
    body: new URLSearchParams({ password: value, returnTo }),
    redirect: "manual",
  });
  for (const destination of ["/1000", "/christmas"]) {
    const wrong = await submit(password === "00000000" ? "11111111" : "00000000", base, destination);
    assert.equal(wrong.status, 303, "same-origin wrong passwords return to the themed form, not a 403");
    const wrongLocation = new URL(wrong.headers.get("location"));
    assert.equal(wrongLocation.origin, base);
    assert.equal(wrongLocation.pathname, "/unlock");
    assert.equal(wrongLocation.searchParams.get("error"), "wrong");
    assert.equal(wrongLocation.searchParams.get("next"), destination);
    assert.equal(wrong.headers.has("set-cookie"), false);
    const retry = await fetch(wrongLocation);
    assert.equal(retry.status, 200);
    const retryInput = (await retry.text()).match(/<input\b[^>]*name="returnTo"[^>]*>/)?.[0] ?? "";
    assert.match(retryInput, new RegExp(`value="${destination}"`));

    const unlocked = await submit(password, base, destination);
    assert.equal(unlocked.status, 303, "a correct same-origin form submission must not be rejected");
    assert.equal(unlocked.headers.get("location"), `${base}${destination}`);
    const setCookie = unlocked.headers.get("set-cookie") ?? "";
    assert.match(setCookie, /\bHttpOnly\b/i);
    assert.match(setCookie, /\bSameSite=Lax\b/i);
    assert.match(setCookie, /\bPath=\//i);
    assert.equal(/\bSecure\b/i.test(setCookie), new URL(base).protocol === "https:");
    const cookie = setCookie.split(";")[0];
    const page = await fetch(`${base}${destination}`, { headers: { cookie }, redirect: "manual" });
    assert.equal(page.status, 200);
    assert.match(page.headers.get("cache-control"), /private.*no-store/);
    const gate = await fetch(`${base}/unlock?next=${encodeURIComponent(destination)}`, { headers: { cookie }, redirect: "manual" });
    assert.equal(gate.status, 307);
    assert.equal(gate.headers.get("location"), `${base}${destination}`);
    const defaultGate = await fetch(`${base}/unlock`, { headers: { cookie }, redirect: "manual" });
    assert.equal(defaultGate.headers.get("location"), `${base}/1000`);
    const invalidGate = await fetch(`${base}/unlock?next=https%3A%2F%2Funrelated.example`, { headers: { cookie }, redirect: "manual" });
    assert.equal(invalidGate.headers.get("location"), `${base}/1000`);
  }
  for (const returnTo of ["/", "/unlock", "//unrelated.example", "https://unrelated.example/"]) {
    const invalidReturn = await submit(password, base, returnTo);
    assert.equal(invalidReturn.headers.get("location"), `${base}/1000`);
  }
  const defaultReturn = await fetch(`${base}/api/unlock`, {
    method: "POST",
    headers: { origin: base },
    body: new URLSearchParams({ password }),
    redirect: "manual",
  });
  assert.equal(defaultReturn.headers.get("location"), `${base}/1000`);
  const crossSite = await submit(password, "https://unrelated.example");
  assert.equal(crossSite.status, 403, "using the browser Host must not disable cross-site protection");
  assert.equal(crossSite.headers.has("set-cookie"), false);
  const nullOrigin = await submit(password, "null");
  assert.equal(nullOrigin.status, 403);
  const missingOrigin = await fetch(`${base}/api/unlock`, {
    method: "POST",
    body: new URLSearchParams({ password }),
    redirect: "manual",
  });
  assert.equal(missingOrigin.status, 403);
  assert.equal(missingOrigin.headers.has("set-cookie"), false);
});

test("unconfigured private destinations fail closed while their login return path survives", { skip: !unconfigured }, async () => {
  for (const returnTo of ["/1000", "/christmas"]) {
    const response = await fetch(`${base}/api/unlock`, {
      method: "POST",
      headers: { origin: base },
      body: new URLSearchParams({ password: "00000000", returnTo }),
      redirect: "manual",
    });
    assert.equal(response.status, 303);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.origin, base);
    assert.equal(location.pathname, "/unlock");
    assert.equal(location.searchParams.get("error"), "unavailable");
    assert.equal(location.searchParams.get("next"), returnTo);
    assert.equal(response.headers.has("set-cookie"), false);
    assert.equal((await fetch(`${base}/api/memories/locked.webp`)).status, 401);
  }
});

test("memory images and song clips require a session and never expose private source files", { skip: unconfigured }, async () => {
  const login = await fetch(`${base}/api/unlock`, {
    method: "POST",
    headers: { origin: base },
    body: new URLSearchParams({ password }),
    redirect: "manual",
  });
  const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
  const page = await fetch(`${base}/1000`, { headers: { cookie } });
  const html = await page.text();
  const imagePath = html.match(/\/api\/memories\/[a-z0-9-]+\.webp/)?.[0];
  assert.ok(imagePath, "The private story must contain a processed memory image");
  const locked = await fetch(`${base}${imagePath}`, { redirect: "manual" });
  assert.equal(locked.status, 401);
  const image = await fetch(`${base}${imagePath}`, { headers: { cookie } });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/webp");
  assert.match(image.headers.get("cache-control"), /private.*no-store/);
  const bytes = Buffer.from(await image.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString(), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  assert.equal((await fetch(`${base}${imagePath}`, { redirect: "manual" })).status, 401, "warming a private image must not make it public");
  const audioPath = html.match(/\/api\/memories\/[a-z0-9-]+\.mp3/)?.[0];
  if (audioPath) {
    assert.equal((await fetch(`${base}${audioPath}`)).status, 401);
    const audio = await fetch(`${base}${audioPath}`, { headers: { cookie } });
    assert.equal(audio.status, 200);
    assert.equal(audio.headers.get("content-type"), "audio/mpeg");
    assert.match(audio.headers.get("cache-control"), /private.*no-store/);
  }
  for (const path of ["/api/memories/content.json", "/api/memories/not-a-real-image.webp", "/api/memories/not-a-real-song.mp3", "/.private/content.json"]) {
    assert.equal((await fetch(`${base}${path}`, { headers: { cookie }, redirect: "manual" })).status, 404, path);
  }
});
