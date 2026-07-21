# 🌅 Horizon Signal

### AI-Native Attribution & Incrementality Measurement Engine

Horizon Signal is a modern, server-to-server (S2S) attribution engine built for affiliate marketers who need to see **beyond the last click**. It tracks every touchpoint, measures true incrementality, and provides the data foundation for AI-powered attribution models.

---

## 🚀 Why Horizon Signal?

Traditional affiliate tracking fails in a privacy-first, AI-driven world. Ad blockers, ITP (Intelligent Tracking Prevention), and cookie deprecation mean that **up to 55% of affiliate clicks go untracked**.

Horizon Signal solves this by:

- **Server-to-Server (S2S) Tracking**: Bypasses browsers entirely, immune to ad-blockers and privacy restrictions.
- **Unique Click IDs**: Every click gets a permanent, unguessable ID that links directly to conversions.
- **AI-Ready Data Structure**: Built from day one to feed into machine learning models for **incrementality measurement**.
- **Real-Time Reporting**: Tracks clicks and conversions instantly.

---

## 🛠️ How It Works

### 1. Click Tracking
When a user clicks an affiliate link, Horizon Signal generates a unique `click_id` and stores the data.

**Example API Call:**

**Response:**
```json
{
  "status": "tracked",
  "click_id": "hs_1723456789_abc123",
  "message": "Conversion will be attributed to this click_id via S2S postback."
}
POST /conversion
{
  "click_id": "hs_1723456789_abc123",
  "order_value": 49.99,
  "commission": 5.00,
  "order_id": "ORD-12345"
}

---

### That is it.

You **only** need to create this one file right now. The `package.json`, `index.js`, and `db.js` are already done.

Once you commit this `README.md`, tell me: **"README is done"** and we will move to the next step (replying to the Railway Agent).
