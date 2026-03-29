import { cva } from 'class-variance-authority';

export const highlightedCard = cva('highlighted-card', {
  variants: {
    sentiment: { positive: 'bp', negative: 'bn', neutral: 'bu' },
  },
});
