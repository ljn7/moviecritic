'use client'

import { useRouter } from 'next/navigation'
import NavButton from './Button/NavButton'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <NavButton onClick={handleLogout} className="blue">
        Logout
    </NavButton>
  )
}