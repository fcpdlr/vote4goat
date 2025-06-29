import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'

const allPlayers = [
  'Iker Casillas', 'Sergio Ramos', 'Fernando Hierro', 'Carles Puyol', 'José Antonio Camacho',
  'Andrés Iniesta', 'Xavi Hernández', 'Luis Suárez Miramontes', 'Luis Enrique', 'David Villa',
  'Fernando Torres', 'Raúl González', 'Emilio Butragueño', 'Francisco Gento', 'Pep Guardiola',
  'Amancio Amaro', 'Santillana', 'Rodri Hernández'
]

function PlayerCard({ name }) {
  const imageUrl = `/players/${name.toLowerCase().replace(/ /g, '_')}.jpg` // Ajusta si tienes otra lógica
  return (
    <div className="flex items-center bg-white/5 text-white px-3 py-2 rounded-lg gap-3 shadow-md">
      <img
        src={imageUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border border-white"
      />
      <span className="font-semibold text-sm truncate max-w-[180px]">{name}</span>
    </div>
  )
}

function SortablePlayer({ id }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PlayerCard name={id} />
    </div>
  )
}

export default function Top10Spain() {
  const [top10, setTop10] = useState([])

  const available = allPlayers.filter(p => !top10.includes(p))

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = top10.indexOf(active.id)
      const newIndex = top10.indexOf(over.id)
      setTop10(arrayMove(top10, oldIndex, newIndex))
    }
  }

  const addToTop10 = (player) => {
    if (top10.length < 10) setTop10([...top10, player])
  }

  const removeFromTop10 = (player) => {
    setTop10(top10.filter(p => p !== player))
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-white">
      <h1 className="text-3xl font-bold text-goat text-center mb-8">YOUR TOP 10 SPANISH PLAYERS</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold text-goat mb-4">Available Players</h2>
          <div className="space-y-2">
            {available.map((player) => (
              <div key={player} className="flex items-center justify-between">
                <PlayerCard name={player} />
                <button
                  className="text-goat text-sm font-bold hover:underline"
                  onClick={() => addToTop10(player)}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-goat mb-4">Your Top 10</h2>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={top10} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 min-h-[400px]">
                {top10.map((player) => (
                  <div key={player} className="flex items-center justify-between">
                    <SortablePlayer id={player} />
                    <button
                      className="text-red-400 text-sm font-bold hover:underline"
                      onClick={() => removeFromTop10(player)}
                    >
                      × Remove
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </main>
  )
}
