import type {
  ChatMessage,
  UserSummary,
  RunSummary,
  CallingSettingRow,
} from '../types/askAi.types';

/**
 * Builds a detailed system prompt with agent context for the OpenAI API.
 * This prompt ensures the AI assistant understands its role and limitations.
 */
export function buildSystemPrompt(
  agentName: string,
  sourceUser?: UserSummary,
  targetUser?: UserSummary,
  runSummary?: RunSummary,
  settingsDiff?: CallingSettingRow[]
): string {
  const contextParts: string[] = [
    'You are an AI assistant embedded in Webex Control Hub, helping IT administrators understand and safely use AI agents.',
    `\nCurrent Agent: "${agentName}"`,
    'This agent transfers calling settings between users while maintaining security protocols.',
  ];

  // Add user context
  if (sourceUser && targetUser) {
    contextParts.push(
      `\nSource User: ${sourceUser.name}${sourceUser.email ? ` (${sourceUser.email})` : ''}`,
      `Target User: ${targetUser.name}${targetUser.email ? ` (${targetUser.email})` : ''}`
    );
  }

  // Add run status context
  if (runSummary) {
    contextParts.push(`\nRun Status: ${runSummary.status}`);
    if (runSummary.id) {
      contextParts.push(`Run ID: ${runSummary.id}`);
    }
    if (runSummary.settingsChangedCount !== undefined) {
      contextParts.push(`Settings Changed: ${runSummary.settingsChangedCount}`);
    }
  }

  // Add settings diff context if available
  if (settingsDiff && settingsDiff.length > 0) {
    const changedSettings = settingsDiff.filter((s) => s.isChanged);
    const dangerousSettings = changedSettings.filter((s) => s.isDangerous);
    
    contextParts.push('\nSettings Changes Preview:');
    changedSettings.forEach((setting) => {
      const warningFlag = setting.isDangerous ? ' ⚠️ SENSITIVE' : '';
      contextParts.push(
        `  - ${setting.setting}: "${setting.currentValue}" → "${setting.newValue}"${warningFlag}`
      );
    });

    if (dangerousSettings.length > 0) {
      contextParts.push(
        `\n⚠️ ${dangerousSettings.length} sensitive setting(s) will be changed. Pay special attention to these.`
      );
    }
  }

  // Add role and limitations
  contextParts.push(
    '\n\nYour Role:',
    '- Explain what this agent does and how it affects users',
    '- Help interpret the Preview tab and understand proposed changes',
    '- Answer questions about settings, transfers, and potential impacts',
    '- Provide guidance on when to approve or reject changes',
    '\n⚠️ CRITICAL LIMITATIONS:',
    '- You CANNOT execute, run, approve, or apply any changes',
    '- You CANNOT access real user data beyond what is shown in this context',
    '- All actions (Run Agent, Approve & Apply, Reject) must be performed via the Control Panel on the left',
    '- If the user asks you to run, approve, or apply changes, you must redirect them to use the Control Panel buttons instead',
    '\nAlways remind users that you are here for guidance and explanation only. The actual controls for making changes are in the Control Panel column.'
  );

  return contextParts.join('\n');
}

/**
 * Calls the backend API proxy to interact with OpenAI.
 * The API key is securely stored on the backend and never exposed to the client.
 */
export async function callAskAiApi(params: {
  messages: ChatMessage[];
  agentName: string;
  sourceUser?: UserSummary;
  targetUser?: UserSummary;
  runSummary?: RunSummary;
  settingsDiff?: CallingSettingRow[];
}): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(
      params.agentName,
      params.sourceUser,
      params.targetUser,
      params.runSummary,
      params.settingsDiff
    );

    // Build conversation with system prompt
    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...params.messages.map((m) => ({
        role: m.role === 'system' ? 'user' as const : m.role,
        content: m.content,
      })),
    ];

    // Call backend API proxy
    const response = await fetch('/api/ask-ai-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: apiMessages,
        agentContext: {
          agentName: params.agentName,
          sourceUser: params.sourceUser,
          targetUser: params.targetUser,
          runSummary: params.runSummary,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data.reply || 'Sorry, I did not receive a valid response.';
  } catch (error) {
    console.error('Ask AI API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'AI assistant is not configured. Please contact your administrator to set up the AI_AGENT_API_KEY environment variable.';
      }
      return `Sorry, I encountered an error: ${error.message}. Please try again later.`;
    }
    
    return 'Sorry, I could not reach the AI service. Please try again later.';
  }
}

/**
 * Generates a unique ID for chat messages.
 */
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

