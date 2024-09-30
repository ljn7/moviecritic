'use client'
import { useEffect, useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { Movie } from '@/app/types'
import MovieItem from './MovieItem'

const ITEMS_PER_PAGE = 9

export default function MovieList({
    searchParams,
}: {
    searchParams?: { search?: string }
}) {
    const [movies, setMovies] = useState<Movie[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ref, inView] = useInView({
        threshold: 0.1,
        rootMargin: '100px',
    })

    const loadMovies = useCallback(async (resetMovies = false) => {
        if (isLoading) return
        setIsLoading(true)
        setError(null)
        const searchTerm = searchParams?.search || ''
        const currentPage = resetMovies ? 1 : page
        try {
            const response = await fetch(`/api/movies?search=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`)
            if (response.ok) {
                const newMovies = await response.json()
                setMovies(prevMovies => {
                    if (resetMovies) return newMovies
                    const movieMap = new Map(prevMovies.map(movie => [movie.id, movie]))
                    newMovies.forEach((movie: Movie) => movieMap.set(movie.id, movie))
                    return Array.from(movieMap.values())
                })
                setHasMore(newMovies.length === ITEMS_PER_PAGE)
                setPage(prevPage => resetMovies ? 2 : prevPage + 1)
            } else {
                console.error('Error response from server:', response.status, response.statusText)
                setError(`Server error: ${response.status} ${response.statusText}`)
            }
        } catch (error) {
            console.error('Error loading movies:', error)
            setError('Failed to load movies. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }, [page, searchParams?.search])

    useEffect(() => {
        setMovies([])
        setPage(1)
        setHasMore(true)
        loadMovies(true)
    }, [searchParams?.search])

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            loadMovies()
        }
    }, [inView, hasMore, isLoading, loadMovies])

    const handleMovieDelete = async (movieId: number) => {
        try {
            const response = await fetch(`/api/movies/${movieId}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId))
                if (movies.length - 1 < ITEMS_PER_PAGE && hasMore) {
                    loadMovies()
                }
            } else if (response.status === 401) {
                alert("Login to delete the movie")
            } else {
                console.error('Failed to delete movie')
                setError('Failed to delete movie. Please try again.')
            }
        } catch (error) {
            console.error('Error deleting movie:', error)
            setError('An error occurred while deleting the movie. Please try again.')
        }
    }

    return (
        <div className="text-black">
            {isLoading && movies.length === 0 ? (
                <div className="text-center py-4">Loading movies...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                        {movies.map((movie: Movie) => (
                            <MovieItem key={movie.id} movie={movie} onDelete={handleMovieDelete} />
                        ))}
                    </div>
                    {hasMore && (
                        <div ref={ref} className="text-center py-4 mt-4" style={{ minHeight: '100px' }}>
                            {isLoading ? 'Loading more movies...' : 'Scroll to load more'}
                        </div>
                    )}
                </>
            )}
            {error && (
                <div className="text-center text-red-500 mt-4">
                    {error}
                </div>
            )}
            <div className="text-center mt-4">
                ◦
            </div>
        </div>
    )
}