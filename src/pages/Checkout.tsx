import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Home, CreditCard } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const Checkout: React.FC = () => {
  const { items, getTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [deliveryType, setDeliveryType] = useState<'local' | 'delivery'>('local')
  const [loading, setLoading] = useState(false)

  const deliveryFee = deliveryType === 'delivery' ? 15.00 : 0
  const total = getTotal() + deliveryFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          delivery_type: deliveryType,
          delivery_fee: deliveryFee,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Criar itens do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Simular pagamento (em produção, integrar com Stripe)
      alert('Pedido criado com sucesso! Em produção, seria integrado com Stripe.')
      
      clearCart()
      navigate('/pedidos')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Erro ao criar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/carrinho')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de entrega */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tipo de Entrega</h3>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="local"
                    checked={deliveryType === 'local'}
                    onChange={(e) => setDeliveryType(e.target.value as 'local' | 'delivery')}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center">
                    <Home className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <div className="font-medium">Comer no local</div>
                      <div className="text-sm text-gray-600">Retirar no balcão</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={deliveryType === 'delivery'}
                    onChange={(e) => setDeliveryType(e.target.value as 'local' | 'delivery')}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">Entrega</div>
                        <div className="text-sm text-gray-600">Entregar no endereço</div>
                      </div>
                    </div>
                    <div className="text-orange-500 font-medium">
                      + R$ {deliveryFee.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Endereço de entrega */}
            {deliveryType === 'delivery' && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço de Entrega</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço Completo
                    </label>
                    <textarea
                      required
                      defaultValue={user?.address || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={3}
                      placeholder="Rua, número, complemento, bairro, cidade"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botão de finalizar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Finalizar Pedido</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resumo do pedido */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo do Pedido</h3>
          
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {getTotal().toFixed(2).replace('.', ',')}</span>
            </div>
            
            {deliveryType === 'delivery' && (
              <div className="flex justify-between text-sm">
                <span>Taxa de entrega:</span>
                <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-orange-500">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}