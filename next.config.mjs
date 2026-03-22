/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false, // removes the "N" icon
    appIsrStatus: false,  // removes ISR status dot if shown
  },
};

export default nextConfig;