import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (!term) {
    return NextResponse.json({ error: 'Search term is required' }, { status: 400 })
  }

  const skip = (page - 1) * limit

  try {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          OR: [
            { comments: { contains: term, mode: 'insensitive' } },
            { movie: { name: { contains: term, mode: 'insensitive' } } },
            { user: { username: { contains: term, mode: 'insensitive' } } }
          ]
        },
        include: {
          movie: {
            select: { name: true }
          },
          user: {
            select: { username: true }
          }
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          OR: [
            { comments: { contains: term, mode: 'insensitive' } },
            { movie: { name: { contains: term, mode: 'insensitive' } } },
            { user: { username: { contains: term, mode: 'insensitive' } } }
          ]
        }
      })
    ])

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error searching reviews:', error)
    return NextResponse.json({ error: 'Failed to search reviews' }, { status: 500 })
  }
}