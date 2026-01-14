/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                indigo: {
                    600: '#4F46E5', // Primary
                    700: '#4338CA',
                },
                pink: {
                    500: '#EC4899', // Secondary
                }
            }
        },
    },
    plugins: [],
}
