import Meta from "../components/Meta"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function NotFound() {
  return (
    <>
      <Meta title="Page not found" />

      <div className="min-h-screen bg-background text-white font-sans flex flex-col">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="text-7xl font-black text-goat mb-2" style={{ fontFamily: "system-ui" }}>404</div>
          <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
          <p className="text-sm text-white/40 mb-8 max-w-xs">
            This page doesn't exist. The GOAT debate, however, is very much alive.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="/football"
              className="px-6 py-3 rounded-xl bg-goat text-black text-sm font-bold hover:brightness-110 transition"
            >
              Vote now
            </a>
            <a
              href="/"
              className="px-6 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 transition"
            >
              Go home
            </a>
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
