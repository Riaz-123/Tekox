export default async function handler(req, res) {
    const { p } = req.query;
    const targetUrl = `https://rumix-ai.vercel.app/api/chat/deepseek/v3?p=${encodeURIComponent(p)}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.text();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from DeepSeek" });
    }
}
