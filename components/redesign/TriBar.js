export default function TriBar({
  votesA = 0,
  votesB = 0,
  votesCantDecide = 0,
  labelA,
  labelB,
  variant = "full",
  className = "",
}) {
  const total = votesA + votesB + votesCantDecide
  const hasVotes = total > 0
  const pctA = hasVotes ? Math.round((votesA / total) * 100) : 0
  const pctB = hasVotes ? Math.round((votesB / total) * 100) : 0
  const pctTie = hasVotes ? Math.max(0, 100 - pctA - pctB) : 0
  const height = variant === "slim" ? "h-1.5" : "h-3"

  return (
    <div className={className}>
      {variant === "full" && (labelA || labelB) && (
        <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
          <span className="text-side-a truncate">{labelA}</span>
          <span className="text-side-b truncate">{labelB}</span>
        </div>
      )}
      <div
        className={`flex w-full ${height} rounded-full overflow-hidden bg-tie/40`}
        role="img"
        aria-label={
          hasVotes
            ? `${pctA}% ${labelA || "A"}, ${pctTie}% can't decide, ${pctB}% ${labelB || "B"}`
            : "No votes yet"
        }
      >
        {hasVotes ? (
          <>
            <div className="bg-side-a transition-all duration-500" style={{ flexGrow: votesA, flexBasis: 0 }} />
            {votesCantDecide > 0 && (
              <div className="bg-tie transition-all duration-500" style={{ flexGrow: votesCantDecide, flexBasis: 0 }} />
            )}
            <div className="bg-side-b transition-all duration-500" style={{ flexGrow: votesB, flexBasis: 0 }} />
          </>
        ) : (
          <div className="bg-tie w-full" />
        )}
      </div>
      {variant === "full" && hasVotes && (
        <div className="flex items-center justify-between text-[11px] text-ink/50 mt-1">
          <span>{pctA}%</span>
          {votesCantDecide > 0 && <span>{pctTie}% can&apos;t decide</span>}
          <span>{pctB}%</span>
        </div>
      )}
    </div>
  )
}
