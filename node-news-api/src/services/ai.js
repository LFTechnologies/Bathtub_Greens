import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Initialize AI clients
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Default provider: claude, openai, or both
const DEFAULT_PROVIDER = process.env.AI_PROVIDER || 'both'

/**
 * Summarize article using Claude (Anthropic)
 */
async function summarizeWithClaude({ title, url, text }) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'
  const prompt = `Analyze this news article and provide a structured summary. Return ONLY valid JSON with no markdown formatting.

Original Title: ${title}
URL: ${url}
TEXT:
${text.slice(0, 100000)}

Return JSON with these keys:
- title: A clear, engaging title (max 120 characters)
- summary: A concise summary (max 120 words)
- key_points: Array of 5 key bullet points (strings)
- tags: Array of up to 6 relevant tags (strings)
- commentary: Your insightful commentary on this news (2-3 sentences)
- sentiment: overall sentiment (positive, negative, neutral, mixed)`

  const response = await anthropicClient.messages.create({
    model,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })

  const content = response.content[0].text

  try {
    // Try to parse as JSON directly
    return JSON.parse(content)
  } catch {
    // If not valid JSON, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                      content.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1])
    }
    // Fallback
    return {
      title,
      summary: content.slice(0, 500),
      key_points: [],
      tags: [],
      commentary: content,
      sentiment: 'neutral'
    }
  }
}

/**
 * Summarize article using OpenAI (ChatGPT)
 */
async function summarizeWithOpenAI({ title, url, text }) {
  const model = process.env.OPENAI_MODEL || 'gpt-4o'

  const response = await openaiClient.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a news analyst that creates structured summaries. Always return valid JSON only, no markdown formatting.'
      },
      {
        role: 'user',
        content: `Analyze this article and return JSON with keys: title (<=120 chars), summary (<=120 words), key_points (string[] of 5 bullets), tags (string[] up to 6), commentary (2-3 sentences of insightful analysis), sentiment (positive/negative/neutral/mixed).

Original Title: ${title}
URL: ${url}
TEXT:
${text.slice(0, 15000)}`
      }
    ],
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0].message.content
  try {
    return JSON.parse(content)
  } catch {
    return { title, summary: content, key_points: [], tags: [], commentary: '', sentiment: 'neutral' }
  }
}

/**
 * Generate insightful commentary using Claude
 */
export async function generateCommentary({ title, summary, key_points, url }) {
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'
  const prompt = `As a thoughtful news analyst, provide insightful commentary on this news article. Focus on implications, context, and deeper analysis.

Title: ${title}
Summary: ${summary}
Key Points: ${key_points?.join(', ') || 'N/A'}
URL: ${url}

Write 2-4 paragraphs of insightful commentary that adds value beyond the basic facts. Consider:
- Broader implications
- Historical context
- Multiple perspectives
- What this means for readers

Write in a clear, engaging style.`

  const response = await anthropicClient.messages.create({
    model,
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].text
}

/**
 * Main summarization function with provider selection
 */
export async function summarizeArticle({ title, url, text, provider = DEFAULT_PROVIDER }) {
  try {
    if (provider === 'both') {
      // Try Claude first, fallback to OpenAI
      try {
        const claudeResult = await summarizeWithClaude({ title, url, text })
        console.log('[AI] Successfully summarized with Claude')
        return { ...claudeResult, provider: 'claude' }
      } catch (claudeError) {
        console.warn('[AI] Claude failed, trying OpenAI:', claudeError.message)
        const openaiResult = await summarizeWithOpenAI({ title, url, text })
        console.log('[AI] Successfully summarized with OpenAI (fallback)')
        return { ...openaiResult, provider: 'openai' }
      }
    } else if (provider === 'claude') {
      const result = await summarizeWithClaude({ title, url, text })
      return { ...result, provider: 'claude' }
    } else if (provider === 'openai') {
      const result = await summarizeWithOpenAI({ title, url, text })
      return { ...result, provider: 'openai' }
    }
  } catch (error) {
    console.error('[AI] All AI providers failed:', error.message)
    // Return basic structure on complete failure
    return {
      title,
      summary: text.slice(0, 500),
      key_points: [],
      tags: [],
      commentary: '',
      sentiment: 'neutral',
      provider: 'none',
      error: error.message
    }
  }
}

/**
 * Moderate text using OpenAI moderation API
 */
export async function moderateText(text) {
  const model = process.env.MODERATION_MODEL || 'omni-moderation-latest'
  try {
    const r = await openaiClient.moderations.create({ model, input: text })
    const result = r.results?.[0]
    return { flagged: !!result?.flagged, categories: result?.categories }
  } catch (e) {
    console.error('[AI] Moderation failed:', e.message)
    return { flagged: false }
  }
}