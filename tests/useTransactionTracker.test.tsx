import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTransactionTracker } from "@/hooks/useTransactionTracker";

const addActivityItemMock = vi.fn();

vi.mock("@/lib/cache/activity-store", () => ({
  addActivityItem: (...args: unknown[]) => addActivityItemMock(...args),
}));

describe("useTransactionTracker", () => {
  it("tracks successful transaction state and activity entries", async () => {
    const { result } = renderHook(() => useTransactionTracker());
    const executor = vi.fn().mockResolvedValue({
      hash: "abc123",
      explorerUrl: "https://stellar.expert/explorer/testnet/tx/abc123",
    });

    await act(async () => {
      await result.current.track("vault.deposit", executor);
    });

    expect(executor).toHaveBeenCalledTimes(1);
    expect(result.current.state.phase).toBe("success");
    expect(result.current.state.hash).toBe("abc123");
    expect(addActivityItemMock).toHaveBeenCalledTimes(2);
    expect(addActivityItemMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        action: "vault.deposit",
        status: "submitting",
      }),
    );
    expect(addActivityItemMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        action: "vault.deposit",
        status: "pending",
        hash: "abc123",
      }),
    );
  });

  it("tracks failed transaction state deterministically", async () => {
    const { result } = renderHook(() => useTransactionTracker());
    const executor = vi.fn().mockRejectedValue(new Error("boom"));

    await act(async () => {
      await expect(
        result.current.track("vault.distribute", executor),
      ).rejects.toThrow("boom");
    });

    expect(result.current.state.phase).toBe("error");
    expect(result.current.state.errorMessage).toBe("boom");
    expect(addActivityItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "vault.distribute",
        status: "failed",
        errorMessage: "boom",
      }),
    );
  });
});
