import PlayerTile from "./PlayerTile"

// daysDefended: null when the category doesn't have enough rank_snapshots
// history yet to say how long #1 has held the spot ("young category").
export default function Throne({ first, second, third, daysDefended = null, deadHeat = false }) {
  const isYoung = daysDefended == null

  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="relative mb-3">
        <PlayerTile player={first} size="lg" />
        <span className="absolute -top-2 -right-2 text-xl">&#128081;</span>
      </div>
      <h2 className="text-xl font-black text-ink">{first.name}</h2>

      {deadHeat ? (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-champion bg-champion/10 border border-champion/30 rounded-full px-3 py-1">
          Dead heat with #2
        </span>
      ) : isYoung ? (
        <p className="mt-1 text-xs text-ink/40 italic">Early days &mdash; help settle it</p>
      ) : (
        <p className="mt-1 text-xs text-ink/40">
          Defending #1 for {daysDefended} {daysDefended === 1 ? "day" : "days"}
        </p>
      )}

      {(second || third) && (
        <div className="flex items-start justify-center gap-6 mt-6">
          {second && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-ink/30">#2</span>
              <PlayerTile player={second} size="sm" />
            </div>
          )}
          {third && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-ink/30">#3</span>
              <PlayerTile player={third} size="sm" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
