import { cva } from 'class-variance-authority';

export const summaryMood = cva('sum-mood', {
  variants: {
    mood: {
      positive: 'sum-mood-p',
      negative: 'sum-mood-n',
      neutral: 'sum-mood-u',
      mixed: 'sum-mood-m',
    },
  },
});
