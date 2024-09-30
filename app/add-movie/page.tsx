'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorMessage from '@/app/components/ErrorMessage'

export default function AddMovie() {
  const [name, setName] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = 'Movie name is required'
    }
    if (!releaseDate) {
      newErrors.releaseDate = 'Release date is required'
    } else if (isNaN(new Date(releaseDate).getTime())) {
      newErrors.releaseDate = 'Invalid release date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    
    if (!validateForm()) {
      return
    }

    try {
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, releaseDate }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add movie')
      }
      console.log("here")

      router.push('/')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Add New Movie</h1>
      {serverError && <ErrorMessage message={serverError} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Movie Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div className="mb-4">
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className={`w-full p-2 border rounded ${errors.releaseDate ? 'border-red-500' : ''}`}
          />
          {errors.releaseDate && <p className="text-red-500 text-sm mt-1">{errors.releaseDate}</p>}
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Add Movie
        </button>
      </form>
    </div>
  )
}