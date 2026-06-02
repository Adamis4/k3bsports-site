// api/evaluate.js — Vercel Serverless Function
// Proxies requests to Anthropic API (keeps API key server-side)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'AI evaluation failed' });
    }

    const data = await response.json();
    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);

    return res.status(200).json({ result });
  } catch (err) {
    console.error('Evaluate error:', err);
    return res.status(500).json({ error: 'Evaluation failed', detail: err.message });
  }
}
