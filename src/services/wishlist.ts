import { supabase } from '@/lib/supabase'

function generatePublicId() {
  return crypto.randomUUID().slice(0, 8)
}

export async function createWishlist(
  ownerId: string,
  title: string,
  description: string
) {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      owner_id: ownerId,
      title,
      description,
      public_id: generatePublicId(),
    })
    .select()
    .single()

  return { data, error }
}

export async function getMyWishlists(ownerId: string) {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  return { data, error }
}