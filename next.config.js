/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/beheer/boekhouding/inkoop",
        destination: "/beheer/boekhouding/crediteuren",
        permanent: true,
      },
      {
        source: "/beheer/boekhouding/inkoop/:id/download",
        destination: "/beheer/boekhouding/crediteuren/:id/download",
        permanent: true,
      },
      {
        source: "/beheer/boekhouding/inkomende",
        destination: "/beheer/boekhouding/crediteuren",
        permanent: true,
      },
      {
        source: "/beheer/boekhouding/inkomende/:id/download",
        destination: "/beheer/boekhouding/crediteuren/:id/download",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
