'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Movie, ReviewWithUser } from '@/app/types'

export default function AddReviewPage() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [selectedMovie, setSelectedMovie] = useState('')
    const [rating, setRating] = useState('')
    const [comments, setComments] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch('/api/movies')
                if (response.ok) {
                    const data = await response.json()
                    setMovies(data)
                } else {
                    setError('Failed to fetch movies')
                }
            } catch (error) {
                console.error('Error fetching movies:', error)
                setError('An error occurred while fetching movies')
            }
        }
        fetchMovies()
    }, [])

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!selectedMovie || !rating || !comments) {
            setError('Please fill in all fields')
            return
        }

        const newReview: Partial<ReviewWithUser> = {
            movieId: parseInt(selectedMovie),
            rating: parseInt(rating),
            comments: comments
        }

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
                console.log('Review added successfully:', addedReview)
                router.push(`/movie/${selectedMovie}`)
            } else if (response.status === 401) {
                alert("Login before adding a review")
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

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-5">Add new review</h1>
            <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                    <select
                        value={selectedMovie}
                        onChange={(e) => setSelectedMovie(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select a movie</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>
                                {movie.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="Rating out of 10"
                        min="1"
                        max="10"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Review comments"
                        className="w-full p-2 border rounded"
                        rows={4}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add review
                </button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    )
}