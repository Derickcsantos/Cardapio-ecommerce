import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Settings, ClipboardList } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

export const Header: React.FC = () => {
  const { user, logout, isAdmin, isEmployee } = useAuth()
  const { getItemsCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Cardápio</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-orange-500 transition-colors">
              Menu
            </Link>
            {user && (
              <Link to="/pedidos" className="text-gray-700 hover:text-orange-500 transition-colors">
                Meus Pedidos
              </Link>
            )}
            {isAdmin() && (
              <Link to="/admin" className="text-gray-700 hover:text-orange-500 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/carrinho" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {getItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemsCount()}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-orange-500 transition-colors">
                  <User className="w-6 h-6" />
                  <span className="hidden md:block">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <Link to="/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Meu Perfil
                    </Link>
                    <Link to="/pedidos" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Meus Pedidos
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="inline w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="inline w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}