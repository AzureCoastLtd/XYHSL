import assert from "node:assert/strict";
import test from "node:test";

// Run against `next start --hostname 0.0.0.0`, not a loopback-only listener.
const base = new URL(process.env.LETTER_TEST_URL ?? "http://localhost:3124").origin;
const password = process.env.LETTER_PASSWORD;

test("a browser can unlock and stay on its own origin behind a wildcard listener", async () => {
  assert.ok(/^\d{8}$/.test(password ?? ""), "Load the local server credentials with --env-file=.env.local");
  const submit = (value, origin = base, returnTo = "/") => fetch(`${base}/api/unlock`, {
    method: "POST",
    headers: { origin },
    body: new URLSearchParams({ password: value, returnTo }),
    redirect: "manual",
  });
  const locked = await fetch(`${base}/`, { redirect: "manual" });
  assert.equal(locked.status, 307);
  assert.equal(locked.headers.get("location"), `${base}/unlock`);

  const wrong = await submit(password === "00000000" ? "11111111" : "00000000");
  assert.equal(wrong.status, 303, "same-origin wrong passwords return to the themed form, not a 403");
  const wrongLocation = new URL(wrong.headers.get("location"));
  assert.equal(wrongLocation.origin, base);
  assert.equal(wrongLocation.pathname, "/unlock");
  assert.equal(wrongLocation.searchParams.get("error"), "wrong");
  assert.equal(wrong.headers.has("set-cookie"), false);

  const unlocked = await submit(password);
  assert.equal(unlocked.status, 303, "a correct same-origin form submission must not be rejected");
  assert.equal(unlocked.headers.get("location"), `${base}/`);
  const cookie = (unlocked.headers.get("set-cookie") ?? "").split(";")[0];
  const letter = await fetch(`${base}/`, { headers: { cookie }, redirect: "manual" });
  assert.equal(letter.status, 200);
  const tree = await submit(password, base, "/christmas");
  assert.equal(tree.headers.get("location"), `${base}/christmas`);
  const externalReturn = await submit(password, base, "https://unrelated.example/");
  assert.equal(externalReturn.headers.get("location"), `${base}/`);

  const crossSite = await submit(password, "https://unrelated.example");
  assert.equal(crossSite.status, 403, "using the browser Host must not disable cross-site protection");
  assert.equal(crossSite.headers.has("set-cookie"), false);
  const nullOrigin = await submit(password, "null");
  assert.equal(nullOrigin.status, 403);
});

test("memory images and song clips require a session and never expose private source files", async () => {
  const login = await fetch(`${base}/api/unlock`, {
    method: "POST",
    headers: { origin: base },
    body: new URLSearchParams({ password }),
    redirect: "manual",
  });
  const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
  const page = await fetch(`${base}/`, { headers: { cookie } });
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
