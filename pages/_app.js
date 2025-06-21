import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/react'
import Footer from '../components/Footer'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <Footer />
    </>
  )
}
