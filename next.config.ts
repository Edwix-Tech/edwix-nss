import type { NextConfig } from 'next';
import { env } from './src/lib/env';
import createNextIntlPlugin from 'next-intl/plugin';
const nextConfig: NextConfig = {
  env: env(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hwgakxmcpmddggdpmdbt.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
