const request = require("supertest");
const { setMockQuery, makeToken } = require("./setup");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("POST /api/otp/send", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends OTP via SMS", async () => {
    const res = await request(app)
      .post("/api/otp/send")
      .send({
        destination: "+250788888888",
        channel: "sms",
        purpose: "signup",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/sent/i);
    expect(res.body.expiresIn).toBeDefined();
  });

  it("sends OTP via email", async () => {
    const res = await request(app)
      .post("/api/otp/send")
      .send({
        destination: "test@example.com",
        channel: "email",
        purpose: "reset",
      });

    expect(res.status).toBe(200);
  });

  it("rejects invalid channel", async () => {
    const res = await request(app)
      .post("/api/otp/send")
      .send({
        destination: "+250788888888",
        channel: "invalid",
        purpose: "signup",
      });

    expect(res.status).toBe(400);
  });

  it("rejects invalid purpose", async () => {
    const res = await request(app)
      .post("/api/otp/send")
      .send({
        destination: "+250788888888",
        channel: "sms",
        purpose: "invalid",
      });

    expect(res.status).toBe(400);
  });

  it("rejects missing destination", async () => {
    const res = await request(app)
      .post("/api/otp/send")
      .send({
        channel: "sms",
        purpose: "signup",
      });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/otp/verify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { verifyOTP } = require("../services/otpService");
    verifyOTP.mockReset();
  });

  it("verifies valid OTP", async () => {
    const { verifyOTP } = require("../services/otpService");
    verifyOTP.mockResolvedValue({ valid: true });

    const res = await request(app)
      .post("/api/otp/verify")
      .send({
        destination: "+250788888888",
        code: "123456",
        purpose: "signup",
      });

    expect(res.status).toBe(200);
    expect(res.body.verified).toBe(true);
  });

  it("rejects invalid OTP", async () => {
    const { verifyOTP } = require("../services/otpService");
    verifyOTP.mockResolvedValue({ valid: false, error: "Invalid code" });

    const res = await request(app)
      .post("/api/otp/verify")
      .send({
        destination: "+250788888888",
        code: "000000",
        purpose: "signup",
      });

    expect(res.status).toBe(400);
    expect(res.body.verified).toBe(false);
  });

  it("rejects non-6-digit code", async () => {
    const res = await request(app)
      .post("/api/otp/verify")
      .send({
        destination: "+250788888888",
        code: "123",
        purpose: "signup",
      });

    expect(res.status).toBe(400);
  });

  it("rejects non-numeric code", async () => {
    const res = await request(app)
      .post("/api/otp/verify")
      .send({
        destination: "+250788888888",
        code: "abcdef",
        purpose: "signup",
      });

    expect(res.status).toBe(400);
  });
});
