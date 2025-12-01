/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development', // Deshabilitar en desarrollo para no cachear todo
});

const nextConfig = {
    reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
