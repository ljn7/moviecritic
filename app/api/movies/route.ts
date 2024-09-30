import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '9')
  const skip = (page - 1) * limit
 
  try {
    const movies = await prisma.movie.findMany({
      where: search ? {
        name: { contains: search, mode: 'insensitive' }
      } : undefined,
      include: { reviews: true },
      skip,
      take: limit,
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(movies)
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
    try {
      const body = await request.json()
      const { name, releaseDate } = body
  
      // Basic validation
      if (!name || !releaseDate) {
        return NextResponse.json({ error: 'Name and release date are required' }, { status: 400 })
      }
  
      const newMovie = await prisma.movie.create({
        data: {
          name,
          releaseDate: new Date(releaseDate),
        },
      })
  
      return NextResponse.json(newMovie, { status: 201 })
    } catch (error) {
      console.error('Error creating movie:', error)
      return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 })
    }
  }