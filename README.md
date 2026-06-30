# Billion Portfolio

A premium, dark-charcoal-and-gold portfolio template with a working contact form that sends a real email (via EmailJS) and a real WhatsApp notification (via Meta's WhatsApp Cloud API) every time someone submits it. One-click "Chat on WhatsApp" and "Send an Email" buttons are also included and need no setup at all.

```
billion-portfolio/
├── index.html              ← the site itself
├── css/style.css
├── js/script.js             ← edit CONFIG here: your number, email, EmailJS keys, etc.
└── backend/                 ← tiny server, only needed for the WhatsApp notification
    ├── server.js
    ├── package.json
    ├── .env.example
    └── README.md             ← detailed Meta/EmailJS setup walkthrough
```

---

## Fastest path: see it running right now, no setup

The site works immediately with placeholder content and a simulated form. To preview it:

1. Open the `billion-portfolio` folder in VS Code.
2. Install the **Live Server** extension (search it in the Extensions panel).
3. Right-click `index.html` → **Open with Live Server**.

That's the whole site, fully responsive, with no backend running. The contact form just won't actually deliver messages yet — for that, follow the steps below.

---

## Full setup: real email + real WhatsApp delivery

### Step 1 — Personalize your details

Open `js/script.js` and edit the top of the `CONFIG` object:

```js
whatsappNumber: "15551234567",   // your number, digits only, country code first, no "+"
email: "hello@yourname.dev",
```

These power the always-on, no-setup "Chat on WhatsApp" and "Send an Email" buttons.

### Step 2 — Connect EmailJS (for the contact form's email)

1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. **Email Services → Add New Service** → connect your Gmail/Outlook/SMTP inbox. Copy the **Service ID**.
3. **Email Templates → Create New Template** → use `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}` as the variables in the template body. Copy the **Template ID**.
4. **Account → General** → copy your **Public Key**.
5. Paste all three into `CONFIG.emailjs` in `js/script.js`:
   ```js
   emailjs: {
     publicKey: "your_public_key",
     serviceId: "your_service_id",
     templateId: "your_template_id"
   }
   ```

### Step 3 — Connect the WhatsApp Cloud API (for the contact form's WhatsApp alert)

This needs the backend server because the access token must stay secret.

1. Go to [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create App → Business**.
2. In the app, open **WhatsApp → API Setup**. Copy the **temporary access token** and the **Phone Number ID** shown there.
3. On that same page, add your own number under **"To"** and verify it with the code WhatsApp sends you — this lets the test API message you directly.
4. In a terminal:
   ```bash
   cd billion-portfolio/backend
   npm install
   cp .env.example .env
   ```
5. Open `.env` and fill in:
   ```
   WHATSAPP_ACCESS_TOKEN=the token from step 2
   WHATSAPP_PHONE_NUMBER_ID=the phone number ID from step 2
   OWNER_WHATSAPP_NUMBER=your own number, e.g. 15551234567
   ALLOWED_ORIGIN=http://127.0.0.1:5500
   ```
   (Leave `WHATSAPP_USE_TEMPLATE=false` — that's only needed for production-scale messaging to arbitrary customers; see `backend/README.md`.)
6. Start it:
   ```bash
   npm start
   ```
   You should see `WhatsApp notify backend running on http://localhost:5000`.

### Step 4 — Run both halves together

You now need two things running at once:

| Terminal / Tab | What | How |
|---|---|---|
| 1 | The backend | `cd backend && npm start` (leave running) |
| 2 | The frontend | VS Code Live Server, or `python3 -m http.server 5500` from the project root |

Open the site in your browser, scroll to the contact form, fill it in, and submit. Within a couple seconds you should get an email in your inbox and a WhatsApp message on your phone.

### Step 5 — If something doesn't arrive

- Check the backend's terminal — every WhatsApp attempt and any Meta error is logged there with detail.
- Check EmailJS's dashboard → **Logs** tab for the email side.
- The full troubleshooting list (CORS errors, expired tokens, unverified numbers, etc.) is in `backend/README.md`.

---

## Going live (production)

- **Frontend**: deploy `index.html`, `css/`, `js/` anywhere static (Netlify, Vercel, GitHub Pages, your own host).
- **Backend**: deploy the `backend/` folder anywhere that runs Node — Render and Railway both have free tiers that work well for this. Set the same environment variables from `.env` in that platform's dashboard (never upload your `.env` file itself).
- Update `ALLOWED_ORIGIN` in the backend's environment to your real domain.
- Update `CONFIG.whatsappApi.notifyEndpoint` in `js/script.js` to your deployed backend's URL.
- For messaging WhatsApp numbers beyond your own (e.g. if you later want customers to get auto-replies), you'll need an approved message template — that process is documented in `backend/README.md`.

## Customizing the content

All copy — name, headline, project cards, experience timeline — lives directly in `index.html` as readable HTML, no template engine. Search for "Adrian Cole" to find every spot referencing the placeholder name.
