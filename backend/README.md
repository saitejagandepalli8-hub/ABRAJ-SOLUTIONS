# Wiring up real message sending

This template now sends real messages two ways when someone submits the contact form:

1. **Email**, via EmailJS — runs entirely in the browser, no server needed.
2. **WhatsApp**, via Meta's official WhatsApp Cloud API — needs the small backend in this folder, because the access token has to stay secret on a server, not in browser code.

The existing "Chat on WhatsApp" button and the `mailto:` email button elsewhere on the page are unrelated to this — those are simple one-click links and already work with no setup.

---

## 1. Email — EmailJS setup

1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. Go to **Email Services → Add New Service**, connect your inbox (Gmail, Outlook, or any SMTP account). Copy the **Service ID**.
3. Go to **Email Templates → Create New Template**. In the template body, use these variable names so they match what the form sends: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`. Copy the **Template ID**.
4. Go to **Account → General** and copy your **Public Key**.
5. Open `js/script.js` in the portfolio and fill in `CONFIG.emailjs`:
   ```js
   emailjs: {
     publicKey: "your_public_key",
     serviceId: "your_service_id",
     templateId: "your_template_id"
   }
   ```
6. Recommended: in EmailJS, go to **Account → Security** and restrict which domains can use your public key, so only your live site can send through it.

That's it — no server, no deployment. Submitting the contact form will now land in your real inbox.

---

## 2. WhatsApp — Meta Cloud API setup

This is the official WhatsApp API (the same one large businesses use), and it's free for moderate volume. It takes a bit more setup than email because Meta requires a verified app and token.

### A. Create the app and get your test credentials

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in with a Facebook account.
2. **My Apps → Create App → choose "Business"** as the app type, give it any name.
3. In the app dashboard, find **WhatsApp** in the product list and click **Set up**.
4. You'll land on **WhatsApp → API Setup**. This page gives you, for free, immediately:
   - A **temporary access token** (valid 24 hours — fine for testing, see step C for a permanent one)
   - A **test phone number** with its **Phone Number ID** (shown right on this page)
5. Copy the access token and the Phone Number ID — you'll need both in `.env`.

### B. Verify a number to receive test messages

On the same **API Setup** page, there's a **"To"** field with a dropdown — add your own personal WhatsApp number there and verify it with the code Meta sends you. During testing, the Cloud API can only message numbers you've verified this way (this is a Meta sandbox restriction, not something this code controls).

### C. Get a permanent access token (skip this for quick local testing)

The temporary token expires after 24 hours. For anything beyond a quick test:

1. Go to your Meta **Business Settings → Users → System Users**, create a System User.
2. Assign it your WhatsApp app with `whatsapp_business_messaging` permission.
3. Generate a token for that System User with no expiry (or a long one) — use this as `WHATSAPP_ACCESS_TOKEN` instead of the temporary one.

### D. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
WHATSAPP_ACCESS_TOKEN=the token from step A or C
WHATSAPP_PHONE_NUMBER_ID=the phone number ID from step A
OWNER_WHATSAPP_NUMBER=your own number, e.g. 15551234567
ALLOWED_ORIGIN=http://127.0.0.1:5500   (or wherever your frontend runs)
```

Leave `WHATSAPP_USE_TEMPLATE=false` for now — free-form text works fine to your verified test number.

### E. Run it

```bash
npm start
```

You should see `WhatsApp notify backend running on http://localhost:5000`.

### F. Point the frontend at it

In `js/script.js`, confirm `CONFIG.whatsappApi.notifyEndpoint` matches your backend's address:

```js
whatsappApi: {
  enabled: true,
  notifyEndpoint: "http://localhost:5000/api/whatsapp-notify"
}
```

Submit the contact form on the site — you should get an email (via EmailJS) and a WhatsApp message (via this backend) almost simultaneously. Check the backend terminal if anything goes wrong; errors from Meta are logged there with full detail.

---

## 3. Going to production

- **Email**: nothing changes — EmailJS works the same in production as in dev.
- **WhatsApp**:
  - Free-form text messages only work to numbers that have messaged your business number in the last 24 hours, or numbers you've manually verified as test recipients. For messaging arbitrary customers reliably, you need an **approved message template** — create one under **WhatsApp → Message Templates** in the Meta dashboard, wait for approval (usually minutes to a few hours), then set `WHATSAPP_USE_TEMPLATE=true` and `WHATSAPP_TEMPLATE_NAME` to its name in `.env`. Since this endpoint only ever messages *you* (the owner), most people can skip this and just keep their own number verified as a permanent test recipient.
  - Deploy `backend/` somewhere that can run Node (Render, Railway, Fly.io, a VPS, or as a serverless function on Vercel/Netlify). Set the same environment variables there.
  - Update `ALLOWED_ORIGIN` in the backend's environment to your real domain (not `*`).
  - Update `notifyEndpoint` in `js/script.js` to your deployed backend's URL.
  - Serve the frontend over HTTPS — most hosts do this by default.

## 4. Troubleshooting

- **"WhatsApp Cloud API rejected the request"** in the backend logs — check the `details` object that's printed; Meta's error messages are specific (expired token, unverified recipient, missing template, etc.).
- **CORS error in the browser console** — make sure `ALLOWED_ORIGIN` in `backend/.env` matches the exact origin your frontend is served from.
- **Email not arriving** — check the EmailJS dashboard's "Logs" tab; it shows every send attempt and why one might have failed (e.g. connected inbox needs re-authorizing).
