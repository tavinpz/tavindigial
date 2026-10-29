import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource/barlow-condensed/900.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

export const C = {
  navy: '#091420',
  deep: '#050c15',
  sea: '#0c2133',
  sea2: '#0f2a40',
  land: '#1a2c3d',
  land2: '#22384c',
  border: '#36536d',
  amber: '#f2b33d',
  amber2: '#d9891c',
  water: '#3fa7f5',
  water2: '#1667b0',
  white: '#f4f6f8',
  muted: '#93a7ba',
  red: '#ff4d4f',
  green: '#3ecf8e',
};

export const COR: Record<string, string> = { amber: C.amber, water: C.water, red: C.red, white: C.white, green: C.green };

export const F = {
  cond: '"Barlow Condensed", "Inter", sans-serif',
  sans: '"Inter", sans-serif',
};

export const W = 1080;
export const H = 1920;
