import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Helper function to verify token and get user
async function getAuthenticatedUser(token: string) {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true }
    })
    return user
  } catch (error) {
    console.log(error)
    return null
  }
}

// Helper function to check if user is admin
async function isAdmin(userId: number) {
    // (not implemented)
  return userId === userId 
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // GET function remains unchanged
  try {
    const movieId = parseInt(params.id, 10)
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      },
    })
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getAuthenticatedUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized to update movies' }, { status: 403 })
    }

    const movieId = parseInt(params.id, 10)
    const body = await request.json()
   
    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: {
        name: body.name,
      },
    })
    return NextResponse.json(updatedMovie)
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await getAuthenticatedUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized to delete movies' }, { status: 403 })
    }

    const movieId = parseInt(params.id, 10)
     
    await prisma.movie.delete({
      where: { id: movieId },
    })

    return NextResponse.json({ message: 'Movie and associated reviews deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}