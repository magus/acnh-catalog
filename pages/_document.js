import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

const OG = {
  Title: 'Catalog',
  Description: 'Discover and save items into your personal Animal Crossing New Horizons catalog!',
};

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // Render app and page and get the context of the page with collected side effects
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        // Styles fragment is rendered after the app and page rendering finish
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <html>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          {/*

          Defined in _app.js to prevent default viewport definition
          from overriding this definition and breaking zoom behavior

          <meta
            key="meta-viewport"
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          */}

          {/*
          manifest.json provides metadata used when your web app is added to the
          homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
          */}
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />

          {/* seo & open graph tags */}
          <meta property="og:title" content={OG.Title} />
          <meta property="og:description" content={OG.Description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://accat.now.sh" />
          <meta property="og:image" content="https://accat.now.sh/images/demo.png" />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:creator" content="magusnn" />
          <meta property="twitter:creator:id" content="23604692" />
          <meta
            property="twitter:image:alt"
            content="Image of website with search field with 'cher bloss' entered showing item results from Animal Crossing New Horizons"
          />

          <meta property="og:locale" content="en_US" />
          <meta name="description" content={OG.Description} />
          <meta name="keywords" content="Animal Crossing, Games, Nintendo, Items, Catalog" />

          {/* iOS */}
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-title" content={OG.Title} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content={OG.Title} />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-640x1136.png"
            media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-750x1294.png"
            media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-1242x2148.png"
            media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-1125x2436.png"
            media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-1536x2048.png"
            media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-1668x2224.png"
            media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
          />
          <link
            rel="apple-touch-startup-image"
            href="/images/splash/launch-2048x2732.png"
            media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
          />

          {/* Android */}
          <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />

          {/* Safari */}
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#19ae5e" />

          {/* Windows */}
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
          <meta name="application-name" content={OG.Title} />

          {this.props.styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
