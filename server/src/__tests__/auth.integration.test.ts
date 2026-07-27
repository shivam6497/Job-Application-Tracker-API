import request from "supertest";
import app from "../index.js";
import connectDB from "../config/db.js";
import mongoose from "mongoose";
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll
} from "@jest/globals";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  // Clean up test data and close connection
  await mongoose.connection.collection("users").deleteMany({ email: /test/ });
  await mongoose.connection.close();
});

describe("POST /api/auth/register", () => {
  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({});

    expect(res.status).toBe(400);
  });

  it("should return 400 if email is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "notanemail", password: "123456", name: "Test User" });

    expect(res.status).toBe(400);
  });

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "testuser@test.com",
        password: "Test@1234",
        name: "Test User",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 400 if user already exists", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "testuser@test.com",
        password: "Test@1234",
        name: "Test User",
      });

    expect(res.status).toBe(400);
  });
});