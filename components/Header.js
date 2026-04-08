import { useState, useRef, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const CrownLogo = ({ size = 26 }) => (
<svg width={size} height={size * 0.875} viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 46 L6 28 L18 40 L32 10 L46 40 L58 28 L58 46 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
<line x1="6" y1="46" x2="58" y2="46" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
<circle cx="32" cy="30" r="3.5" fill="#f5a623"/>
<circle cx="14" cy="42" r="2" fill="#f5a623" opacity="0.5"/>
<circle cx="50" cy="42" r="2" fill="#f5a623" opacity="0.5"/>
</svg>
)

export default function Header() {
const [user, setUser] = useState(null)
const [showMenu, setShowMenu] = useState(false)
const menuRef = useRef()

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
function handleClickOutside(event) {
if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false)
}
function handleEsc(event) {
if (event.key === "Escape") setShowMenu(false)
}
document.addEventListener("mousedown", handleClickOutside)
document.addEventListener("keydown", handleEsc)
return () => {
document.removeEventListener("mousedown", handleClickOutside)
document.removeEventListener("keydown", handleEsc)
}
}, [])

return (
<header className="flex items-center justify-between px-3 py-3">
<a href="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
<CrownLogo size={26} />
<span className="text-lg font-extrabold tracking-wide leading-none">
<span className="text-white/50 font-bold">VOTE</span>
<span className="text-goat">4</span>
<span className="text-white font-extrabold">GOAT</span>
</span>
</a>


  <nav className="flex items-center gap-3">
    <a href="/top10" className="text-white/40 hover:text-white/70 transition text-xs">T0PS</a>
    <a href="/rank4" className="text-white/40 hover:text-white/70 transition text-xs">R4NK</a>
    {user ? (
      <div className="relative" ref={menuRef}>
        <button onClick={() => setShowMenu(!showMenu)} className="text-goat font-semibold hover:underline text-xs">
          My Account
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-1 w-28 bg-white text-black rounded shadow-md z-50">
            <a href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    ) : (
      <>
        <a href="/login" className="text-white/40 hover:text-white/70 transition text-xs">Log In</a>
        <a href="/signup" className="bg-goat text-black px-3 py-1.5 rounded-full text-xs font-bold hover:brightness-105 transition">Sign Up</a>
      </>
    )}
  </nav>
</header>


)
}