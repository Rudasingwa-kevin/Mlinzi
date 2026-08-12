const request = require("supertest");
const { setMockQuery, makeToken, makeNationalToken } = require("./setup");

// Must require app AFTER setup.js which mocks dependencies
let app;
beforeAll(() => {
  app = require("../server");
});

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("registers a new counselor", async () => {
    setMockQuery((sql, params) => {
      if (sql.includes("SELECT id FROM users")) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes("INSERT INTO users")) {
        return Promise.resolve({
          rows: [{ id: 1, email: params[0], full_name: params[2], role: params[3], is_approved: false, district: null, phone: null }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
        role: "counselor",
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("rejects duplicate email", async () => {
    setMockQuery(() => Promise.resolve({ rows: [{ id: 1 }] }));

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "taken@example.com",
        password: "password123",
        full_name: "Test User",
        role: "counselor",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already/i);
  });

  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
  });

  it("rejects invalid role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        password: "password123",
        full_name: "Test User",
        role: "admin",
      });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("logs in with valid credentials", async () => {
    setMockQuery((sql) => {
      if (sql.includes("SELECT * FROM users")) {
        return Promise.resolve({
          rows: [{
            id: 1,
            email: "test@example.com",
            password: "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12", // bcrypt hash
            full_name: "Test User",
            role: "counselor",
            is_approved: true,
          }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    // bcrypt.compare with the real hash won't match "wrongpass" — use a known hash
    // For testing, we mock bcrypt
    const bcrypt = require("bcryptjs");
    const realCompare = bcrypt.compare;
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    bcrypt.compare = realCompare;

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("rejects wrong password", async () => {
    setMockQuery(() => ({
      rows: [{
        id: 1,
        email: "test@example.com",
        password: "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12",
        full_name: "Test User",
        role: "counselor",
        is_approved: true,
      }],
    }));

    const bcrypt = require("bcryptjs");
    const realCompare = bcrypt.compare;
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    bcrypt.compare = realCompare;

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid/i);
  });

  it("rejects non-existent email", async () => {
    setMockQuery(() => ({ rows: [] }));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("rejects missing credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns current user", async () => {
    setMockQuery(() => ({
      rows: [{ id: 1, email: "test@example.com", full_name: "Test User", role: "counselor", is_approved: true }],
    }));

    const token = makeToken();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.status).toBe(403);
  });
});

describe("GET /api/auth/counselors", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns counselors for national_society", async () => {
    setMockQuery(() => ({
      rows: [
        { id: 3, email: "c1@test.com", full_name: "Counselor 1", role: "counselor", is_approved: false },
        { id: 4, email: "c2@test.com", full_name: "Counselor 2", role: "counselor", is_approved: true },
      ],
    }));

    const token = makeNationalToken();
    const res = await request(app)
      .get("/api/auth/counselors")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.counselors).toHaveLength(2);
  });

  it("rejects counselor role", async () => {
    const token = makeToken();
    const res = await request(app)
      .get("/api/auth/counselors")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/auth/approve/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("approves a counselor", async () => {
    setMockQuery(() => ({
      rows: [{ id: 3, email: "c1@test.com", full_name: "Counselor 1", role: "counselor", is_approved: true }],
    }));

    const token = makeNationalToken();
    const res = await request(app)
      .patch("/api/auth/approve/3")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.is_approved).toBe(true);
  });

  it("returns 404 for non-existent counselor", async () => {
    setMockQuery(() => ({ rows: [] }));

    const token = makeNationalToken();
    const res = await request(app)
      .patch("/api/auth/approve/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
