import Head from 'next/head';
import { createGlobalStyle } from 'styled-components';
// import App from 'next/app'

// Will be called once for every metric that has to be reported.
// https://nextjs.org/blog/next-9-4#integrated-web-vitals-reporting
export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  console.debug(metric);

  // Assumes the global `gtag()` function exists, see:
  // https://developers.google.com/analytics/devguides/collection/gtagjs
  if (window.gtag) {
    const { id, name, label, value } = metric;
    window.gtag('event', name, {
      event_category: `nextjs metric (${label})`,
      // Google Analytics metrics must be integers, so the value is rounded.
      // For CLS the value is first multiplied by 1000 for greater precision
      // (note: increase the multiplier for greater precision if needed).
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      // The `id` value will be unique to the current page load. When sending
      // multiple values from the same page (e.g. for CLS), Google Analytics can
      // compute a total by grouping on this ID (note: requires `eventLabel` to
      // be a dimension in your report).
      event_label: id,
      // Use a non-interaction event to avoid affecting bounce rate.
      non_interaction: true,
    });
  }
}

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
    --app-color: rgb(25, 174, 94);
    --app-color-light: rgb(227, 252, 236);
    --error-color: rgb(227, 52, 47);
    --gray-color: rgb(135, 149, 161);
    --blue-color: rgb(52,144,220);

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
    color: var(--font-color);
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
      Droid Sans, Helvetica Neue, sans-serif;
    background-color: var(--bg-color);
  }

  * {
    box-sizing: border-box;
  }
`;
