export async function callAI(
  prompt: string,
  maxTokens: number = 500,
  model: string = 'llama-3.3-70b-versatile'
): Promise<string> {
  try {
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxTokens, model }),
    })
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.result || ''
  } catch (error) {
    console.error('AI call failed:', error)
    return ''
  }
}

export async function createAutoMemory(
  userId: string,
  action: string,
  context: string,
  supabase: any
): Promise<void> {
  try {
    const prompt = `You are a personal AI memory system.
A user just did this action: "${action}"
Context: "${context}"

Generate ONE short memory sentence (max 15 words) that captures what this tells you about the user.
Focus on: their goals, preferences, habits, interests, or patterns.

Return ONLY the memory sentence. Nothing else.
Examples:
- "User prefers Netflix for entertainment spending"
- "User is targeting Frontend Developer roles at big tech companies"
- "User creates content about AI and technology"
- "User wants to reduce food spending and save more money"`

    const memory = await callAI(prompt, 50)

    if (memory && memory.length > 5) {
      await supabase.from('memories').insert({
        user_id: userId,
        category: getCategoryFromAction(action),
        memory: memory.trim(),
        auto_generated: true,
      })
    }
  } catch (error) {
    console.error('Auto memory failed:', error)
  }
}

function getCategoryFromAction(action: string): string {
  const lower = action.toLowerCase()
  if (lower.includes('transaction') || lower.includes('spend') || lower.includes('subscription') || lower.includes('financial')) return 'Finance'
  if (lower.includes('email') || lower.includes('draft') || lower.includes('reply')) return 'Email'
  if (lower.includes('job') || lower.includes('application') || lower.includes('cover letter') || lower.includes('interview')) return 'Career'
  if (lower.includes('content') || lower.includes('post') || lower.includes('linkedin') || lower.includes('twitter')) return 'Content'
  return 'Personal'
}
