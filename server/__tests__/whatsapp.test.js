const request = require("supertest");

let app;
beforeAll(() => {
  app = require("../server");
});

describe("WhatsApp Webhook", () => {
  describe("GET /api/whatsapp/webhook (verification)", () => {
    it("verifies webhook with correct token", async () => {
      const res = await request(app)
        .get("/api/whatsapp/webhook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": "mlinzi_webhook_verify",
          "hub.challenge": "CHALLENGE_ACCEPTED",
        });

      expect(res.status).toBe(200);
      expect(res.text).toBe("CHALLENGE_ACCEPTED");
    });

    it("rejects webhook with wrong token", async () => {
      const res = await request(app)
        .get("/api/whatsapp/webhook")
        .query({
          "hub.mode": "subscribe",
          "hub.verify_token": "wrong_token",
          "hub.challenge": "CHALLENGE_ACCEPTED",
        });

      expect(res.status).toBe(403);
    });

    it("rejects webhook with missing mode", async () => {
      const res = await request(app)
        .get("/api/whatsapp/webhook")
        .query({
          "hub.verify_token": "mlinzi_webhook_verify",
          "hub.challenge": "CHALLENGE_ACCEPTED",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/whatsapp/webhook (incoming messages)", () => {
    it("accepts text message and returns 200", async () => {
      const webhookPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "250788123456",
                      type: "text",
                      text: {
                        body: "Hello Mlinzi, this is a test report",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/whatsapp/webhook")
        .send(webhookPayload)
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
    });

    it("accepts image message and returns 200", async () => {
      const webhookPayload = {
        object: "whatsapp_business_account",
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      from: "250788654321",
                      type: "image",
                      image: {
                        id: "media_id_123",
                        caption: "This is a screenshot of concerning content",
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      const res = await request(app)
        .post("/api/whatsapp/webhook")
        .send(webhookPayload)
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
    });

    it("ignores non-whatsapp payloads", async () => {
      const res = await request(app)
        .post("/api/whatsapp/webhook")
        .send({ object: "page" })
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
    });

    it("handles empty body gracefully", async () => {
      const res = await request(app)
        .post("/api/whatsapp/webhook")
        .send({})
        .set("Content-Type", "application/json");

      expect(res.status).toBe(200);
    });
  });
});
