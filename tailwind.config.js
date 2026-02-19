/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // ── Sahwira Brand Palette ────────────────────────────────
                // Navy family  (60% dominant — navbars, footers, hero)
                navy: {
                    DEFAULT: '#0D1B5E',   // Deep Navy  – primary brand
                    mid: '#1A2B7A',   // Royal Navy – gradient midpoint, hover
                    light: '#3C508C',   // Steel Navy – gradient end, icons
                    50: '#EEF1FA',   // very pale tint for active states
                    100: '#D6DCF4',   // light tint for backgrounds
                },
                // Gold family  (10% accent — CTAs, highlights, badges)
                gold: {
                    DEFAULT: '#C8A064',   // Expo Gold   – CTAs, badges
                    dark: '#B48C50',   // Warm Amber  – hover / pressed
                    pale: '#DCC8A0',   // Sand Tint   – card backgrounds
                },
                // Neutrals  (30% breathing space)
                ivory: {
                    DEFAULT: '#F5F4EF',   // Ivory White – page background
                    dark: '#E8E7E1',   // slightly deeper for borders
                },
                // Keep standard semantic token aliases
                primary: {
                    DEFAULT: '#0D1B5E',
                    50: '#EEF1FA',
                    100: '#D6DCF4',
                    500: '#1A2B7A',
                    600: '#0D1B5E',
                    700: '#0A1548',
                },
                secondary: {
                    DEFAULT: '#C8A064',
                    50: '#FAF5EC',
                    100: '#F0E3CA',
                    500: '#C8A064',
                    600: '#B48C50',
                    700: '#9A7440',
                },
            },
            fontFamily: {
                sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
}
