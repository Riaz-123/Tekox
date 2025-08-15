// /api/request-otp.js
// Vercel Serverless Function: generates a 4-digit OTP server-side, optionally
// forwards it to your provider (OTP_API_URL), then stores a signed token in a
// secure HttpOnly cookie for later verification.

const crypto = require('crypto');

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = input.length % 4 ? 4 - (input.length % 4) : 0;
  return Buffer.from(input + '='.repeat(pad), 'base64').toString('utf8');
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

    if (!/^\d{11}$/.test(number)) {
      res.status(400).json({ message: 'Invalid number format (11 digits required)' });
      return;
    }

    const secret = process.env.OTP_SIGNING_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Server misconfigured: OTP_SIGNING_SECRET missing' });
      return;
    }

    // Generate a 4-digit OTP server-side
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const ts = Date.now();
    const sig = signPayload(secret, number, otp, ts);
    const payload = { number, otp, ts, sig };
    const token = b64url(JSON.stringify(payload));

    // Optionally forward to your provider to actually send the OTP SMS
    // Provide the base URL in Vercel env var OTP_API_URL (e.g., https://api.impossible-world.xyz/api/log)
    const base = process.env.OTP_API_URL || '';
    const otpKey = process.env.OTP_API_KEY || ''; // optional key if provider requires
    if (base) {
      // Compose URL: <base>?num=...&otp=...&key=<optional>
      const url = new URL(base);
      url.searchParams.set('num', number);
      url.searchParams.set('otp', otp);
      if (otpKey) url.searchParams.set('key', otpKey);

      try {
        const resp = await fetch(url.toString());
        // Try to read JSON but ignore if provider returns plain text
        let provider = null;
        try { provider = await resp.json(); } catch { provider = await resp.text(); }
        if (!resp.ok) {
          res.status(502).json({ message: 'Provider rejected OTP request', provider });
          return;
        }
      } catch (e) {
        res.status(502).json({ message: 'Failed to reach OTP provider' });
        return;
      }
    }

    // Store signed token in HttpOnly cookie for 5 min (300s)
    setCookie(res, 'otp_token', token, 300);

    res.status(200).json({ ok: true, message: 'OTP sent if provider configured' });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};