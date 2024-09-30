import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { validateReview, ValidationError } from '@/app/lib/utils'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { Review } from '@/app/types'

const JWT_SECRET = process.env.JWT_SECRET || ''

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = parseInt(params.id, 10)
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

    // Check if the review belongs to the authenticated user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!existingReview || existingReview.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized to update this review' }, { status: 403 })
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: body.rating,
        comments: body.comments,
      },
    })

    // Update movie's average rating
    const movieReviews = await prisma.review.findMany({
      where: { movieId: existingReview.movieId },
    })
    const averageRating = movieReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / movieReviews.length
    await prisma.movie.update({
      where: { id: existingReview.movieId },
      data: { averageRating },
    })
   
    return NextResponse.json({
      ...updatedReview,
      averageRating: averageRating
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const reviewId = parseInt(params.id, 10)
  
      // Get the token from cookies
      const token = cookies().get('token')?.value
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
  
      // Verify the token and get the user ID
      const decoded = verify(token, JWT_SECRET) as { userId: number }
      const userId = decoded.userId
  
      // Check if the review belongs to the authenticated user
      const existingReview = await prisma.review.findUnique({
        where: { id: reviewId },
      })
  
      if (!existingReview || existingReview.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized to delete this review' }, { status: 403 })
      }
  
      // Delete the review
      await prisma.review.delete({
        where: { id: reviewId },
      })
  
      // Update movie's average rating
      const movieReviews = await prisma.review.findMany({
        where: { movieId: existingReview.movieId },
      })
      const averageRating = movieReviews.length > 0
        ? movieReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / movieReviews.length
        : 0
      await prisma.movie.update({
        where: { id: existingReview.movieId },
        data: { averageRating },
      })
  
      return NextResponse.json({
        message: 'Review deleted successfully',
        averageRating: averageRating
      })
    } catch (error) {
      console.error('Error deleting review:', error)
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }
  }