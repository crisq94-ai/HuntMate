import type { NextConfig } from 'next';
const config: NextConfig = { serverExternalPackages: ['node:sqlite'], devIndicators: false, turbopack: {root:process.cwd()}, distDir:process.env.HUNTMATE_TEST==='1'?'.next-test':'.next' };
export default config;
