import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Signup() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthdate: '',
    country: '',
    acceptedTerms: false
  })

  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const { email, password, confirmPassword, username, birthdate, country, acceptedTerms } = formData

    if (!acceptedTerms) return setError('You must accept the terms and privacy policy.')
    if (!email || !password || !username || !birthdate || !country) return setError('All fields are required.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password })

    if (signupError) return setError(signupError.message)

    const userId = signupData.user?.id
    if (!userId) return setError('Could not retrieve user ID.')

    const { error: profileError } = await supabase.from('profiles').insert([
      { id: userId, username, birthdate, country }
    ])

    if (profileError) return setError(profileError.message)

    router.push('/')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white/10 p-6 rounded-xl max-w-md w-full space-y-4 border border-white/20">
        <h2 className="text-xl font-bold text-goat text-center">Create your account</h2>

        <input type="text" name="username" placeholder="Username" className="input" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="input" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirm password" className="input" onChange={handleChange} required />
        <input type="date" name="birthdate" className="input" onChange={handleChange} required />
        <select name="country" className="input" onChange={handleChange} required>
          <option value="">Select country</option>
          <option value="Spain">Spain</option>
          <option value="USA">USA</option>
          <option value="Brazil">Brazil</option>
          <option value="Germany">Germany</option>
          <option value="Other">Other</option>
        </select>

        <div className="text-xs text-white flex items-start gap-2">
          <input type="checkbox" name="acceptedTerms" onChange={handleChange} required />
          <span>
            I accept the{' '}
            <a href="/privacy" className="underline">Privacy Policy</a> and{' '}
            <a href="/terms" className="underline">Terms of Use</a>.
          </span>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="w-full py-2 bg-goat text-black font-bold rounded-full hover:brightness-110 transition">
          Sign Up
        </button>
      </form>
    </main>
  )
}
