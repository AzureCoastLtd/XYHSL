/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/1000": ["./.private/content.json"],
    "/api/memories/*": ["./.private/media/**/*"],
  },
};

export default nextConfig;
