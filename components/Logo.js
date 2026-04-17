export default function Logo({ className = "" }) {
  return (
    <svg
      viewBox="0 0 220 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown */}
      <g transform="translate(0,4)">
        <path
          d="M6 26 L6 12 L16 20 L24 6 L32 20 L42 12 L42 26 Z"
          stroke="white"
          strokeOpacity="0.85"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="6" cy="26" r="2.4" fill="#f5a623" />
        <circle cx="24" cy="6" r="2.4" fill="#f5a623" />
        <circle cx="42" cy="26" r="2.4" fill="#f5a623" />
      </g>

      {/* Text */}
      <text
        x="58"
        y="28"
        fontSize="24"
        fontWeight="700"
        fill="rgba(255,255,255,0.6)"
        fontFamily="system-ui, sans-serif"
      >
        VOTE
      </text>

      <text
        x="120"
        y="28"
        fontSize="24"
        fontWeight="700"
        fill="#f5a623"
        fontFamily="system-ui, sans-serif"
      >
        4
      </text>

      <text
        x="136"
        y="28"
        fontSize="24"
        fontWeight="700"
        fill="white"
        fontFamily="system-ui, sans-serif"
      >
        GOAT
      </text>
    </svg>
  )
}