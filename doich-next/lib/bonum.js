import crypto from 'crypto';

// Server-only Bonum Gateway client. Never import into client components —
// it reads BONUM_SECRET_KEY / BONUM_CHECKSUM_KEY which must stay server-side.

const BASE_URL     = process.env.BONUM_BASE_URL || 'https://apis.bonum.mn';
const TERMINAL_ID  = process.env.BONUM_TERMINAL_ID;
const SECRET_KEY   = process.env.BONUM_SECRET_KEY;
const CHECKSUM_KEY = process.env.BONUM_CHECKSUM_KEY;

// ── Access-token cache ──────────────────────────────────────────────────────
// The auth endpoint is rate-limited ("do not get token too frequently"), and
// tokens live ~1800s. Cache in module scope and reuse while a Vercel instance
// stays warm. Refresh 60s before expiry as a safety margin.
let _token = null;      // { accessToken, expiresAt (ms epoch) }

async function fetchToken() {
  const res = await fetch(`${BASE_URL}/bonum-gateway/ecommerce/auth/create`, {
    method: 'GET',
    headers: {
      Authorization:  `AppSecret ${SECRET_KEY}`,
      'X-TERMINAL-ID': TERMINAL_ID,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Bonum auth failed (${res.status}): ${body}`);
  }
  const data = await res.json();               // { accessToken, expiresIn, unit, ... }
  const ttlMs = (data.expiresIn ?? 1800) * 1000;
  _token = { accessToken: data.accessToken, expiresAt: Date.now() + ttlMs - 60_000 };
  return _token.accessToken;
}

export async function getAccessToken() {
  if (_token && Date.now() < _token.expiresAt) return _token.accessToken;
  return fetchToken();
}

// ── Create an invoice ───────────────────────────────────────────────────────
// Returns { invoiceId, followUpLink }. Redirect the customer to followUpLink.
export async function createInvoice({ amount, transactionId, callback, expiresIn = 900 }) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/bonum-gateway/ecommerce/invoices`, {
    method: 'POST',
    headers: {
      Authorization:    `Bearer ${token}`,
      'Content-Type':   'application/json',
      'Accept-Language': 'mn',
    },
    body: JSON.stringify({ amount, transactionId, callback, expiresIn }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Bonum createInvoice failed (${res.status}): ${body}`);
  }
  return res.json();                           // { invoiceId, followUpLink }
}

// ── Webhook checksum verification ───────────────────────────────────────────
// Bonum sends `x-checksum-v2` = HMAC-SHA256(rawBody, CHECKSUM_KEY) hex.
// IMPORTANT: pass the exact raw request body string (await request.text()),
// not a re-serialized object — re-serializing changes the bytes.
export function verifyChecksum(rawBody, headerValue) {
  if (!headerValue || !CHECKSUM_KEY) return false;
  const expected = crypto
    .createHmac('sha256', CHECKSUM_KEY)
    .update(rawBody, 'utf8')
    .digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(headerValue);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
