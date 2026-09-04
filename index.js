import express from "express";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!BOT_TOKEN) {
  throw new Error("MAX_BOT_TOKEN is not set");
}

if (!ADMIN_ID) {
  throw new Error("ADMIN_ID is not set");
}

app.get("/", (req, res) => {
  res.status(200).send("MAX predlozhka bot is running");
});

app.post("/webhook", async (req, res) => {
  // Сразу отвечаем MAX, чтобы webhook не ждал
  res.sendStatus(200);

  try {
    if (
      WEBHOOK_SECRET &&
      req.get("X-Max-Bot-Api-Secret") !== WEBHOOK_SECRET
    ) {
      console.error("Wrong webhook secret");
      return;
    }

    const update = req.body;

    if (update.update_type !== "message_created") {
      return;
    }

    const message = update.message;

    if (!message?.body?.mid) {
      return;
    }

    const response = await fetch(
      `https://platform-api2.max.ru/messages?user_id=${encodeURIComponent(ADMIN_ID)}`,
      {
        method: "POST",
        headers: {
          Authorization: BOT_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: null,
          attachments: null,
          link: {
            type: "forward",
            mid: message.body.mid
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("MAX API error:", response.status, error);
      return;
    }

    console.log("Message forwarded:", message.body.mid);
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
