import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Initialize Cloudflare context for development
// This must be called before any code that uses getCloudflareContext()
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
};

export default nextConfig;
