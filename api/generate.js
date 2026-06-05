module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { prompt, userData } = req.body;
    console.log('Key prefix:', (process.env.ANTHROPIC_API_KEY || 'MISSING').slice(0, 12));
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
     model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const claudeData = await claudeResponse.json();
    console.log('Claude status:', claudeResponse.status);
    console.log('Claude data:', JSON.stringify(claudeData).slice(0, 300));
    const output = claudeData.content?.[0]?.text || '';

    // Send results to user immediately
    res.status(200).json({ output });

    // Then notify GHL in the background — won't block or break the response
    if (process.env.GHL_WEBHOOK_URL) {
      fetch(process.env.GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          keynote_output: output,
          source: 'ARC Keynote Generator',
          tags: ['Keynote Generator Lead']
        })
      }).catch(err => console.error('GHL webhook failed:', err));
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
