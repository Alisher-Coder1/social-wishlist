'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CreateWishlistPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()

  if (loading) return
  setLoading(true)

  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    alert('User not authenticated')
    setLoading(false)
    return
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({
      owner_id: user.id,
      title,
      description,
      public_id: crypto.randomUUID().slice(0, 8)
    })

  setLoading(false)

  if (error) {
    alert(error.message)
    return
  }

  router.push('/dashboard')
}

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-xl rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">Create wishlist</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full rounded-xl border p-2"
              placeholder="Birthday wishlist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-xl border p-2"
              placeholder="Things I would love to receive"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border px-4 py-2 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create wishlist'}
          </button>
        </form>
      </div>
    </main>
  )
}