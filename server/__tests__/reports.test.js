const request = require("supertest");
const { setMockQuery, makeToken, makeNationalToken } = require("./setup");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("POST /api/reports/manual", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a manual report", async () => {
    setMockQuery((sql) => {
      if (sql.includes("INSERT INTO reports")) {
        return Promise.resolve({
          rows: [{
            id: 1,
            extracted_text: "My friend is being bullied online",
            category: "bullying",
            severity: "medium",
            confidence: 85,
            recommended_action: "anonymous_report",
            guidance: "This appears to be bullying.",
            channel: "web",
            is_anonymous: true,
            created_at: new Date().toISOString(),
          }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post("/api/reports/manual")
      .send({ text: "My friend is being bullied online" });

    expect(res.status).toBe(201);
    expect(res.body.report).toBeDefined();
    expect(res.body.report.category).toBe("bullying");
  });

  it("rejects empty text", async () => {
    const res = await request(app)
      .post("/api/reports/manual")
      .send({ text: "" });

    expect(res.status).toBe(400);
  });

  it("rejects missing text", async () => {
    const res = await request(app)
      .post("/api/reports/manual")
      .send({});

    expect(res.status).toBe(400);
  });

  it("accepts channel parameter", async () => {
    setMockQuery((sql) => {
      if (sql.includes("INSERT INTO reports")) {
        return Promise.resolve({
          rows: [{ id: 2, channel: "sms", is_anonymous: true }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post("/api/reports/manual")
      .send({ text: "Help me", channel: "sms" });

    expect(res.status).toBe(201);
  });
});

describe("GET /api/reports", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns reports for counselor", async () => {
    setMockQuery(() => ({
      rows: [
        { id: 1, category: "bullying", severity: "medium" },
        { id: 2, category: "grooming", severity: "high" },
      ],
    }));

    const token = makeToken();
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.reports).toHaveLength(2);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/reports");
    expect(res.status).toBe(401);
  });

  it("rejects non-counselor role", async () => {
    const token = makeNationalToken();
    const res = await request(app)
      .get("/api/reports")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("filters by category", async () => {
    setMockQuery(() => ({ rows: [{ id: 1, category: "bullying" }] }));

    const token = makeToken();
    const res = await request(app)
      .get("/api/reports?category=bullying")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.reports).toHaveLength(1);
  });
});

describe("GET /api/reports/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns stats for national_society", async () => {
    setMockQuery(() => ({
      rows: [{ count: "10" }],
    }));

    const token = makeNationalToken();
    const res = await request(app)
      .get("/api/reports/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
  });

  it("rejects counselor role", async () => {
    const token = makeToken();
    const res = await request(app)
      .get("/api/reports/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("GET /api/reports/:id", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns a single report", async () => {
    setMockQuery(() => ({
      rows: [{ id: 1, category: "bullying", severity: "medium" }],
    }));

    const token = makeToken();
    const res = await request(app)
      .get("/api/reports/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.report.id).toBe(1);
  });

  it("returns 404 for non-existent report", async () => {
    setMockQuery(() => ({ rows: [] }));

    const token = makeToken();
    const res = await request(app)
      .get("/api/reports/999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
