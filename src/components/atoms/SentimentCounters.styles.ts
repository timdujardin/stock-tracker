import { cva } from 'class-variance-authority';

export const sentimentCounter = cva('sentiment-counter', {
  variants: {
    sentiment: {
      positive: 'sentiment-counter--positive',
      negative: 'sentiment-counter--negative',
      neutral: 'sentiment-counter--neutral',
    },
    active: {
      true: 'sentiment-counter--active',
    },
  },
});
