export async function callAI(
  prompt: string,
  maxTokens: number = 500,
  model: string = 'llama-3.3-70b-versatile'
): Promise<string> {
  try {
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        model,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.result || '';
  } catch (error) {
    console.error('AI call failed:', error);
    return 'Sorry, I could not process that right now.';
  }
}
