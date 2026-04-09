export const theme = {
  colors: {
    bg: {
      primary: '#06060f',
      secondary: '#0c0c1d',
      card: '#111128',
      cardHover: '#181840',
      elevated: '#1a1a42',
    },
    border: {
      default: 'rgba(99, 102, 241, 0.08)',
      subtle: 'rgba(255, 255, 255, 0.04)',
      hover: 'rgba(99, 102, 241, 0.25)',
    },
    text: {
      primary: '#f4f4ff',
      secondary: '#a0a0cc',
      muted: '#5a5a8a',
    },
    accent: {
      indigo: '#6366f1',
      purple: '#8b5cf6',
      cyan: '#06b6d4',
      green: '#10b981',
      emerald: '#34d399',
      yellow: '#f59e0b',
      amber: '#fbbf24',
      red: '#ef4444',
      pink: '#ec4899',
      teal: '#14b8a6',
      blue: '#3b82f6',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      green: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      warm: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      cool: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      glass: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
    },
  },
  radius: {
    sm: '8px',
    md: '14px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },
  shadow: {
    card: '0 4px 24px rgba(0, 0, 0, 0.25)',
    glow: '0 0 40px rgba(99, 102, 241, 0.12)',
    glowStrong: '0 0 60px rgba(99, 102, 241, 0.2)',
  },
} as const;
