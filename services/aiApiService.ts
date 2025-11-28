/**
 * AI Browser Automation & Content Analysis Service
 * Supports multiple providers: Anthropic Claude, Google Gemini, OpenRouter
 */

export interface AIProvider {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

const PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-5-sonnet-20241022'
  },
  google: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash'
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'auto'
  }
};

/**
 * Initialize AI provider with API key from environment
 */
function getActiveProvider(): AIProvider | null {
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (anthropicKey) {
    return { ...PROVIDERS.anthropic, apiKey: anthropicKey };
  }
  if (googleKey) {
    return { ...PROVIDERS.google, apiKey: googleKey };
  }
  if (openrouterKey) {
    return { ...PROVIDERS.openrouter, apiKey: openrouterKey };
  }

  return null;
}

/**
 * Call AI API to analyze politician data or browse web
 */
export async function callAIAPI(prompt: string, context?: any): Promise<string> {
  try {
    const provider = getActiveProvider();
    if (!provider) {
      console.warn('[AI] No API key configured. Set VITE_ANTHROPIC_API_KEY or VITE_GOOGLE_API_KEY');
      return '';
    }

    console.log(`[AI] Using ${provider.name}`);

    if (provider.name === 'Anthropic Claude') {
      return await callAnthropicAPI(prompt, provider.apiKey!, context);
    } else if (provider.name === 'Google Gemini') {
      return await callGoogleAPI(prompt, provider.apiKey!, context);
    } else if (provider.name === 'OpenRouter') {
      return await callOpenRouterAPI(prompt, provider.apiKey!, context);
    }

    return '';
  } catch (error) {
    console.error('[AI] Error calling AI API:', error);
    return '';
  }
}

async function callAnthropicAPI(prompt: string, apiKey: string, context: any): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('[AI] Anthropic API error:', response.status);
      return '';
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  } catch (error) {
    console.error('[AI] Anthropic call failed:', error);
    return '';
  }
}

async function callGoogleAPI(prompt: string, apiKey: string, context: any): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      console.error('[AI] Google API error:', response.status);
      return '';
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('[AI] Google call failed:', error);
    return '';
  }
}

async function callOpenRouterAPI(prompt: string, apiKey: string, context: any): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'auto',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      console.error('[AI] OpenRouter API error:', response.status);
      return '';
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.error('[AI] OpenRouter call failed:', error);
    return '';
  }
}

/**
 * Get list of available AI providers
 */
export function getAvailableProviders() {
  const available = [];
  if (import.meta.env.VITE_ANTHROPIC_API_KEY) available.push('Anthropic Claude');
  if (import.meta.env.VITE_GOOGLE_API_KEY) available.push('Google Gemini');
  if (import.meta.env.VITE_OPENROUTER_API_KEY) available.push('OpenRouter');
  return available;
}

export default { callAIAPI, getAvailableProviders };
