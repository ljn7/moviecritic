/* eslint-disable */
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname, useSearchParams } from 'next/navigation'
import { IoIosSearch } from 'react-icons/io'

// Debounce function (unchanged)
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      if (term) {
        current.set('search', term)
      } else {
        current.delete('search')
      }
      const search = current.toString()
      const query = search ? `?${search}` : ''
      router.push(`${pathname}${query}`)
    }, 300),
    [pathname, router, searchParams]
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    debouncedSearch(newSearchTerm)
  }

  return (
    <div className="mb-4 mr-[50%] relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <IoIosSearch className="h-5 w-5 text-gray-400"  />
      </div>
      <input
        type="text"
        placeholder="Search for your favorite movie"
        className="w-full p-2 pl-10 border rounded"
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  )
}