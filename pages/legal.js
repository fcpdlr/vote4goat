export default function LegalPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-white font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <a href="/" className="text-2xl font-bold text-white">Vote4<span className="text-goat">GOAT</span></a>
          <p className="text-xs text-white/30 mt-1 uppercase tracking-widest">Legal</p>
        </div>

        <nav className="flex gap-3 mb-10 flex-wrap">
          <a href="#terms" className="text-xs px-3 py-1.5 rounded-full border border-goat/40 text-goat hover:bg-goat/10 transition">Terms & Conditions</a>
          <a href="#privacy" className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70 transition">Privacy Policy</a>
          <a href="#cookies" className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70 transition">Cookie Policy</a>
        </nav>

        {/* TERMS */}
        <section id="terms" className="mb-16 scroll-mt-8">
          <h1 className="text-xl font-bold text-goat mb-1">Terms and Conditions</h1>
          <p className="text-xs text-white/30 mb-8">Last updated: March 2026 · vote4goat.com</p>

          <h2 className="text-sm font-semibold text-white mt-6 mb-2">1. Who we are</h2>
          <p className="text-sm text-white/50 mb-4">Vote4GOAT is operated by Vote4GOAT, an individual-run project based in Spain. Contact: <a href="mailto:hello@vote4goat.com" className="text-goat hover:underline">hello@vote4goat.com</a>. The Platform is accessible at vote4goat.com and allows users to vote, rank and debate about athletes and other public figures across sports and other categories.</p>

          <h2 className="text-sm font-semibold text-white mt-6 mb-2">2. Acceptance of terms</h2>
          <p className="text-sm text-white/50 mb-4">By accessing or using Vote4GOAT, you agree to be bound by these Terms and Conditions. We reserve the right to update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated terms.</p>

          <h2 className="text-sm font-semibold text-white mt-6 mb-2">3. Who can use Vote4GOAT</h2>
          <p className="text-sm text-white/50 mb-4">Vote4GOAT is intended for users aged 13 and over. Users under 16 in the EU must have parental consent in accordance with GDPR Article 8.</p>

          <h2 className="text-sm font-semibold text-white mt-6 mb-2">4. User accounts</h2>
          <p className="text-sm text-white/50 mb-2">You may use certain features without registering. When creating an account, you agree to provide accurate information, keep your credentials confidential, and notify us of any unauthorized use.</p>
          <p className="text-sm text-white/50 mb-4">We reserve the right to suspend accounts that violate these terms or engage in fraudulent activity including vote manipulation.</p>

          <h2 className="text-sm font-semibold text-white mt-6 mb-2">5. Acceptable use</h2>
          <p className="text-sm text-white/50 mb-2">You agree not to manipulate voting results through bots or coordinated inauthentic behavior, harass or harm other users, post unlawfu
