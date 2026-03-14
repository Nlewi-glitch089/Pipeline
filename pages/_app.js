import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';

// _app.js wraps every page in the NextAuth SessionProvider so that
// useSession() works anywhere in the app without extra setup.
export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
