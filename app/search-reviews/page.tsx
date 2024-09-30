'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import ErrorMessage from '@/app/components/ErrorMessage'
import { Review } from '@/app/types'

const REVIEWS_PER_PAGE = 10

interface ReviewWithDetails extends Review {
  movie: { name: string };
  user: { username: string };
}

export default function SearchReviews() {
  const [searchTerm, setSearchTerm] = useState('')
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([])
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [totalReviews, setTotalReviews] = useState(0)
  const loadingRef = useRef(false)
  const [ref, inView] = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  const loadReviews = useCallback(async (resetReviews = false) => {
    if (loadingRef.current || !hasMore || !searchTerm) return
    loadingRef.current = true
    setIsLoading(true)
    setError(null)
    const currentPage = resetReviews ? 1 : page
    try {
      const response = await fetch(`/api/reviews/search?term=${encodeURIComponent(searchTerm.trim())}&page=${currentPage}&limit=${REVIEWS_PER_PAGE}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(prevReviews => {
          const updatedReviews = resetReviews ? data.reviews : [...prevReviews, ...data.reviews]
          return updatedReviews
        })
        setTotalReviews(data.total)
        setHasMore(currentPage * REVIEWS_PER_PAGE < data.total)
        setPage(prevPage => resetReviews ? 2 : prevPage + 1)
      } else {
        console.error('Error response from server:', response.status, response.statusText)
        setError(`Server error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      setError('Failed to load reviews. Please try again.')
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [page, searchTerm, hasMore])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setReviews([])
    setPage(1)
    setHasMore(true)
    loadReviews(true)
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (inView && hasMore && !isLoading) {
      timeoutId = setTimeout(() => {
        loadReviews()
      }, 300) // Debounce for 300ms
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [inView, hasMore, isLoading, loadReviews])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Search Reviews</h1>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSearch} className="mb-8">
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
     
      {reviews.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          <p className="mb-4">Found {totalReviews} reviews</p>
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded shadow mb-4">
              <p className="font-bold">Movie: {review.movie.name}</p>
              <p>User: {review.user.username}</p>
              <p>Rating: {review.rating}/10</p>
              <p>{review.comments}</p>
            </div>
          ))}
          {hasMore && (
            <div ref={ref} className="text-center py-4 mt-4">
              {isLoading ? 'Loading more reviews...' : 'Scroll to load more'}
            </div>
          )}
          {!hasMore && (
            <div className="text-center py-4 mt-4">
              No more reviews to load.
            </div>
          )}
        </div>
      ) : (
        <p>No reviews found.</p>
      )}
    </div>
  )
}