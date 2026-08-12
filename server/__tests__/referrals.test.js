const request = require("supertest");
const { setMockQuery, makeToken, makeNationalToken } = require("./setup");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("GET /api/districts", () => {
  it("returns Rwanda districts", async () => {
    const res = await request(app).get("/api/districts");

    expect(res.status).toBe(200);
    expect(res.body.districts).toBeInstanceOf(Array);
    expect(res.body.districts).toContain("Gasabo");
    expect(res.body.districts).toContain("Huye");
    expect(res.body.districts.length).toBeGreaterThanOrEqual(20);
  });
});

describe("POST /api/report/escalate", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a referral", async () => {
    setMockQuery((sql) => {
      if (sql.includes("SELECT * FROM reports")) {
        return Promise.resolve({
          rows: [{ id: 1, severity: "medium", category: "bullying" }],
        });
      }
      if (sql.includes("INSERT INTO referral_cases")) {
        return Promise.resolve({
          rows: [{ id: 1, report_id: 1, district: "Gasabo", status: "new" }],
        });
      }
      if (sql.includes("UPDATE reports SET escalated")) {
        return Promise.resolve({ rows: [] });
      }
      if (sql.includes("SELECT id FROM users")) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .post("/api/report/escalate")
      .send({
        reportId: 1,
        district: "Gasabo",
        preferredContact: "phone",
        contactValue: "+250788888888",
      });

    expect(res.status).toBe(201);
    expect(res.body.referral).toBeDefined();
  });

  it("rejects invalid district", async () => {
    const res = await request(app)
      .post("/api/report/escalate")
      .send({
        reportId: 1,
        district: "InvalidDistrict",
        preferredContact: "phone",
        contactValue: "+250788888888",
      });

    expect(res.status).toBe(400);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/api/report/escalate")
      .send({ reportId: 1 });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/counselor/cases", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns cases for approved counselor", async () => {
    setMockQuery(() => ({
      rows: [
        { id: 1, district: "Gasabo", status: "new" },
        { id: 2, district: "Huye", status: "under_review" },
      ],
    }));

    const token = makeToken();
    const res = await request(app)
      .get("/api/counselor/cases")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.cases).toHaveLength(2);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/counselor/cases");
    expect(res.status).toBe(401);
  });

  it("rejects national_society role", async () => {
    const token = makeNationalToken();
    const res = await request(app)
      .get("/api/counselor/cases")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/counselor/cases/:id/status", () => {
  beforeEach(() => jest.clearAllMocks());

  it("updates case status", async () => {
    setMockQuery(() => ({
      rows: [{ id: 1, status: "resolved" }],
    }));

    const token = makeToken();
    const res = await request(app)
      .patch("/api/counselor/cases/1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "resolved" });

    expect(res.status).toBe(200);
    expect(res.body.case.status).toBe("resolved");
  });

  it("rejects invalid status", async () => {
    const token = makeToken();
    const res = await request(app)
      .patch("/api/counselor/cases/1/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "invalid_status" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/national/analytics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns analytics for national_society", async () => {
    setMockQuery(() => ({
      rows: [{ count: "5" }],
    }));

    const token = makeNationalToken();
    const res = await request(app)
      .get("/api/national/analytics")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.reportStats).toBeDefined();
  });

  it("rejects counselor role", async () => {
    const token = makeToken();
    const res = await request(app)
      .get("/api/national/analytics")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
