import MovieList from '@/app/components/MovieList'
import SearchBar from '@/app/components/SearchBar'

export default function Home({
  searchParams
}: {
  searchParams?: { search?: string }
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">The best movie reviews site!</h1>
      <SearchBar />
      <MovieList searchParams={searchParams} />
    </div>
  )
}