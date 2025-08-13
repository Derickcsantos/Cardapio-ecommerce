import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type User = {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  type: number
  created_at: string
}

export type Category = {
  id: string
  name: string
  description: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  active: boolean
  created_at: string
  category?: Category
}

export type Order = {
  id: string
  user_id: string
  total_amount: number
  delivery_type: 'local' | 'delivery'
  delivery_fee: number
  status: string
  stripe_payment_intent_id?: string
  created_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  product?: Product
}