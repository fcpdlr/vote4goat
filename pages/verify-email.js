export default function VerifyEmail() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-goat mb-4">Check your email</h1>
        <p className="mb-4">
          We’ve sent you a confirmation link. Please check your inbox and click the link to activate your account.
        </p>
        <p className="text-sm text-white/60">Didn’t receive it? Check your spam folder.</p>
      </div>
    </main>
  )
}
