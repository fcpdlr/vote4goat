export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8 py-6 px-4">
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-white/20">
          © {new Date().getFullYear()} Vote4GOAT · Based in Spain
        </span>
        <div className="flex items-center gap-4">
          <a href="/legal#terms" className="text-xs text-white/30 hover:text-white/60 transition">Terms</a>
          <a href="/legal#privacy" className="text-xs text-white/30 hover:text-white/60 transition">Privacy</a>
          <a href="/legal#cookies" className="text-xs text-white/30 hover:text-white/60 transition">Cookies</a>
        </div>
      </div>
    </footer>
  )
}
