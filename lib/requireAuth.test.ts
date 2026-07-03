import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

import { getToken } from "next-auth/jwt";
import { requireAuth } from "./requireAuth";

function makeRequest() {
  return new NextRequest("https://cs-hub-dusky.vercel.app/api/db/clients");
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null (allows the request through) when a valid session token exists", async () => {
    (getToken as ReturnType<typeof vi.fn>).mockResolvedValue({ email: "jonathanvb@urupconnect.com" });
    const result = await requireAuth(makeRequest());
    expect(result).toBeNull();
  });

  it("returns a 401 response when there is no session token", async () => {
    (getToken as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const result = await requireAuth(makeRequest());
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });

  it("returns a 401 response if the token lookup itself throws", async () => {
    (getToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));
    const result = await requireAuth(makeRequest());
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });

  it("never throws — always resolves to either null or a Response", async () => {
    (getToken as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
    await expect(requireAuth(makeRequest())).resolves.toBeDefined();
  });
});
