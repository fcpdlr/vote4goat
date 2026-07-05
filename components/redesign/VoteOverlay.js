import { useEffect } from "react"

// Bottom sheet: starts as a neutral 50/50 blue/red split, and once `result`
// is supplied (after the vote lands) animates its width to the real
// community verdict, with a gray can't-decide band opening in the middle.
export default function VoteOverlay({ playerA, playerB, result, onVote, onCantDecide, onDone, revealMs = 1800 }) {
  const voted = !!result

  useEffect(() => {
    if (!voted) return
    const t = setTimeout(() => onDone && onDone(), revealMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voted])

  const total = voted ? result.votesA + result.votesB + result.votesCantDecide : 0
  const growA = voted && total > 0 ? result.votesA : 1
  const growB = voted && total > 0 ? result.votesB : 1
  const growTie = voted && total > 0 ? result.votesCantDecide : 0
  const pctA = voted && total > 0 ? Math.round((result.votesA / total) * 100) : null
  const pctB = voted && total > 0 ? Math.round((result.votesB / total) * 100) : null
  const pctTie = voted && total > 0 ? Math.max(0, 100 - (pctA ?? 0) - (pctB ?? 0)) : null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-md bg-paper rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] overflow-hidden border-t border-ink/10">
        <div className="flex h-28">
          <button
            type="button"
            disabled={voted}
            onClick={() => !voted && onVote("a")}
            className="flex flex-col items-center justify-center gap-1 bg-side-a text-paper transition-all duration-700 disabled:cursor-default"
            style={{ flexGrow: growA, flexBasis: 0 }}
          >
            <span className="font-black text-sm truncate px-2">{playerA.short_name || playerA.name}</span>
            {pctA != null && <span className="text-xs font-bold opacity-90">{pctA}%</span>}
          </button>

          <div
            className="flex items-center justify-center bg-tie text-ink/60 transition-all duration-700 overflow-hidden"
            style={{ flexGrow: voted ? growTie : 0, flexBasis: 0 }}
          >
            {pctTie != null && pctTie > 0 && (
              <span className="text-[10px] font-semibold rotate-90 whitespace-nowrap">{pctTie}%</span>
            )}
          </div>

          <button
            type="button"
            disabled={voted}
            onClick={() => !voted && onVote("b")}
            className="flex flex-col items-center justify-center gap-1 bg-side-b text-paper transition-all duration-700 disabled:cursor-default"
            style={{ flexGrow: growB, flexBasis: 0 }}
          >
            <span className="font-black text-sm truncate px-2">{playerB.short_name || playerB.name}</span>
            {pctB != null && <span className="text-xs font-bold opacity-90">{pctB}%</span>}
          </button>
        </div>

        {!voted && (
          <button
            type="button"
            onClick={onCantDecide}
            className="w-full text-center text-xs text-ink/40 py-2 hover:text-ink/60 transition"
          >
            Can&apos;t decide
          </button>
        )}
      </div>
    </div>
  )
}
