import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Head from 'next/head'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (error) { setError(error.message); return }
    setMessage('Password updated successfully.')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <>
      <Head>
        <title>Reset Password | Vote4GOAT</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <a href="/" className="text-2xl font-bold text-white">
              Vote4<span className="text-goat">GOAT</span>
            </a>
            <p className="text-sm text-white/40 mt-2">Set a new password</p>
          </div>

          {message ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-sm text-white/70 mb-2">{message}</p>
              <p className="text-xs text-white/30">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wide">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/50 uppercase tracking-wide">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition mt-1 ${
                  loading
                    ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                    : 'bg-goat text-black hover:brightness-110'
                }`}
              >
                {loading ? 'Updating...' : 'Set new password'}
              </button>

            </form>
          )}

        </div>
      </main>
    </>
  )
}
