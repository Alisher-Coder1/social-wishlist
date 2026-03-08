import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data, error } = await supabase.from('wishlists').select('*').limit(1)

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Social Wishlist</h1>

      <div className="mt-6 rounded-xl border p-4">
        <p className="font-medium">Supabase connection test</p>
        <pre className="mt-3 overflow-auto text-sm">
          {JSON.stringify({ data, error }, null, 2)}
        </pre>
      </div>
    </main>
  )
}