import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from '../lib/data.js';
import { answerFinancialQuestion } from '../lib/assistant.js';

test('answers merchant spending questions from transactions', () => {
  const answer = answerFinancialQuestion(initialState, 'How much did I spend at DoorDash?');
  assert.match(answer, /DoorDash/);
  assert.match(answer, /\$85\.00/);
});

test('answers safe-to-spend questions from goals and renewals', () => {
  const answer = answerFinancialQuestion(initialState, 'How much can I safely spend?');
  assert.match(answer, /safely spend/);
  assert.match(answer, /\$377/);
});

test('answers subscription overview questions', () => {
  const answer = answerFinancialQuestion(initialState, 'Which subscriptions should I review?');
  assert.match(answer, /active subscriptions/);
  assert.match(answer, /Peacock/);
});

test('answers portfolio questions with a guardrail disclaimer', () => {
  const answer = answerFinancialQuestion(initialState, 'How is my portfolio doing?');
  assert.match(answer, /\$320/);
  assert.match(answer, /not investment advice/);
});

test('answers questions using transactions unique to the supplied dataset', () => {
  const answer = answerFinancialQuestion(initialState, "How much did I spend at Zingerman's?");
  assert.match(answer, /Zingerman/);
  assert.match(answer, /\$36\.40/);
});

test('answers report-history questions from the supplied dataset', () => {
  const answer = answerFinancialQuestion(initialState, 'What did you flag in the last report?');
  assert.match(answer, /Groceries trending/);
  assert.match(answer, /Flagged Peacock/);
});

test('answers notification questions from dataset metadata', () => {
  const answer = answerFinancialQuestion(initialState, 'When do you text me?');
  assert.match(answer, /08:00/);
  assert.match(answer, /America\/Detroit/);
});
