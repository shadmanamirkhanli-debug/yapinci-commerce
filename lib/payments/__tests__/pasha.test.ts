import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveTransactionCompletion, parseEcommResponse, toMinorUnits } from "../pasha";

test("toMinorUnits converts major-unit AZN amounts to integer qəpik", () => {
  assert.equal(toMinorUnits(1.0), 100);
  assert.equal(toMinorUnits(25.5), 2550);
  assert.equal(toMinorUnits(0.99), 99);
});

test("toMinorUnits rounds away float error from amount * 100", () => {
  // 19.99 * 100 === 1998.9999999999998 in IEEE-754 double precision.
  assert.equal(toMinorUnits(19.99), 1999);
});

test("parseEcommResponse parses newline-separated KEY: VALUE lines", () => {
  const raw = "RESULT: OK\nRESULT_CODE: 000\nRRN: 123456789012\nAPPROVAL_CODE: 654321";
  assert.deepEqual(parseEcommResponse(raw), {
    RESULT: "OK",
    RESULT_CODE: "000",
    RRN: "123456789012",
    APPROVAL_CODE: "654321",
  });
});

test("parseEcommResponse tolerates blank lines and unparseable lines", () => {
  const raw = "\nRESULT: OK\n\nthis line has no colon\nRESULT_CODE: 000\n\n";
  assert.deepEqual(parseEcommResponse(raw), { RESULT: "OK", RESULT_CODE: "000" });
});

test("parseEcommResponse trims whitespace around keys and values", () => {
  assert.deepEqual(parseEcommResponse("  RESULT :  OK  "), { RESULT: "OK" });
});

test("parseEcommResponse returns an empty object for an empty response", () => {
  assert.deepEqual(parseEcommResponse(""), {});
});

test("deriveTransactionCompletion: OK response resolves to paid", () => {
  const raw = parseEcommResponse(
    "RESULT: OK\nRESULT_CODE: 000\nRRN: 123456789012\nAPPROVAL_CODE: 654321"
  );
  const completion = deriveTransactionCompletion(raw);

  assert.equal(completion.paid, true);
  assert.equal(completion.result, "OK");
  assert.equal(completion.resultCode, "000");
  assert.equal(completion.rrn, "123456789012");
  assert.equal(completion.approvalCode, "654321");
  assert.equal(completion.error, null);
});

test("deriveTransactionCompletion: FAILED response resolves to NOT paid", () => {
  const raw = parseEcommResponse("RESULT: FAILED\nRESULT_CODE: 116");
  const completion = deriveTransactionCompletion(raw);

  assert.equal(completion.paid, false);
  assert.equal(completion.result, "FAILED");
  assert.equal(completion.rrn, null);
  assert.equal(completion.approvalCode, null);
});

test("deriveTransactionCompletion: error response resolves to NOT paid, even if RESULT is somehow OK", () => {
  const raw = parseEcommResponse("error: wrong transaction id");
  const completion = deriveTransactionCompletion(raw);

  assert.equal(completion.paid, false);
  assert.equal(completion.error, "wrong transaction id");
  assert.equal(completion.result, null);

  // The decision is RESULT === "OK" AND no error — not RESULT alone.
  const rawWithBoth = parseEcommResponse("RESULT: OK\nerror: wrong transaction id");
  assert.equal(deriveTransactionCompletion(rawWithBoth).paid, false);
});

test("deriveTransactionCompletion: malformed/empty response resolves to NOT paid, never defaults to success", () => {
  assert.equal(deriveTransactionCompletion(parseEcommResponse("")).paid, false);
  assert.equal(deriveTransactionCompletion(parseEcommResponse("garbage, no colon here")).paid, false);
  assert.equal(deriveTransactionCompletion({}).paid, false);
});

test("deriveTransactionCompletion: RRN/APPROVAL_CODE presence alone is never the success signal", () => {
  // Only RESULT decides. A response with success-shaped fields but no
  // RESULT: OK (e.g. a truncated/corrupted response) must not be paid.
  const raw = parseEcommResponse("RRN: 123456789012\nAPPROVAL_CODE: 654321");
  assert.equal(deriveTransactionCompletion(raw).paid, false);
});
