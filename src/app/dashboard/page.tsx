'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getMyWishlists } from '@/services/wishlist'

type Wishlist = {
  id: string
  title: string
  description: string | null
  public_id: string
  created_at: string
}

export default function DashboardPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWishlists() {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData.user

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await getMyWishlists(user.id)

      if (error) {
        console.error(error.message)
        setLoading(false)
        return
      }

      setWishlists(data || [])
      setLoading(false)
    }

    loadWishlists()
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border p-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to your social wishlist workspace.
          </p>

          <div className="mt-6">
            <Link
              href="/wishlist/create"
              className="inline-block rounded-2xl border px-4 py-3 font-medium transition hover:bg-gray-50"
            >
              Create wishlist
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Your wishlists</h2>

            {loading ? (
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            ) : wishlists.length === 0 ? (
              <div className="mt-4 rounded-2xl border p-4 text-sm text-gray-600">
                No wishlists yet. Create your first one.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {wishlists.map((wishlist) => (
                  <Link
                    key={wishlist.id}
                    href={`/wishlist/${wishlist.id}`}
                    className="rounded-2xl border p-4 transition hover:bg-gray-50"
                  >
                    <h3 className="font-semibold">{wishlist.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {wishlist.description || 'No description'}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Public link id: {wishlist.public_id}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}