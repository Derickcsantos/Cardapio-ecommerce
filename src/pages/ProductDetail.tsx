import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react'
import { supabase, Product } from '../lib/supabase'
import { useCart } from '../contexts/CartContext'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', productId)
        .eq('active', true)
        .single()

      if (error) throw error

      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
      // Feedback visual
      const button = document.getElementById('add-to-cart-btn')
      if (button) {
        button.textContent = 'Adicionado!'
        setTimeout(() => {
          button.textContent = 'Adicionar ao Carrinho'
        }, 1500)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Voltar ao Cardápio
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem */}
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-orange-400 text-2xl font-medium">Sem Imagem</span>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full mb-2">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="text-4xl font-bold text-orange-500">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </div>

          {/* Quantidade */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-full border border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-full border border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg">Total:</span>
                <span className="text-2xl font-bold text-orange-500">
                  R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Botão */}
            <button
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Adicionar ao Carrinho</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}