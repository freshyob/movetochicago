/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        municipal: '#002E62',   // sampled from mockup — primary navy
        flagred: '#C8102E',     // retained only for small Chicago-flag details (footer, tags), not primary CTAs
        limestone: '#DDD6C9',   // Chicago greystone/limestone
        porcelain: '#F5F3EF',   // warm background (secondary sections)
        ink: '#15171C',
        slate: '#4A5568',
        skyblue: '#2B80DB',     // sampled from mockup — primary interactive/CTA blue
        tint: '#EAF2FB',        // sampled from mockup — light blue-tinted section background
      },
      fontFamily: {
        display: ['"Big Shoulders Display"', 'sans-serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
