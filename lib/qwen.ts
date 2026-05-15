import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY || 'sk-dummy-key-for-build',
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function callQwen(messages: Array<{ role: string; content: string }>) {
  const completion = await openai.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: messages as any,
    temperature: 0.2,
    max_tokens: 800,
  });

  return completion.choices[0].message.content || 'Sorry, I could not generate a response.';
}
