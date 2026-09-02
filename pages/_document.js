import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Script id="stonks-theme" strategy="beforeInteractive">{
          `(function(){try{if(location.pathname!=="/stonks")return;var t=localStorage.getItem("stonks-theme");if(t!=="light"&&t!=="dark"&&t!=="golf"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-stonks-theme",t);}catch(e){}})();`
        }</Script>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
