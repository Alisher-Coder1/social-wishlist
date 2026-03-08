import { supabase } from '@/lib/supabase'

export async function signUp(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password,
  })
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getUser() {
  return await supabase.auth.getUser()
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}