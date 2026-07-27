import { authMiddleware } from "../middleware/auth.middleware.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll
} from "@jest/globals";
import redisClient from "../config/redis.js";

// Override the get method directly on the imported object
const mockGet = jest.spyOn(redisClient, "get");

function mockRequest(authHeader?: string): AuthRequest {
  return {
    headers: {
      authorization: authHeader,
    },
  } as AuthRequest;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response["status"];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response["json"];
  return res;
}

describe("authMiddleware", () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockGet.mockRestore();
  });

  it("should return 401 if no token is provided", async () => {
    const req = mockRequest();
    const res = mockResponse();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if token is blacklisted", async () => {
    const req = mockRequest("Bearer faketoken123");
    const res = mockResponse();

    mockGet.mockResolvedValue("true");

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token is blacklisted, access denied",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() and set req.user for a valid token", async () => {
    const secret = "testsecret";
    process.env.JWT_SECRET_KEY = secret;

    const token = jwt.sign({ userId: "123", email: "shivam@test.com" }, secret);
    const req = mockRequest(`Bearer ${token}`);
    const res = mockResponse();

    mockGet.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(
      expect.objectContaining({ userId: "123", email: "shivam@test.com" })
    );
  });
});

afterAll(async () => {
  mockGet.mockRestore();
  // Force Jest to not wait for open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});