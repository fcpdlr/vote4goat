export default function Logo({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corona */}
      <path
        d="M4 30 L4 10 L14 20 L22 4 L30 20 L40 10 L40 30 Z"
        stroke="rgba(255,255,255,0.80)"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="4"  cy="30" r="2.4" fill="#c8922a" />
      <circle cx="22" cy="4"  r="2.4" fill="#c8922a" />
      <circle cx="40" cy="30" r="2.4" fill="#c8922a" />

      {/* VOTE */}
      <text
        x="52" y="28"
        fontFamily="sans-serif"
        fontWeight="700"
        fontSize="24"
        fill="rgba(255,255,255,0.45)"
      >VOTE</text>

      {/* 4 */}
      <text
        x="118" y="28"
        fontFamily="sans-serif"
        fontWeight="700"
        fontSize="24"
        fill="#c8922a"
      >4</text>

      {/* GOAT */}
      <text
        x="135" y="28"
        fontFamily="sans-serif"
        fontWeight="700"
        fontSize="24"
        fill="rgba(255,255,255,0.92)"
      >GOAT</text>
    </svg>
  )
}
