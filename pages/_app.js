import Head from 'next/head';
import { createGlobalStyle } from 'styled-components';
// import App from 'next/app'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <GlobalStyle />

      <Head>
        <meta
          key="meta-viewport"
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>Catalog</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

const GlobalStyle = createGlobalStyle`
  :root {
    --bg-color: #fff;
    --font-color: rgb(26, 32, 44);
    --button-color: rgb(226, 232, 240);
    --button-border-color: rgb(226, 232, 240);
    --button-text: rgb(45, 55, 72);

    @media (prefers-color-scheme: dark) {
      --bg-color: #000;
      --font-color: #fff;
      --button-color: rgb(34,41,47);
      --button-border-color: rgb(226, 232, 240);
      --button-text: #fff;
    }

    --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue',
      sans-serif;
    --font-size: 18px;
  }

  html,
  body {
    height: 100%;
    padding: 0;
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
      Droid Sans, Helvetica Neue, sans-serif;
    background-color: var(--bg-color);
  }

  * {
    box-sizing: border-box;
  }
`;
