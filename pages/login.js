import { useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { email, password } = formData

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (!data.user?.email_confirmed_at) {
      setError('Please confirm your email before logging in.')
      setLoading(false)
      return
    }

    router.push('/')
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-6 rounded-lg w-full max-w-md space-y-4 border border-white/10"
      >
        <h2 className="text-xl font-bold text-goat text-center">Log In</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="********"
            required
            value={formData.password}
            onChange={handleChange}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-goat text-white py-2 rounded-md font-semibold hover:bg-goat/80 transition"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </main>
  )
}
