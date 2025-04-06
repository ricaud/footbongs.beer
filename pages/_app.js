import '../styles/globals.css'
import '../styles/constitution.css'
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {

  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`
      );
    };

    setAppHeight();
    window.addEventListener('resize', setAppHeight);
    return () => window.removeEventListener('resize', setAppHeight);
  })

  return <Component {...pageProps} />
}
