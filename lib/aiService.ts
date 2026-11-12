import { QueryResult } from './queryEngine';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function askDatasetAssistant(
  question: string,
  queryResult: QueryResult,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  const systemContext = `You are an elite, objective Data Journalist and Quantitative Analyst.
Your role is to answer questions strictly grounded in the verified dataset query results provided below.
DO NOT fabricate numbers or speculate beyond these facts.
Always cite the exact numbers, percentages, or records.
Maintain an engaging, editorial tone inspired by The Pudding and The New York Times.

GROUNDED QUERY FACTS:
- User Question: ${question}
- Core Fact Result: ${queryResult.formattedResult}
- Grounded Evidence: ${queryResult.groundedFacts.join(' | ')}
${queryResult.tableData ? `- Data Table: ${JSON.stringify(queryResult.tableData)}` : ''}
`;

  // 1. Try Gemini API if key is configured
  if (geminiApiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${systemContext}\n\nUser Question: ${question}\n\nDeliver a concise, insightful editorial answer:`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2, // low temperature for high fidelity to data
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic response:', err);
    }
  }

  // 2. Try OpenAI API if key is configured
  if (openAiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemContext },
            ...conversationHistory.slice(-4),
            { role: 'user', content: question },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to deterministic response:', err);
    }
  }

  // 3. Deterministic Grounded Fallback (Fast, reliable, zero token cost)
  return `${queryResult.formattedResult}\n\n*Verified against ${queryResult.groundedFacts[0] || 'dataset records'} using deterministic mathematical aggregation.*`;
}
