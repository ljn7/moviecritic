import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import ErrorBoundary from './components/ErrorBoundary'
import LogoutButton from './components/LogoutButton'
import NavButton from './components/Button/NavButton'

export const metadata: Metadata = {
  title: 'Movie Review App',
  description: 'The best movie reviews site!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isLoggedIn = cookies().get('token')

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-700">
        <nav className="bg-[#d6d9df] shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex-shrink-0 flex items-center font-bold">
                  MOVIECRITIC
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                    <NavButton href="/add-movie">Add new movie</NavButton>
                    <NavButton href="/add-review" className="blue">Add new review</NavButton>
                    <NavButton href="/search-reviews" className="blue">Search reviews</NavButton>
                {isLoggedIn ? (
                  <LogoutButton />
                ) : (
                <NavButton href="/login" className="blue">
                    Login
                </NavButton>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </body>
    </html>
  )
}