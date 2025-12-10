/**
 * Backend API Proxy for OpenAI Chat Completions
 * 
 * This serverless function securely proxies requests to OpenAI's API,
 * keeping the API key safe on the server side and never exposing it to clients.
 * 
 * Security Rules Applied:
 * - API key retrieved from environment variable (AI_AGENT_API_KEY)
 * - No hardcoded credentials
 * - Input validation and sanitization
 * - Proper error handling
 */

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: Message[];
  agentContext?: {
    agentName?: string;
    sourceUser?: { name: string; email?: string };
    targetUser?: { name: string; email?: string };
    runSummary?: { id?: string; status?: string };
  };
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Retrieve API key from environment variable
    // This is the ONLY secure way to handle API keys - never hardcode them!
    const apiKey = process.env.AI_AGENT_API_KEY;
    
    if (!apiKey) {
      console.error('AI_AGENT_API_KEY environment variable is not set');
      return res.status(500).json({
        error: 'AI service is not configured. Please set the AI_AGENT_API_KEY environment variable.',
      });
    }

    // Validate request body
    const body: RequestBody = req.body;
    
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: messages array is required',
      });
    }

    // Sanitize and validate messages
    const validMessages = body.messages
      .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim().length > 0)
      .map((msg) => ({
        role: msg.role || 'user',
        content: msg.content.trim(),
      }));

    if (validMessages.length === 0) {
      return res.status(400).json({
        error: 'Invalid request: no valid messages provided',
      });
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Use the securely stored API key
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using GPT-4o-mini for cost-effectiveness
        messages: validMessages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      
      // Don't expose internal error details to client
      return res.status(openaiResponse.status).json({
        error: 'Failed to get response from AI service',
      });
    }

    const data: OpenAIResponse = await openaiResponse.json();
    
    // Extract the assistant's reply
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I did not receive a valid response.';

    // Return the response
    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error('Backend API Error:', error);
    
    // Generic error message for security (don't leak implementation details)
    return res.status(500).json({
      error: 'An unexpected error occurred. Please try again later.',
    });
  }
}

