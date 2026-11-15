/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#FAF9F6', // Deep cosmic blue-black
          900: '#FAF9F6', // Base canvas space navy
          850: '#EFECE6', // Card background
          800: '#E8E3DB', // Elevated panels
          700: '#DCD7CD', // Borders & rings
          600: '#B5ACA0',
        },
        earth: {
          ocean: '#0B3D91',   // Deep Pacific blue
          cyan: '#0B3D91',    // Luminous atmospheric rim
          teal: '#0B3D91',    // Coastal waters
          emerald: '#0B3D91', // Biosphere green
          forest: '#0B3D91',  // Canopy LiDAR
          amber: '#D97706',   // Solar lightning
          orange: '#D97706',  // Thermal currents
          violet: '#FC3D21',  // Night lights
        },
        nasa: {
          red: '#FC3D21',
          blue: '#0B3D91',
          cyan: '#0B3D91',
          amber: '#D97706',
          emerald: '#0B3D91',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'Space Grotesk', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      letterSpacing: {
        hud: '0.22em',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(0, 212, 255, 0.4)',
        'glow-teal': '0 0 25px -4px rgba(32, 198, 196, 0.4)',
        'glow-amber': '0 0 25px -4px rgba(255, 183, 3, 0.4)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.4)',
        'glow-blue': '0 0 30px -4px rgba(11, 61, 145, 0.6)',
      }
    },
  },
  plugins: [],
}
