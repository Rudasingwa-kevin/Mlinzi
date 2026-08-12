const request = require("supertest");
const { setMockQuery, makeToken, makeNationalToken } = require("./setup");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("GET /api/retention/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns retention stats for national_society", async () => {
    const token = makeNationalToken();
    const res = await request(app)
      .get("/api/retention/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.retentionDays).toBe(90);
    expect(res.body.tables).toBeDefined();
    expect(res.body.tables.reports).toBeDefined();
  });

  it("rejects counselor role", async () => {
    const token = makeToken();
    const res = await request(app)
      .get("/api/retention/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/retention/stats");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/retention/purge", () => {
  beforeEach(() => jest.clearAllMocks());

  it("triggers purge for national_society", async () => {
    const token = makeNationalToken();
    const res = await request(app)
      .post("/api/retention/purge")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/purge/i);
    expect(res.body.summary).toBeDefined();
  });

  it("rejects counselor role", async () => {
    const token = makeToken();
    const res = await request(app)
      .post("/api/retention/purge")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/retention/my-data", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes authenticated user's data", async () => {
    const token = makeToken({ id: 5 });
    const res = await request(app)
      .delete("/api/retention/my-data")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).delete("/api/retention/my-data");
    expect(res.status).toBe(401);
  });
});
