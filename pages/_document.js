import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    // Render app and page and get the context of the page with collected side effects.
    const sheets = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    ctx.renderPage = () => {
      return originalRenderPage({
        enhanceApp: (App) => (props) => sheets.collectStyles(<App {...props} />),
      });
    };

    const initialProps = await Document.getInitialProps(ctx);

    // Styles fragment is rendered after the app and page rendering finish.
    const styles = [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()];

    return {
      ...initialProps,
      styles,
    };
  }

  render() {
    return (
      <html>
        <Head>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0"
          />

          {/*
          manifest.json provides metadata used when your web app is added to the
          homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
          */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />

          <link rel="apple-touch-icon" sizes="1024x1024" href="/apple-touch-icon-1024x1024.png" />

          <meta name="theme-color" content="#51ab66" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-title" content="Catalog" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

          <meta name="description" content="Catalog for Animal Crossing New Horizons" />
          <meta name="keywords" content="Animal Crossing, Games, Nintendo, Items, Catalog" />

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
