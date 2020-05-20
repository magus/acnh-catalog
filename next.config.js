// next.config.js

const webpack = require('webpack');
const withSourceMaps = require('@zeit/next-source-maps')();
const withOffline = require('next-offline');

module.exports = withSourceMaps(
  withOffline({
    // --------------------------------------------------
    // withSourceMaps: source maps + sentry configuration
    env: {
      SENTRY_DSN: process.env.SENTRY_DSN,
    },

    webpack: (config, { isServer, buildId }) => {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.SENTRY_RELEASE': JSON.stringify(buildId),
        }),
      );

      if (!isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser';
      }

      return config;
    },

    // --------------------------------------------------
    // next-offline: service worker configuration
    target: 'serverless',
    transformManifest: (manifest) => ['/'].concat(manifest), // add the homepage to the cache

    // Trying to set NODE_ENV=production when running yarn dev causes a build-time error so we
    // turn on the SW in dev mode so that we can actually test it
    // NOTE: TO GET THIS TO WORK YOU MUST RUN BELOW
    //   > ln -s $PWD/.next/static/service-worker.js public
    // This will symmlink the generated service-worker into public folder so its served
    // HOWEVER we must delete it to allow local build / deploy to work
    // > rm public/service-worker.js
    // generateInDevMode: true,

    workboxOpts: {
      swDest: 'static/service-worker.js',

      // Read more on available handlers
      // https://developers.google.com/web/tools/workbox/modules/workbox-strategies
      runtimeCaching: [
        {
          // json files from cache first
          urlPattern: /^https?:\/\/.*\.json$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'catalog-json',
            cacheableResponse: {
              statuses: [0, 200, 304], // some cdns may respond with 304 on success
            },
            expiration: {
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              purgeOnQuotaError: true,
            },
          },
        },
        {
          // acnhcdn images from cache first
          urlPattern: /^https?:\/\/acnhcdn\.com\/.*\.png$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'acnhcdn-images',
            cacheableResponse: {
              statuses: [0, 200, 304], // some cdns may respond with 304 on success
            },
            expiration: {
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              purgeOnQuotaError: true,
            },
          },
        },
        // non-acnhcdn image https calls
        {
          urlPattern: /^((?!acnhcdn|\.json).)*$/,
          handler: 'StaleWhileRevalidate',
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
  }),
);
