/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore'],
};

export default nextConfig;

