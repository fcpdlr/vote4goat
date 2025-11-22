import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Ajusta este ID al deporte que quieras usar (ej: fútbol = 1)
const ENTITY_CATEGORY_ID = 1

export default function Top10Page() {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [candidates, setCandidates] = useState([]) // { id, name }
  const [search, setSearch] = useState('')
  const [slots, setSlots] = useState(Array(10).fill(null)) // 10 posiciones
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ipAddress, setIpAddress] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  // 1) Cargar IP una vez (para registrar submissions)
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        setIpAddress(data.ip)
      } catch (e) {
        console.warn('No se pudo obtener la IP:', e)
      }
    }
    fetchIp()
  }, [])

  // 2) Cargar categorías Top10 del deporte
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      setError(null)

      const { data, error } = await supabase
        .from('top10_categories')
        .select('id, title, description, entity_category_id')
        .eq('entity_category_id', ENTITY_CATEGORY_ID)
        .eq('is_active', true)
        .order('id', { ascending: true })

      if (error) {
        console.error('Error al cargar categorías Top10:', error)
        setError('Error loading Top 10 categories.')
        setIsLoadingCategories(false)
        return
      }

      const mapped = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
      }))

      setCategories(mapped)
      if (mapped.length > 0) {
        setSelectedCategoryId(mapped[0].id)
      }
      setIsLoadingCategories(false)
    }

    fetchCategories()
  }, [])

  // 3) Cargar candidatos cuando cambie la categoría seleccionada
  useEffect(() => {
    if (!selectedCategoryId) return

    const fetchCandidates = async () => {
      setIsLoadingCandidates(true)
      setError(null)

      // Necesitas que en Supabase exista la FK:
      // top10_category_entities.entity_id -> entities.id
      const { data, error } = await supabase
        .from('top10_category_entities')
        .select('entity_id, entities ( name )')
        .eq('top10_category_id', selectedCategoryId)
        .order('entities(name)', { ascending: true })

      if (error) {
        console.error('Error al cargar candidatos:', error)
        setError('Error loading candidates.')
        setIsLoadingCandidates(false)
        return
      }

      const mapped = (data || []).map(row => ({
        id: row.entity_id,        // uuid
        name: row.entities.name,  // nombre limpio para mostrar
      }))

      setCandidates(mapped)
      // Reiniciamos los slots al cambiar de categoría
      setSlots(Array(10).fill(null))
      setSearch('')
      setIsLoadingCandidates(false)
    }

    fetchCandidates()
  }, [selectedCategoryId])

  // IDs ya usados en el Top10 actual
  const selectedIds = slot
