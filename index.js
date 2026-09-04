process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import express from "express";

const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.MAX_BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

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
  res.sendStatus(200);

  try {
    const update = req.body;

    if (update.update_type !== "message_created") {
      return;
    }

    const message = update.message;
    const mid = message?.body?.mid;

    if (!mid) {
      console.log("No message id in update");
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
            mid: mid
          }
        })
      }
    );

    const result = await response.text();

    if (!response.ok) {
      console.error("MAX API error:", response.status, result);
      return;
    }

    console.log("Message forwarded successfully:", mid);
    console.log(result);
  } catch (error) {
    console.error("Webhook error:", error);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
