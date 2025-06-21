import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const countryList = Object.entries(
  countries.getNames('en', { select: 'official' })
).map(([code, name]) => ({ code, name }))

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    birthdate: '',
    country: ''
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

    const { email, password, username, birthdate, country } = formData

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          username,
          birthdate,
          country
        }
      ])
      if (profileError) {
        setError(profileError.message)
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-6 rounded-lg w-full max-w-md space-y-4 border border-white/10"
      >
        <h2 className="text-xl font-bold text-goat text-center">Sign Up</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="input"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          value={formData.username}
          onChange={handleChange}
          className="input"
        />
        <input
          type="date"
          name="birthdate"
          required
          value={formData.birthdate}
          onChange={handleChange}
          className="input"
        />
        <select
          name="country"
          required
          value={formData.country}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select your country</option>
          {countryList.map(({ code, name }) => (
            <option key={code} value={name}>
              {name}
            </option>
          ))}
        </select>
<div className="flex items-start mb-4">
  <input
    id="terms"
    name="terms"
    type="checkbox"
    required
    className="mt-1 mr-2 w-4 h-4"
  />
  <label htmlFor="terms" className="text-sm">
    I accept the{' '}
    <a href="/legal" className="underline" target="_blank">Legal Notice</a>,{' '}
    <a href="/privacy" className="underline" target="_blank">Privacy Policy</a>, and{' '}
    <a href="/cookies" className="underline" target="_blank">Cookies Policy</a>.
  </label>
</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-goat text-white py-2 rounded-md font-semibold hover:bg-goat/80 transition"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </main>
  )
}
