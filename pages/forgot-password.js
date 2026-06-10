import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ForgotPassword() {
  const router = useRouter()
  useEffect(() => { router.replace('/login') }, [])
  return null
}
