/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/beheer/boekhouding/inkoop",
        destination: "/beheer/boekhouding/inkomende",
        permanent: true,
      },
      {
        source: "/beheer/boekhouding/inkoop/:id/download",
        destination: "/beheer/boekhouding/inkomende/:id/download",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
