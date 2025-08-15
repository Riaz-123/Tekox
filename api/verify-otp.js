// /api/verify-otp.js
// Checks the OTP provided by the user against the signed cookie set by request-otp.
// If valid and not expired (<= 5 minutes), sets a verified cookie for the number.

const crypto = require('crypto');

function fromB64url(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  return Buffer.from(input + '='.repeat(pad), 'base64').toString('utf8');
}

function parseCookies(req) {
  const header = req.headers['cookie'] || '';
  const map = {};
  header.split(';').forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = pair.slice(idx + 1).trim();
      map[k] = v;
    }
  });
  return map;
}

function signPayload(secret, number, otp, ts) {
  const data = `${number}:${otp}:${ts}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function setCookie(res, name, value, maxAgeSec) {
  const parts = [
    `${name}=${value}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Secure`,
    `Max-Age=${maxAgeSec}`
  ];
  res.setHeader('Set-Cookie', parts.join('; '));
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyStr = Buffer.concat(chunks).toString('utf8') || '{}';
    const body = JSON.parse(bodyStr);
    const number = String(body.number || '').trim();
    const otp = String(body.otp || '').trim();

    if (!/^\d{11}$/.test(number)) {
      res.status(400).json({ message: 'Invalid number format (11 digits required)' });
      return;
    }
    if (!/^\d{4}$/.test(otp)) {
      res.status(400).json({ message: 'Invalid OTP format (4 digits required)' });
      return;
    }

    const secret = process.env.OTP_SIGNING_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Server misconfigured: OTP_SIGNING_SECRET missing' });
      return;
    }

    const cookies = parseCookies(req);
    const token = cookies['otp_token'];
    if (!token) {
      res.status(401).json({ message: 'OTP not requested or expired' });
      return;
    }

    let payload;
    try { payload = JSON.parse(fromB64url(token)); } catch { payload = null; }
    if (!payload) {
      res.status(400).json({ message: 'Invalid token' });
      return;
    }
    const { number: n2, otp: o2, ts, sig } = payload;
    const sig2 = signPayload(secret, n2, o2, ts);
    const ageMs = Date.now() - Number(ts);

    if (sig !== sig2 || ageMs > 5 * 60 * 1000) {
      res.status(401).json({ message: 'OTP expired or invalid' });
      return;
    }
    if (n2 !== number || o2 !== otp) {
      res.status(401).json({ message: 'Incorrect OTP' });
      return;
    }

    // Set a verified cookie for 15 minutes
    const verifiedToken = Buffer.from(JSON.stringify({ number, ts: Date.now() })).toString('base64url');
    setCookie(res, 'verified_number', verifiedToken, 900);

    res.status(200).json({ verified: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};