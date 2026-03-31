import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Bolivia','Bosnia and Herzegovina','Brazil','Bulgaria',
  'Cambodia','Cameroon','Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Czech Republic',
  'Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia',
  'Finland','France','Georgia','Germany','Ghana','Greece','Guatemala','Honduras','Hungary',
  'Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kosovo','Kuwait',
  'Latvia','Lebanon','Libya','Lithuania','Luxembourg',
  'Malaysia','Mexico','Moldova','Montenegro','Morocco','Netherlands','New Zealand','Nigeria','North Korea','Norway',
  'Pakistan','Palestine','Panama','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia',
  'South Africa','South Korea','Spain','Sri Lanka','Sweden','Switzerland','Syria',
  'Taiwan','Thailand','Tunisia','Turkey','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam','Yemen','Zimbabwe'
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1920 - 12 }, (_, i) => CURRENT_YEAR - 13 - i)

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [country, setCountry] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const validateUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || !username) {
      setError('Email, password and username are required.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!validateUsername(username)) {
      setError('Username must be 3-20 characters and contain only letters, numbers or underscores.')
      return
    }
    if (!agreedToTerms) {
      setError('You must accept the Terms and Conditions to continue.')
      return
    }

    setIsLoading(true)

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()

    if (existing) {
      setError('This username is already taken. Please choose another.')
      setIsLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          country: country || null,
          birth_year: birthYear ? parseInt(birthYear) : null,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (data && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: username.toLowerCase(),
        country: country || null,
        birth_year: birthYear ? parseInt(birthYear) : null,
        created_at: new Date().toISOString(),
      })
    }

    setIsLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Sign Up | Vote4GOAT</title>
          <meta name="robots" content="noindex" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-goat mb-2">Welcome to Vote4GOAT!</h1>
            <p className="text-sm text-white/50 mb-6">
              We sent a confirmation email to <span className="text-white font-medium">{email}</span>. Please check your inbox to verify your account.
            </p>
            <a href="/football" className="block w-full py-3 rounded-xl text-sm font-bold text-center bg-goat text-black hover:brightness-110 transition">
              Start voting
            </a>
            <p className="text-xs text-white/30 mt-4">Did not receive the email? Check your spam folder.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Sign Up | Vote4GOAT</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <a href="/" className="text-2xl font-bold text-white">
              Vote4<span className="text-goat">GOAT</span>
            </a>
            <p className="text-sm text-white/40 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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
              <label className="text-xs text-white/50 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wide">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="your_username"
                  maxLength={20}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-goat/50 transition"
                  required
                />
              </div>
              <p className="text-xs text-white/20">3-20 characters. Letters, numbers and underscores only.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wide">
                Country <span className="text-white/20 normal-case">(optional)</span>
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-goat/50 transition"
              >
                <option value="" style={{ background: '#111827' }}>Select your country</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c} style={{ background: '#111827' }}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wide">
                Year of birth <span className="text-white/20 normal-case">(optional)</span>
              </label>
              <select
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-goat/50 transition"
              >
                <option value="" style={{ background: '#111827' }}>Select year</option>
                {YEARS.map(y => (
                  <option key={y} value={y} style={{ background: '#111827' }}>{y}</option>
                ))}
              </select>
              <p className="text-xs text-white/20">Used to show how your generation ranks the GOATs.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mt-1">
              <div
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition ${agreedToTerms ? 'bg-goat border-goat' : 'border-white/20 bg-transparent'}`}
              >
                {agreedToTerms && (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-white/40 leading-relaxed">
                I have read and agree to the{' '}
                <a href="/legal#terms" target="_blank" className="text-goat hover:underline">Terms and Conditions</a>
                {' '}and{' '}
                <a href="/legal#privacy" target="_blank" className="text-goat hover:underline">Privacy Policy</a>.
                {' '}Country and year of birth are optional and used only to show generational ranking insights.
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-sm font-bold transition mt-1 ${
                isLoading
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  : 'bg-goat text-black hover:brightness-110'
              }`}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

          </form>

          <p className="text-center text-sm text-white/30 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-goat hover:underline">Log in</a>
          </p>

        </div>
      </main>
    </>
  )
}
