// /api/activate-offer.js
// Requires the 'verified_number' cookie (set by verify-otp). Forwards activation
// to your provider ACT_API_URL with num and offer, optionally including ACT_API_KEY.

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
    const offer = String(body.offer || '').trim();

    if (!/^\d{11}$/.test(number)) {
      res.status(400).json({ message: 'Invalid number format (11 digits required)' });
      return;
    }
    if (!offer) {
      res.status(400).json({ message: 'Offer is required' });
      return;
    }

    // Make sure number is verified
    const cookies = parseCookies(req);
    const verified = cookies['verified_number'];
    if (!verified) {
      res.status(401).json({ message: 'Number not verified' });
      return;
    }
    let payload;
    try { payload = JSON.parse(Buffer.from(verified, 'base64url').toString('utf8')); } catch { payload = null; }
    if (!payload || payload.number !== number) {
      res.status(401).json({ message: 'Verified number mismatch' });
      return;
    }

    const base = process.env.ACT_API_URL || '';
    const actKey = process.env.ACT_API_KEY || ''; // optional
    if (!base) {
      res.status(500).json({ message: 'Server misconfigured: ACT_API_URL missing' });
      return;
    }

    const url = new URL(base);
    url.searchParams.set('num', number);
    url.searchParams.set('offer', offer);
    if (actKey) url.searchParams.set('key', actKey);

    try {
      const resp = await fetch(url.toString());
      let provider = null;
      try { provider = await resp.json(); } catch { provider = await resp.text(); }
      if (!resp.ok) {
        res.status(502).json({ message: 'Provider rejected activation', provider });
        return;
      }
      res.status(200).json({ success: true, provider });
    } catch (e) {
      res.status(502).json({ message: 'Failed to reach activation provider' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};