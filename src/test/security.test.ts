import { describe, it, expect, vi } from "vitest";
import {
  analyzePassword,
  analyzeUrl,
  checkPwnedPassword,
  CHARSETS,
  findSuffixCount,
  generatePassword,
  passwordFingerprint,
  secureRandomInt,
  sha1Hex,
} from "@/lib/security";

describe("generatePassword", () => {
  it("has the requested length and only allowed characters", () => {
    const pw = generatePassword(24, { upper: false, lower: true, numbers: true, symbols: false });
    expect(pw).toHaveLength(24);
    expect(pw).toMatch(/^[a-z0-9]+$/);
  });

  it("always contains at least one character from every selected set", () => {
    for (let i = 0; i < 200; i++) {
      const pw = generatePassword(8);
      expect(pw).toMatch(/[a-z]/);
      expect(pw).toMatch(/[A-Z]/);
      expect(pw).toMatch(/[0-9]/);
      expect([...pw].some((c) => CHARSETS.symbols.includes(c))).toBe(true);
    }
  });

  it("uses crypto.getRandomValues, not Math.random", () => {
    const spy = vi.spyOn(Math, "random");
    generatePassword(32);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("secureRandomInt", () => {
  it("stays in range", () => {
    for (let i = 0; i < 1000; i++) {
      const n = secureRandomInt(7);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
    }
  });
});

describe("Pwned Passwords (k-anonymity)", () => {
  it("computes SHA-1 correctly", async () => {
    // Well-known value: SHA-1("password")
    expect(await sha1Hex("password")).toBe("5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8");
  });

  it("sends only the first 5 hash characters and finds the count", async () => {
    const fetchMock = vi.fn(async () =>
      new Response("0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n1E4C9B93F3F0682250B6CF8331B7EE68FD8:9659365\r\n"),
    );
    const count = await checkPwnedPassword("password", fetchMock as unknown as typeof fetch);
    expect(count).toBe(9659365);
    const url = (fetchMock.mock.calls[0] as unknown[])[0] as string;
    expect(url).toBe("https://api.pwnedpasswords.com/range/5BAA6");
    // Only the 5-character prefix is sent: never the rest of the hash.
    // (Don't check for the word "password" here: the API's own domain,
    // api.pwnedpasswords.com, contains it.)
    expect(url.split("/range/")[1]).toHaveLength(5);
    expect(url).not.toContain("1E4C9B93F3F0682250B6CF8331B7EE68FD8");
  });

  it("returns 0 when the suffix is not in the list (padding lines have count 0)", () => {
    expect(findSuffixCount("AAAA:0\nBBBB:3", "CCCC")).toBe(0);
  });

  it("throws on an API error so the UI can show it", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 503 }));
    await expect(checkPwnedPassword("x", fetchMock as unknown as typeof fetch)).rejects.toThrow("503");
  });
});

describe("passwordFingerprint", () => {
  it("is stable within a session and different for different passwords", async () => {
    expect(await passwordFingerprint("abc")).toBe(await passwordFingerprint("abc"));
    expect(await passwordFingerprint("abc")).not.toBe(await passwordFingerprint("abd"));
  });

  it("is not reversible Base64 of the password", async () => {
    const fp = await passwordFingerprint("MySecret123");
    expect(fp).not.toContain(btoa("MySecret123").slice(0, 8));
    expect(fp).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("analyzeUrl", () => {
  it("treats a normal https site as safe", () => {
    expect(analyzeUrl("https://www.google.com/search?q=x").risk).toBe("Safe");
  });

  it("flags a brand name on a non-official domain", () => {
    const r = analyzeUrl("https://paypal-login-verify.example.com/");
    expect(r.reasons.some((x) => x.includes('"paypal"'))).toBe(true);
    expect(r.risk).toBe("Dangerous");
  });

  it("flags punycode look-alike domains", () => {
    // "аpple.com" with a Cyrillic "а" becomes xn--pple-43d.com
    const r = analyzeUrl("https://аpple.com");
    expect(r.reasons.join()).toMatch(/punycode/);
    expect(r.reasons.join()).not.toMatch(/hyphenated/);
    expect(r.risk).toBe("Dangerous");
  });

  it("flags credentials before the host (the @ trick)", () => {
    expect(analyzeUrl("https://www.sbi.co.in@evil.example/").reasons.join()).toMatch(/@/);
  });

  it("flags raw IP addresses and plain http", () => {
    const r = analyzeUrl("http://192.168.10.5/login");
    expect(r.reasons).toContain("Not using HTTPS");
    expect(r.reasons).toContain("IP address instead of domain");
    expect(r.risk).toBe("Suspicious");
  });
});

describe("analyzePassword", () => {
  it("rates a common password as weak", () => {
    expect(analyzePassword("password123").label).not.toBe("Very Strong");
  });
});
