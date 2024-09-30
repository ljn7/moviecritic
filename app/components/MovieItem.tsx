'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Movie } from '@/app/types'
import { FiEdit } from 'react-icons/fi'
import { MdDelete } from 'react-icons/md'

export default function MovieItem({ movie, onDelete }: { movie: Movie; onDelete: (id: number) => Promise<void> }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(movie.name)

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        if (confirm('Are you sure you want to delete this movie?')) {
            onDelete(movie.id)
        }
    }

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const response = await fetch(`/api/movies/${movie.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...movie, name: editedName }),
            })
            if (response.ok) {
                setIsEditing(false)
                movie.name = editedName
            } else if (response.status === 401) {
                alert("Login to update the movie")
            } else {
                console.error('Failed to update movie')
                alert('Failed to update movie. Please try again.')
            }
        } catch (error) {
            console.error('Error updating movie:', error)
            alert('An error occurred while updating the movie. Please try again.')
        }
    }

    return (
        <div className="bg-[#e0defd] p-8 rounded shadow">
            {isEditing ? (
                <form onSubmit={handleUpdate}>
                    <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full p-2 mb-4 border rounded"
                    />
                    <div className="flex justify-between">
                        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                            Update
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400">
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div title={movie.name}>
                    <Link href={`/movie/${movie.id}`}>
                    <h2 className="text-2xl text-gray-800 from-neutral-800 pb-5">
                        {movie.name.length > 21 ? `${movie.name.slice(0, 21)}...` : movie.name}
                    </h2>
                    </Link>
                    <p className="italic text-gray-700 pb-5">Released: {new Date(movie.releaseDate).toLocaleDateString()}</p>

                    <div className="flex justify-between items-center">
                        <p className="text-lg font-semibold">
                            Rating: {movie.averageRating
                                ? parseFloat(movie.averageRating.toFixed(2)).toString() + "/10"
                                : 'N/A'}
                        </p>

                        <div className="flex space-x-2"> 
                            <button onClick={handleEdit} className="text-gray-500 p-2 rounded-2xl hover:bg-blue-600">
                                <FiEdit />
                            </button>
                            <button onClick={handleDelete} className="text-gray-500 p-2 rounded-2xl hover:bg-red-600">
                                <MdDelete />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}