import { describe, expect, it } from "vitest";
import { toTokenAmount } from "@/lib/contracts/token.ts";

describe("token amount validation", () => {
  it("accepts positive integer strings", () => {
    expect(toTokenAmount("42")).toBe(42n);
    expect(toTokenAmount(" 5000 ")).toBe(5000n);
  });

  it("rejects empty and non-numeric values", () => {
    expect(() => toTokenAmount("")).toThrow("Amount is required.");
    expect(() => toTokenAmount("1.5")).toThrow(
      "Amount must be a positive integer.",
    );
    expect(() => toTokenAmount("abc")).toThrow(
      "Amount must be a positive integer.",
    );
  });

  it("rejects zero and negative values", () => {
    expect(() => toTokenAmount("0")).toThrow(
      "Amount must be greater than zero.",
    );
    expect(() => toTokenAmount("-5")).toThrow(
      "Amount must be a positive integer.",
    );
  });
});
