'use server';
/**
 * @fileOverview Provides AI-powered insights on spending habits to suggest areas for saving.
 *
 * - getSpendingInsights - A function that returns insights on spending habits.
 * - SpendingInsightsInput - The input type for the getSpendingInsights function.
 * - SpendingInsightsOutput - The return type for the getSpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingInsightsInputSchema = z.object({
  income: z.number().describe('Total income for the period.'),
  expenses: z
    .array(
      z.object({
        category: z.string().describe('The category of the expense.'),
        amount: z.number().describe('The amount spent in this category.'),
      })
    )
    .describe('A list of expenses with their categories and amounts.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  insights: z
    .array(z.string())
    .describe('A list of insights on spending habits and potential areas for saving.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const spendingInsightsPrompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the following spending data and provide insights on potential areas for saving.

Income: {{{income}}}
Expenses:
{{#each expenses}}
- Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}

Provide specific and actionable advice. Focus on areas where the user can realistically reduce spending.`,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await spendingInsightsPrompt(input);
    return output!;
  }
);
