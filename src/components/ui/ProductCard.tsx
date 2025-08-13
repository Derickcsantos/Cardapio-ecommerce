import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, ShoppingCart } from 'lucide-react'
import { Product } from '../../lib/supabase'
import { useCart } from '../../contexts/CartContext'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  return (
    <Link to={`/produto/${product.id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:scale-105">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <span className="text-orange-400 text-lg font-medium">Sem Imagem</span>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-500">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <button
              onClick={handleAddToCart}
              className="flex items-center space-x-2 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}