import OpenAI from 'openai';

export const runtime = 'nodejs';

const ACTION_TYPES = [
  'cancel_subscription',
  'keep_subscription',
  'reactivate_subscription',
  'set_goal',
  'set_sms',
  'set_report_time',
  'connect_platform',
];

const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['answer', 'actions'],
  properties: {
    answer: { type: 'string' },
    actions: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'target', 'value'],
        properties: {
          type: { type: 'string', enum: ACTION_TYPES },
          target: { type: ['string', 'null'] },
          value: { type: ['number', 'string', 'boolean', 'null'] },
        },
      },
    },
  },
};

function financialContext(state) {
  return {
    referenceDataset: state.dataset,
    currentAppState: {
      smsOn: state.smsOn,
      reportTime: state.reportTime,
      accounts: state.accounts,
      connectablePlatforms: state.connectable,
      subscriptions: state.subs,
      transactions: state.txs,
      categoryBudgets: state.cats,
      goals: state.goals,
      portfolio: state.portfolio,
      savedThisYear: state.savedThisYear,
      reportExtras: state.reportExtras,
    },
  };
}

function validAction(action) {
  return action && ACTION_TYPES.includes(action.type) &&
    (action.target === null || typeof action.target === 'string') &&
    ['string', 'number', 'boolean', 'object'].includes(typeof action.value);
}

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const message = String(body.message || '').trim().slice(0, 1000);
    if (!message || !body.state) {
      return Response.json({ error: 'A message and financial state are required.' }, { status: 400 });
    }

    const history = Array.isArray(body.history)
      ? body.history.slice(-8).map(item => ({
          role: item.who === 'me' ? 'user' : 'assistant',
          content: String(item.text || '').replace(/<[^>]+>/g, '').slice(0, 1200),
        }))
      : [];

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-sol',
      reasoning: { effort: 'medium' },
      instructions: `You are Sentinel, a concise personal-finance agent inside a mobile web app.

Answer personal-finance questions from FINANCIAL_CONTEXT and perform calculations when useful. You may also answer general knowledge and financial-education questions from your knowledge. Clearly distinguish general information from the user's own data, and say when current or real-time information is unavailable. Never invent balances, transactions, dates, capabilities, or completed actions. Do not provide individualized buy/sell investment advice; you may explain portfolio facts and compare them with the user's own guardrails.

You can request website mutations only through the allowlisted actions below. Use IDs from currentAppState as targets, never display names. The browser validates every action.
- cancel_subscription / keep_subscription / reactivate_subscription: target subscription id, value null
- set_goal: target one of diningBudget, subCap, safeTarget, carMonthly, carTarget, efTarget, aiCap; numeric value
- set_sms: target null, boolean value
- set_report_time: target null, value one of 7:00 AM, 8:00 AM, 9:00 AM, 6:00 PM
- connect_platform: target connectable platform id, value null

For read-only questions, actions must be empty. For mutations, state what you changed in the answer. Do not claim an action succeeded unless you include the corresponding action. Keep answers under 120 words.`,
      input: [
        { role: 'developer', content: `FINANCIAL_CONTEXT\n${JSON.stringify(financialContext(body.state))}` },
        ...history,
        { role: 'user', content: message },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'sentinel_agent_response',
          strict: true,
          schema: RESPONSE_SCHEMA,
        },
      },
      max_output_tokens: 700,
    });

    const parsed = JSON.parse(response.output_text);
    return Response.json({
      answer: String(parsed.answer || '').slice(0, 2000),
      actions: Array.isArray(parsed.actions) ? parsed.actions.filter(validAction).slice(0, 4) : [],
    });
  } catch (error) {
    console.error('Sentinel agent error:', {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      code: error?.code,
      cause: error?.cause?.message,
    });
    return Response.json({ error: 'The reasoning service is temporarily unavailable.' }, { status: 502 });
  }
}
