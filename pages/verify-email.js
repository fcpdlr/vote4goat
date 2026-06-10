import Head from 'next/head'

export default function VerifyEmail() {
  return (
    <>
      <Head>
        <title>Verify your email | Vote4GOAT</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <a href="/" className="text-2xl font-bold text-white inline-block mb-8">
            Vote4<span className="text-goat">GOAT</span>
          </a>
          <div className="text-4xl mb-4">📬</div>
          <h1 className="text-xl font-extrabold text-white mb-2">Check your inbox</h1>
          <p className="text-sm text-white/50 mb-6 leading-relaxed">
            We sent you a confirmation link. Click it to activate your account and start voting.
          </p>
          <p className="text-xs text-white/25 mb-6">Didn't receive it? Check your spam folder.</p>
          <a href="/login" className="text-sm text-goat hover:underline">
            Back to login
          </a>
        </div>
      </main>
    </>
  )
}
