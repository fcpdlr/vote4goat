import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setIsLoading(true)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      setError('Incorrect email or password. Please try again.')
      setIsLoading(false)
      return
    }
    window.location.href = '/'
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(null)
    if (!resetEmail) { setError('Please enter your email address.'); return }
    setIsLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (resetError) {
      setError('Could not send reset email. Please try again.')
      setIsLoading(false)
      return
    }
    setResetSent(true)
    setIsLoading(false)
  }

  if (resetSent) {
    return (
      <>
        <Head>
          <title>Log In | Vote4GOAT</title>
          <meta name="robots" content="noindex" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="text-xl font-extrabold text-white mb-2">Check your inbox</h1>
            <p className="text-sm text-white/50 mb-6">
              We sent a password reset link to <span className="text-white font-medium">{resetEmail}</span>.
            </p>
            <button
              onClick={() => { setShowReset(false); setResetSent(false); setResetEmail('') }}
              className="text-goat text-sm hover:underline"
            >
              Back to login
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Log In | Vote4GOAT</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <a href="/" className="text-2xl font-bold text-white">
              Vote4<span className="text-goat">GOAT</span>
            </a>
            <p className="text-sm text-white/40 mt-2">
              {showReset ? 'Reset your password' : 'Welcome back'}
            </p>
          </div>

          {!showReset ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-white/50 uppercase tracking-wide">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setError(null) }}
                    className="text-xs text-white/30 hover:text-goat transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition mt-1 ${
                  isLoading
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-goat text-black hover:brightness-110'
                }`}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>

            </form>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">

              <p className="text-sm text-white/50 text-center">
                Enter your email and we will send you a link to reset your password.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition ${
                  isLoading
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-goat text-black hover:brightness-110'
                }`}
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => { setShowReset(false); setError(null) }}
                className="text-sm text-white/30 hover:text-white/60 transition text-center"
              >
                Back to login
              </button>

            </form>
          )}

          <p className="text-center text-sm text-white/30 mt-6">
            Don't have an account?{' '}
            <a href="/signup" className="text-goat hover:underline">Sign up</a>
          </p>

        </div>
      </main>
    </>
  )
}
