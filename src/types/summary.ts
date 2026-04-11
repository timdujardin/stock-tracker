/** Investment recommendation level derived from AI news analysis */
export type InvestmentRecommendation = 'STRONG_SELL' | 'SELL' | 'HOLD' | 'BUY' | 'STRONG_BUY';

/** AI-generated category summary with investment recommendation */
export interface CategorySummary {
  text: string;
  recommendation: InvestmentRecommendation;
  reasoning: string;
}
