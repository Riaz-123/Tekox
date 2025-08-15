const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const { num, otp } = req.query;

    if (!num || !otp) {
      return res.status(400).json({ error: "Missing 'num' or 'otp' parameter" });
    }

    // Call the real API
    const response = await axios.get(`https://api.impossible-world.xyz/api/log`, {
      params: { num, otp }
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
