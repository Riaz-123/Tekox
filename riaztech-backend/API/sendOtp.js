import fetch from 'node-fetch';

export default async (req, res) => {
  const { num, otp } = req.query;

  if (!num || !otp) {
    return res.status(400).json({ error: "Missing num or otp" });
  }

  try {
    const apiUrl = `https://api.impossible-world.xyz/api/log?num=${num}&otp=${otp}&apikey=${process.env.OTP_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};
