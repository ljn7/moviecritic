'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ErrorMessage from './ErrorMessage'
import { Review } from '@/app/types'

type ReviewFormProps = {
  movieId: number;
  initialReview?: Review;
  onSubmit: (review: Review) => void;
  onCancel?: () => void;
}

export default function ReviewForm({ movieId, initialReview, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating || 5)
  const [comments, setComments] = useState(initialReview?.comments || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating)
      setComments(initialReview.comments)
    }
  }, [initialReview])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (rating < 1 || rating > 10) {
      newErrors.rating = 'Rating must be between 1 and 10'
    }
    if (!comments.trim()) {
      newErrors.comments = 'Review comments are required'
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

    const reviewData = {
      id: initialReview?.id,
      movieId,
      rating,
      comments
    }

    try {
      if (onSubmit) {
        // For editing an existing review
        onSubmit(reviewData as Review)
      } else {
        // For adding a new review
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData),
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to submit review')
        }
        router.refresh()
        setRating(5)
        setComments('')
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <h3 className="text-xl font-bold mb-4">{initialReview ? 'Edit Review' : 'Add a Review'}</h3>
      {serverError && <ErrorMessage message={serverError} />}
      <div className="mb-4">
        <label htmlFor="rating" className="block mb-2">Rating:</label>
        <input
          id="rating"
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className={`w-full p-2 border rounded ${errors.rating ? 'border-red-500' : ''}`}
        />
        {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="comments" className="block mb-2">Comments:</label>
        <textarea
          id="comments"
          placeholder="Your review"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className={`w-full p-2 border rounded ${errors.comments ? 'border-red-500' : ''}`}
        />
        {errors.comments && <p className="text-red-500 text-sm mt-1">{errors.comments}</p>}
      </div>
      <div className="flex justify-between">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          {initialReview ? 'Update Review' : 'Submit Review'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}