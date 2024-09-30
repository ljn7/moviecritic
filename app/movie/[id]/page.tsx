'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import ReviewForm from '@/app/components/ReviewForm'
import { Movie, Review, User } from '@/app/types'
import { FiEdit } from 'react-icons/fi'
import { MdDelete } from 'react-icons/md'

type ReviewWithUser = Review & {
    user: User | null;
}

type MovieWithReviews = Movie & {
    reviews: ReviewWithUser[];
}

const REVIEWS_PER_PAGE = 10
const MAX_REVIEWS = 100

export default function MoviePage({ params }: { params: { id: string } }) {
    const [movie, setMovie] = useState<MovieWithReviews | null>(null)
    const [reviews, setReviews] = useState<ReviewWithUser[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingReview, setEditingReview] = useState<Review | null>(null)
    const loadingRef = useRef(false)
    const [ref, inView] = useInView({
        threshold: 0,
        rootMargin: '100px',
    })

    const loadReviews = useCallback(async (resetReviews = false) => {
        if (loadingRef.current || !movie || !hasMore || reviews.length >= MAX_REVIEWS) return
        loadingRef.current = true
        setIsLoading(true)
        setError(null)
        const currentPage = resetReviews ? 1 : page
        try {
            const response = await fetch(`/api/movies/${params.id}/reviews?page=${currentPage}&limit=${REVIEWS_PER_PAGE}`)
            if (response.ok) {
                const newReviews = await response.json()
                setReviews(prevReviews => {
                    const updatedReviews = resetReviews ? newReviews : [...prevReviews, ...newReviews]
                    setHasMore(newReviews.length === REVIEWS_PER_PAGE && updatedReviews.length < MAX_REVIEWS)
                    return updatedReviews
                })
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
    }, [page, movie, params.id, hasMore, reviews.length])


    useEffect(() => {
        async function fetchMovie() {
            try {
                const response = await fetch(`/api/movies/${params.id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch movie')
                }
                const movieData = await response.json()
                setMovie(movieData)
            } catch (error) {
                console.error('Error fetching movie:', error)
                setError('Failed to fetch movie. Please try again.')
            }
        }
        fetchMovie()
    }, [params.id])

    useEffect(() => {
        if (movie && reviews.length === 0) {
            loadReviews(true)
        }
    }, [movie, reviews.length, loadReviews])

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

    const handleEditReview = (review: Review) => {
        setEditingReview(review)
    }

    const handleDeleteReview = async (reviewId: number) => {
        if (confirm('Are you sure you want to delete this review?')) {
            try {
                const response = await fetch(`/api/reviews/${reviewId}`, {
                    method: 'DELETE',
                })
                if (response.ok) {
                    const data = await response.json()
                    setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId))
                    setMovie(prevMovie => prevMovie ? { ...prevMovie, averageRating: data.averageRating } : null)
                    if (reviews.length - 1 < REVIEWS_PER_PAGE && hasMore) {
                        loadReviews()
                    }
                } else if (response.status === 401) {
                    alert("Please login before trying to delete")
                } else {
                    const errorData = await response.json()
                    console.error('Failed to delete review:', errorData.error)
                    setError('Failed to delete review. Please try again.')
                }
            } catch (error) {
                console.error('Error deleting review:', error)
                setError('An error occurred while deleting the review. Please try again.')
            }
        }
    }
    
    const handleUpdateReview = async (updatedReview: Review) => {
        try {
            const response = await fetch(`/api/reviews/${updatedReview.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedReview),
            })
            if (response.ok) {
                const updatedReviewData = await response.json()
                setReviews(prevReviews => prevReviews.map(review =>
                    review.id === updatedReviewData.id
                        ? { ...review, ...updatedReviewData }
                        : review
                ))
                setEditingReview(null)
                setMovie(prevMovie => prevMovie ? { ...prevMovie, averageRating: updatedReviewData.averageRating } : null)
            } else if (response.status === 401) {
                alert("Please login before trying to update")
            } else {
                const errorData = await response.json()
                console.error('Failed to update review:', errorData.error)
                setError('Failed to update review. Please try again.')
            }
        } catch (error) {
            console.error('Error updating review:', error)
            setError('An error occurred while updating the review. Please try again.')
        }
    }

    const handleAddReview = async (newReview: Review) => {
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReview),
            })
            if (response.ok) {
                const addedReview = await response.json()
                setReviews(prevReviews => [addedReview, ...prevReviews])
                // Update movie's average rating
                setMovie(prevMovie => prevMovie ? { ...prevMovie, averageRating: addedReview.averageRating } : null)
            } else {
                const errorData = await response.json()
                console.error('Failed to add review:', errorData.error)
                setError('Failed to add review. Please try again.')
            }
        } catch (error) {
            console.error('Error adding review:', error)
            setError('An error occurred while adding the review. Please try again.')
        }
    }

    if (!movie) {
        return <div>Loading...</div>
    }

    return (
        <div className="text-black">
            <div>
                <div className="flex justify-between text-3xl font-bold mb-4 text-">
                    <h1 className="text-gray-600">{movie.name}</h1>
                    <p className="text-[#6558f5]">{movie.averageRating ? `${movie.averageRating.toFixed(1)} / 10.0` : 'N/A'}</p>
                </div>
                <p>Released: {new Date(movie.releaseDate).toLocaleDateString()}</p>
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-4">Reviews</h2>
            {reviews.map((review: ReviewWithUser) => (
                <div key={review.id} className="p-4 rounded shadow mb-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-grow pr-4">
                            {editingReview && editingReview.id === review.id ? (
                                <div>
                                    <ReviewForm
                                        movieId={movie.id}
                                        initialReview={editingReview}
                                        onSubmit={handleUpdateReview}
                                        onCancel={() => setEditingReview(null)}
                                    />
                                    <div className="bold">Review Id: {review.id}</div>
                                </div>
                            ) : (
                                <p className="text-lg mb-2">{review.comments}</p>
                            )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="text-sm text-gray-600">Rating: {review.rating}/10</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">By {review.user?.username || 'Anonymous'}</p>
                        <div className="flex space-x-2">
                            <button onClick={() => handleEditReview(review)} className="text-blue-500 hover:text-blue-700">
                                <FiEdit />
                            </button>
                            <button onClick={() => handleDeleteReview(review.id)} className="text-red-500 hover:text-red-700">
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {hasMore && (
                <div ref={ref} className="text-center py-4 mt-4">
                    {isLoading ? 'Loading more reviews...' : 'Scroll to load more'}
                </div>
            )}
            {!hasMore && reviews.length > 0 && (
                <div className="text-center py-4 mt-4">
                    No more reviews to load.
                </div>
            )}
            {error && (
                <div className="text-center text-red-500 mt-4">
                    {error}
                </div>
            )}
            
            <Link href="/" className="mt-8 inline-block text-blue-500 hover:underline">
                Back to all movies
            </Link>
        </div>
    )
}