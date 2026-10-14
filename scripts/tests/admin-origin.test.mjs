import test from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin } from "../../src/lib/admin/origin.ts";

const local = "http://localhost:3000/api/admin/session";
function request(origin, site) {
  const headers = { origin };
  if (site) headers["sec-fetch-site"] = site;
  return new Request(local, { method: "POST", headers });
}
test("only same-origin mutations are allowed", () => {
  assert.equal(isSameOrigin(request("http://localhost:3000", "same-origin")), true);
  assert.equal(isSameOrigin(request("https://attacker.example", "cross-site")), false);
  assert.equal(isSameOrigin(request("http://localhost:4000", "same-origin")), false);
  assert.equal(isSameOrigin(request("http://localhost:3000", "cross-site")), false);
  assert.equal(isSameOrigin(new Request(local, { method: "POST" })), false);
});
