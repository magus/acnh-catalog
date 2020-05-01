// next.config.js
const withOffline = require('next-offline');

const nextConfig = {
  target: 'serverless',
  transformManifest: (manifest) => ['/'].concat(manifest), // add the homepage to the cache

  // Trying to set NODE_ENV=production when running yarn dev causes a build-time error so we
  // turn on the SW in dev mode so that we can actually test it
  // generateInDevMode: true,

  workboxOpts: {
    swDest: 'static/service-worker.js',

    // Read more on available handlers
    // https://developers.google.com/web/tools/workbox/modules/workbox-strategies
    runtimeCaching: [
      {
        // villagedb images from cache first
        urlPattern: /^https?:\/\/villagerdb\.com\/.*\.png$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'villagerdb-images',
          cacheableResponse: {
            statuses: [0, 200, 304], // villagerdb responds with 304 on success
          },
          expiration: {
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            purgeOnQuotaError: true,
          },
        },
      },
      // non-villagedb image https calls
      {
        urlPattern: /^((?!villagerdb).)*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'https-calls',
          networkTimeoutSeconds: 15,
          expiration: {
            maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
            purgeOnQuotaError: true,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};

module.exports = withOffline(nextConfig);
