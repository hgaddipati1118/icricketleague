/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Enable all TypeScript features
        ignoreBuildErrors: false,
    },
    experimental: {
        // Enable better module resolution
        esmExternals: true,
    }
}

module.exports = nextConfig 