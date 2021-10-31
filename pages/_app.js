import '../styles/globals.scss'
import Head from 'next/head'
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#fdecdb',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Variable Font Playground</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
    )
}

export default MyApp
