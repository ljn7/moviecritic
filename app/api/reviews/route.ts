import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { validateReview, ValidationError } from '@/app/lib/utils'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Review } from '@/app/types'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function POST(request: Request) {
  try {
    const body = await request.json()
    validateReview(body)

    // Get the token from cookies
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token and get the user ID
    const decoded = verify(token, JWT_SECRET) as { userId: number }
    const userId = decoded.userId

    const review = await prisma.review.create({
      data: {
        movieId: body.movieId,
        userId: userId,
        rating: body.rating,
        comments: body.comments,
      },
    })
   
    // Update movie's average rating
    const movieReviews = await prisma.review.findMany({
      where: { movieId: body.movieId },
    })
    const averageRating = movieReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / movieReviews.length    
    await prisma.movie.update({
      where: { id: body.movieId },
      data: { averageRating },
    })

    return NextResponse.json({
      ...review,
      averageRating: averageRating
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}