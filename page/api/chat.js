// pages/api/chat.js
export default async function handler(req, res) {
    const { p } = req.query;

    if (!p) {
        return res.status(400).send("No prompt provided");
    }

    const targetUrl = `https://rumix-ai.vercel.app/api/chat/deepseek/v3?p=${encodeURIComponent(p)}`;

    try {
        const response = await fetch(targetUrl);
        const data = await response.text();
        
        // Send the AI's answer back to your frontend
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send("Error fetching from DeepSeek API");
    }
}
