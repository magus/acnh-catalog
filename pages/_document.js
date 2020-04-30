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
        enhanceApp: (App) => (props) =>
          sheets.collectStyles(<App {...props} />),
      });
    };

    const initialProps = await Document.getInitialProps(ctx);

    // Styles fragment is rendered after the app and page rendering finish.
    const styles = [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement(),
    ];

    return {
      ...initialProps,
      styles,
    };
  }

  render() {
    return (
      <html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
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
