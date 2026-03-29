import { cva } from 'class-variance-authority';

export const articleCard = cva('article-card', {
  variants: {
    sentiment: { positive: 'bp', negative: 'bn', neutral: 'bu' },
  },
});
