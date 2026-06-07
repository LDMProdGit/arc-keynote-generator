function markdownToHtml(text) {
  const name = text.match(/OUTPUT 1[\s\S]*?([A-Z][a-z]+ [A-Z][a-z]+)/)?.[1] || 'Your';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Georgia, serif; background: #ffffff; color: #1a1a1a; margin: 0; padding: 0; }
  .wrapper { max-width: 680px; margin: 0 auto; padding: 48px 40px; }
  .header { background: #080808; padding: 32px 40px; text-align: center; margin-bottom: 0; }
  .header-brand { font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px; }
  .header-title { font-family: Georgia, serif; font-size: 28px; font-weight: normal; color: #ffffff; margin: 0 0 4px; }
  .header-title em { font-style: italic; color: #c8860a; }
  .header-sub { font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin: 8px 0 0; }
  .gold-bar { height: 3px; background: #c8860a; }
  .section { margin-bottom: 40px; border: 1px solid #e8e4de; }
  .section-header { background: #080808; padding: 14px 24px; display: flex; align-items: center; gap: 12px; }
  .section-num { font-family: Georgia, serif; font-size: 32px; font-weight: normal; color: rgba(200,134,10,0.25); line-height: 1; }
  .section-label { font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #c8860a; font-weight: bold; }
  .section-body { padding: 28px 28px; background: #ffffff; font-size: 16px; line-height: 1.85; color: #2a2520; }
  .section-body h3 { font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c8860a; font-weight: bold; margin: 24px 0 10px; border-bottom: 1px solid #e8e4de; padding-bottom: 8px; }
  .section-body h3:first-child { margin-top: 0; }
  .section-body p { margin: 0 0 14px; }
  .section-body ul { margin: 0 0 16px; padding-left: 20px; }
  .section-body li { margin-bottom: 8px; }
  .section-body strong { color: #080808; font-weight: 600; }
  .footer { background: #080808; padding: 24px 40px; text-align: center; margin-top: 40px; }
  .footer p { font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin: 0 0 6px; }
  .footer-copy { font-size: 10px !important; letter-spacing: 1px !important; color: rgba(255,255,255,0.15) !important; }
</style>
</head>
<body>
<div class="header">
  <div class="header-brand">Star Power Speakers · James Barbour®</div>
  <div class="header-title">Your <em>Keynote</em> Blueprint</div>
  <div class="header-sub">ARC Method™</div>
</div>
<div class="gold-bar"></div>
<div class="wrapper">
${convertSections(text)}
</div>
<div class="footer">
  <p>Star Power Speakers · James Barbour®</p>
  <p class="footer-copy">© 2026 Star Power Speakers. The ARC Method™ is a trademark of Star Power Speakers.</p>
</div>
</body>
</html>`;
}
 
function convertSections(text) {
  const sections = [
    { key: 'OUTPUT 1', label: 'Your Legacy Message', num: '01' },
    { key: 'OUTPUT 2', label: 'Keynote Outline — The ARC Method™', num: '02' },
    { key: 'OUTPUT 3', label: 'Script Draft', num: '03' },
    { key: 'OUTPUT 4', label: 'One-Page Blueprint', num: '04' },
  ];
 
  let html = '';
  sections.forEach((s, i) => {
    const nextKey = sections[i + 1]?.key;
    const start = text.indexOf(s.key);
    if (start === -1) return;
    const end = nextKey ? text.indexOf(nextKey, start + s.key.length) : text.length;
    let content = text.slice(start + s.key.length, end === -1 ? text.length : end).trim();
    content = formatContent(content);
    html += `
    <div class="section">
      <div class="section-header">
        <div class="section-num">${s.num}</div>
        <div class="section-label">${s.label}</div>
      </div>
      <div class="section-body">${content}</div>
    </div>`;
  });
  return html;
}
 
function formatContent(text) {
  // Remove leading dashes used as section separators
  text = text.replace(/^---+\s*/gm, '');
 
  // Convert ## headings to styled h3
  text = text.replace(/^##\s+(.+)$/gm, '<h3>$1</h3>');
 
  // Convert **bold** to strong
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
 
  // Convert *italic* to em
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
 
  // Convert bullet lines to ul/li
  const lines = text.split('\n');
  let result = '';
  let inList = false;
 
  lines.forEach(line => {
    const bulletMatch = line.match(/^[-•]\s+(.+)/);
    if (bulletMatch) {
      if (!inList) { result += '<ul>'; inList = true; }
      result += `<li>${bulletMatch[1]}</li>`;
    } else {
      if (inList) { result += '</ul>'; inList = false; }
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('<h3>')) {
        result += `<p>${trimmed}</p>`;
      } else if (trimmed) {
        result += trimmed;
      }
    }
  });
 
  if (inList) result += '</ul>';
  return result;
}
 
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
 
    // Convert markdown to clean HTML for email
    const outputHtml = markdownToHtml(output);
 
    // Fire GHL webhook BEFORE sending response so Vercel doesn't kill it
    if (process.env.GHL_WEBHOOK_URL) {
      try {
        const ghlResponse = await fetch(process.env.GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            keynote_output: outputHtml,
            source: 'ARC Keynote Generator',
            tags: ['Keynote Generator Lead']
          })
        });
        console.log('GHL webhook status:', ghlResponse.status);
      } catch (ghlErr) {
        console.error('GHL webhook failed:', ghlErr);
      }
    }
 
    // Now send the response to the user
    res.status(200).json({ output });
 
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
