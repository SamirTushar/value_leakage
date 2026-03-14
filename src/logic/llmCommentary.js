const API_KEY_STORAGE = 'vlc_api_key';

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE);
  }
}

export async function generateCommentary(inputs, gaps, contradictions, benchmarks) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = buildPrompt(inputs, gaps, contradictions, benchmarks);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const text = data.content?.[0]?.text;
    return text || null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function buildPrompt(inputs, gaps, contradictions, benchmarks) {
  const lines = [
    'You are a supply chain value leakage analyst. Write 2-3 sentences of sharp, specific insight about this company\'s situation. Be conversational but pointed. Do NOT use bullet points or headers. Do NOT repeat the numbers — interpret them.',
    '',
    `Company: ${inputs.companyName || 'Unknown'} (${inputs.industryLabel})`,
    `Revenue: ₹${inputs.revenue} Cr`,
  ];

  if (inputs.adjustedAccuracy != null) {
    lines.push(`Forecast Accuracy (adjusted to SKU-week): ${inputs.adjustedAccuracy.toFixed(0)}%`);
  }
  if (inputs.dio != null) {
    lines.push(`DIO: ${inputs.dio} days (industry median: ${benchmarks?.medianDIO?.value})`);
  }
  if (inputs.fillRate != null) {
    lines.push(`Fill Rate: ${inputs.fillRate}%`);
  }
  if (inputs.expeditedFreight != null) {
    lines.push(`Expedited Freight: ₹${inputs.expeditedFreight} Cr/year`);
  }

  if (gaps.total != null) {
    lines.push(`\nTotal estimated leakage: ₹${gaps.total.toFixed(1)} Cr/year`);
    if (gaps.gap3) lines.push(`- Excess capital trapped: ₹${gaps.gap3.value.toFixed(1)} Cr`);
    if (gaps.gap4) lines.push(`- Value destroyed (write-offs): ₹${gaps.gap4.value.toFixed(1)} Cr`);
    if (gaps.gap2) lines.push(`- Unnecessary cost (freight): ₹${gaps.gap2.value.toFixed(1)} Cr`);
    if (gaps.gap1) lines.push(`- Lost revenue: ₹${gaps.gap1.value.toFixed(1)} Cr`);
  }

  if (contradictions.length > 0) {
    lines.push(`\nContradictions detected: ${contradictions.map(c => c.title).join(', ')}`);
  }

  return lines.join('\n');
}
