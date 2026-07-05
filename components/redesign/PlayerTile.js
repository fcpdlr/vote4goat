const ROTATIONS = ["-rotate-2", "-rotate-1", "rotate-1", "rotate-2"]

// Deterministic per-player rotation (not Math.random) so server and
// client render the same markup and hydration doesn't mismatch.
function rotationFor(seed) {
  return ROTATIONS[seed % ROTATIONS.length]
}

const SIZES = {
  sm: "w-12 h-12 text-sm",
  md: "w-16 h-16 text-lg",
  lg: "w-24 h-24 text-2xl",
}

export default function PlayerTile({ player, size = "md", side = null, className = "" }) {
  const rotate = rotationFor(player.id || 0)
  const sideBorder = side === "a" ? "border-side-a" : side === "b" ? "border-side-b" : "border-ink/15"

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className={`${SIZES[size]} ${rotate} ${sideBorder} bg-paper border-2 rounded-2xl flex items-center justify-center font-black text-ink shadow-sm`}
      >
        {player.jersey || "?"}
      </div>
      <span className="text-xs font-semibold text-ink/80 text-center truncate max-w-[6rem]">
        {player.short_name || player.name}
      </span>
    </div>
  )
}
