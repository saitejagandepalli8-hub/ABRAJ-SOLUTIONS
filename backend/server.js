/* =========================================================================
   BILLION PORTFOLIO — WhatsApp notify backend
   =========================================================================
   A small Express server with one job: when the contact form is submitted,
   securely call Meta's WhatsApp Cloud API to send YOU (the site owner) a
   WhatsApp message with the inquiry details.

   This exists because the Cloud API access token must stay secret — it
   cannot live in browser JS. See README.md in this folder for full setup
   instructions (Meta app, test number, access token, etc.).

   Run locally:
     cd backend
     npm install
     cp .env.example .env   (then fill in your real values)
     npm start
   ========================================================================= */

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const OWNER_WHATSAPP_NUMBER = process.env.OWNER_WHATSAPP_NUMBER;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || "v19.0";

const USE_TEMPLATE = (process.env.WHATSAPP_USE_TEMPLATE || "false").toLowerCase() === "true";
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "hello_world";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Basic abuse protection: this endpoint sends a real WhatsApp message on
// every successful call, so it's rate-limited per IP.
const notifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "billion-portfolio-whatsapp-api" });
});

app.post("/api/whatsapp-notify", notifyLimiter, async (req, res) => {
  try {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !OWNER_WHATSAPP_NUMBER) {
      return res.status(500).json({
        error: "Server is missing WhatsApp Cloud API configuration. Check backend/.env."
      });
    }

    const { fullName, email, subject, message } = req.body || {};

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: "fullName, email, subject, and message are all required." });
    }

    const graphUrl = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const requestBody = USE_TEMPLATE
      ? buildTemplateMessage({ fullName, email, subject, message })
      : buildTextMessage({ fullName, email, subject, message });

    const metaResponse = await fetch(graphUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("WhatsApp Cloud API error:", metaData);
      return res.status(502).json({ error: "WhatsApp Cloud API rejected the request.", details: metaData });
    }

    console.log(`WhatsApp notification sent for inquiry from ${fullName} <${email}>`);
    return res.json({ ok: true, whatsapp: metaData });
  } catch (err) {
    console.error("Unexpected error in /api/whatsapp-notify:", err);
    return res.status(500).json({ error: "Unexpected server error." });
  }
});

/**
 * Free-form text message. Works immediately during development against any
 * number you've added as a verified "test recipient" in Meta's WhatsApp
 * API Setup screen. For production use against real customer numbers
 * outside a 24-hour conversation window, Meta requires an approved
 * message template instead — see buildTemplateMessage() below.
 */
function buildTextMessage({ fullName, email, subject, message }) {
  const bodyText =
    `New portfolio inquiry\n\n` +
    `From: ${fullName} (${email})\n` +
    `Subject: ${subject}\n\n` +
    `${message}`;

  return {
    messaging_product: "whatsapp",
    to: OWNER_WHATSAPP_NUMBER,
    type: "text",
    text: { body: bodyText, preview_url: false }
  };
}

/**
 * Approved template message. Required for production-grade delivery once
 * you're past initial testing. The default "hello_world" template has no
 * parameters; once you've created and Meta has approved your own template
 * (e.g. "new_portfolio_inquiry" with body variables for name/subject),
 * update WHATSAPP_TEMPLATE_NAME in .env and adjust the parameters array
 * below to match your template's variables.
 */
function buildTemplateMessage({ fullName, subject }) {
  return {
    messaging_product: "whatsapp",
    to: OWNER_WHATSAPP_NUMBER,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANG }
      // Uncomment and adjust once using a custom template with variables:
      // components: [
      //   {
      //     type: "body",
      //     parameters: [
      //       { type: "text", text: fullName },
      //       { type: "text", text: subject }
      //     ]
      //   }
      // ]
    }
  };
}

app.listen(PORT, () => {
  console.log(`WhatsApp notify backend running on http://localhost:${PORT}`);
});
