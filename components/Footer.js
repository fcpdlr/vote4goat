// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-black text-white text-sm py-6 px-4 border-t border-gray-800 mt-12">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          © 2025 Vote4GOAT. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a href="/privacy" className="underline hover:text-gray-300">Privacy</a>
          <a href="/legal" className="underline hover:text-gray-300">Legal</a>
          <a href="/cookies" className="underline hover:text-gray-300">Cookies</a>
        </div>
      </div>
    </footer>
  )
}
