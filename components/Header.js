import { useState, useRef, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const CrownLogo = () => (
  <svg width="24" height="22" viewBox="0 0 48 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 40 L2 20 L14 32 L24 6 L35 28 L46 21 L46 40 Z"
      stroke="white" strokeWidth="2.6" strokeOpacity="0.80"
      strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    <circle cx="9"  cy="34" r="2.4" fill="#f5a623" fillOpacity="0.65"/>
    <circle cx="24" cy="24" r="3.4" fill="#f5a623"/>
    <circle cx="40" cy="31" r="2.4" fill="#f5a623" fillOpacity="0.65"/>
  </svg>
)

const MODES = [
  { id: "dvels", label: "DVELS", micro: "1v1",    href: "/football" },
  { id: "tops",  label: "T0PS",  micro: "Top 10", href: "/top10" },
  { id: "rank",  label: "R4NK",  micro: "Weekly", href: "/rank4" },
]

const getActiveMode = (pathname) => {
  if (pathname.startsWith("/football") || pathname.startsWith("/basketball")) return "dvels"
  if (pathname.startsWith("/top10")) return "tops"
  if (pathname.startsWith("/rank4")) return "rank"
  return null
}

export default function Header() {
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef()
  const router = useRouter()
  const activeMode = getActiveMode(router.pathname)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {}
    }
    checkUser()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    function handleEsc(e) {
      if (e.key === "Escape") setShowMenu(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-white/5">

      {/* Level 1 — logo + account */}
      <div className="flex items-center justify-between px-4 py-2.5">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 hover:opacity-85 transition">
          <CrownLogo />
          <span className="text-base font-extrabold tracking-wide leading-none">
            <span className="text-white/42 font-semibold">VOTE</span>
            <span className="text-goat">4</span>
            <span className="text-white">GOAT</span>
          </span>
        </a>

        {/* Account */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-1.5 text-xs text-goat font-semibold hover:opacity-80 transition"
              >
                <span className="w-6 h-6 rounded-full bg-goat/15 border border-goat/30 flex items-center justify-center text-goat text-[10px] font-bold">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden sm:inline">Account</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${showMenu ? "rotate-180" : ""}`}>
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  <a href="/account" className="block px-4 py-2.5 text-xs text-white/70 hover:text-white hover:bg-white/5 transition">
                    Profile
                  </a>
                  <button
                    onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition border-t border-white/5"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className="text-xs text-white/40 hover:text-white/70 transition px-2 py-1">
                Log In
              </a>
              <a href="/signup" className="text-xs bg-goat text-black font-bold px-3 py-1.5 rounded-full hover:brightness-105 transition">
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>

      {/* Level 2 — mode nav */}
      <div className="flex items-stretch border-t border-white/5">
        {MODES.map((mode) => {
          const isActive = activeMode === mode.id
          return (
            <a
              key={mode.id}
              href={mode.href}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition ${
                isActive ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              <span
                className={`text-sm font-black tracking-wider leading-none ${isActive ? "text-white" : ""}`}
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {mode.label.split("").map((char, i) => {
                  const isAccent =
                    (mode.id === "dvels" && (i === 1 || i === 4)) ||
                    (mode.id === "tops"  && (i === 1 || i === 2)) ||
                    (mode.id === "rank"  && i === 1)
                  return (
                    <span key={i} className={isAccent ? "text-goat" : ""}>
                      {char}
                    </span>
                  )
                })}
              </span>
              <span className={`text-[9px] tracking-widest uppercase leading-none font-medium transition ${isActive ? "text-white/40" : "text-white/15"}`}>
                {mode.micro}
              </span>
              {isActive && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-goat rounded-full" />
              )}
            </a>
          )
        })}
      </div>

    </header>
  )
}
