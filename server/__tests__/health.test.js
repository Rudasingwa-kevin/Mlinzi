const request = require("supertest");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("GET /", () => {
  it("returns health check", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("Mlinzi API");
    expect(res.body.version).toBe("2.1.0");
    expect(res.body.retention).toBeDefined();
  });
});

describe("GET /nonexistent", () => {
  it("returns 404", async () => {
    const res = await request(app).get("/nonexistent");
    expect(res.status).toBe(404);
  });
});
