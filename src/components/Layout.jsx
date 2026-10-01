import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import ScrollToTop from './ScrollToTop.jsx'
import Analytics from './Analytics.jsx'

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Analytics />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
