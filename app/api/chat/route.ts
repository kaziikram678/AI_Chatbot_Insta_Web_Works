import { NextRequest, NextResponse } from 'next/server';
import { callQwen } from '@/lib/qwen';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { detectIntent, ConversationContext, advanceLeadStep, advanceSupportStep } from '@/lib/intent';
import { searchSimilarChunks } from '@/lib/rag';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context }: { messages: Array<{ role: string; content: string }>; context?: ConversationContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    let currentContext: ConversationContext = context || {
      intent: 'general',
      lead_step: 'not_started',
      support_step: 'not_started',
      leadData: {},
      supportData: {}
    };

    let isNewFlow = false;
    if (currentContext.lead_step === 'not_started' && currentContext.support_step === 'not_started') {
      const detected = detectIntent(lastMessage);
      currentContext.intent = detected;
      
      if (detected === 'lead_capture') {
        currentContext.lead_step = 'name';
        isNewFlow = true;
      } else if (detected === 'support') {
        currentContext.support_step = 'extension';
        isNewFlow = true;
      }
    }

    if (!isNewFlow && currentContext.lead_step !== 'not_started' && currentContext.lead_step !== 'complete') {
      const result = advanceLeadStep(currentContext.lead_step, lastMessage, currentContext.leadData);
      currentContext.lead_step = result.step;
      currentContext.leadData = result.data;
    }

    if (!isNewFlow && currentContext.support_step !== 'not_started' && currentContext.support_step !== 'complete') {
      const result = advanceSupportStep(currentContext.support_step, lastMessage, currentContext.supportData);
      currentContext.support_step = result.step;
      currentContext.supportData = result.data;
    }

    // RAG Retrieval
    let contextPrompt = '';
    if (currentContext.lead_step === 'not_started' && currentContext.support_step === 'not_started') {
      try {
        const chunks = await searchSimilarChunks(lastMessage, 3);
        if (chunks.length > 0) {
          const contextText = chunks.map((c: any) => c.content).join('\n\n---\n\n');
          contextPrompt = `\n\nRELEVANT KNOWLEDGE BASE:\n${contextText}\n\nAnswer ONLY using this information. If unsure, say you're not sure and suggest contacting the team.`;
        }
      } catch (err) {
        console.warn('RAG retrieval failed, falling back to system prompt:', err);
      }
    } else if (currentContext.lead_step !== 'not_started' && currentContext.lead_step !== 'complete') {
      contextPrompt = `\n\nLEAD CAPTURE ACTIVE. CURRENT STEP: ${currentContext.lead_step}. Ask ONLY for this field.`;
    } else if (currentContext.support_step !== 'not_started' && currentContext.support_step !== 'complete') {
      contextPrompt = `\n\nSUPPORT CAPTURE ACTIVE. CURRENT STEP: ${currentContext.support_step}. Ask ONLY for this field.`;
    }

    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
      ...messages
    ];

    const response = await callQwen(formattedMessages);

    return NextResponse.json({
      response,
      context: currentContext,
      lead_status: currentContext.lead_step === 'complete' ? 'complete' : currentContext.lead_step === 'not_started' ? 'not_started' : 'incomplete',
      leadData: currentContext.leadData,
      next_step: currentContext.lead_step !== 'not_started' ? currentContext.lead_step : currentContext.support_step
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
