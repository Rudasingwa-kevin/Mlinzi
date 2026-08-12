const request = require("supertest");
const { setMockQuery, makeToken } = require("./setup");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("GET /api/notifications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns notifications for counselor", async () => {
    const token = makeToken();
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.notifications).toBeDefined();
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it("rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/notifications/:id/read", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks notification as read", async () => {
    const token = makeToken();
    const res = await request(app)
      .patch("/api/notifications/1/read")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("rejects invalid notification id", async () => {
    const token = makeToken();
    const res = await request(app)
      .patch("/api/notifications/abc/read")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe("POST /api/notifications/read-all", () => {
  beforeEach(() => jest.clearAllMocks());

  it("marks all notifications as read", async () => {
    const token = makeToken();
    const res = await request(app)
      .post("/api/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
