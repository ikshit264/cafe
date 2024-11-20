'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaShoppingCart, FaPlus, FaMinus, FaTimes, FaCoffee, FaMugHot, FaCookie } from 'react-icons/fa'

type MenuItem = {
  id: string
  name: string
  description: string
  price: string
  image: string
}

type CartItem = MenuItem & { quantity: number }

export default function AppleStyleCafeMenu() {
  const [activeCategory, setActiveCategory] = useState('coffee')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const menuItems: Record<string, MenuItem[]> = {
    coffee: [
      { id: 'c1', name: 'Espresso', description: 'Bold and rich', price: '$3.50', image: '/placeholder.svg?height=300&width=300' },
      { id: 'c2', name: 'Cappuccino', description: 'Espresso with silky milk foam', price: '$4.50', image: '/placeholder.svg?height=300&width=300' },
      { id: 'c3', name: 'Latte', description: 'Smooth espresso and steamed milk', price: '$4.75', image: '/placeholder.svg?height=300&width=300' },
      { id: 'c4', name: 'Americano', description: 'Espresso diluted with hot water', price: '$3.75', image: '/placeholder.svg?height=300&width=300' },
    ],
    tea: [
      { id: 't1', name: 'Green Tea', description: 'Light and refreshing', price: '$3.25', image: '/placeholder.svg?height=300&width=300' },
      { id: 't2', name: 'Earl Grey', description: 'Aromatic black tea with bergamot', price: '$3.50', image: '/placeholder.svg?height=300&width=300' },
      { id: 't3', name: 'Chamomile', description: 'Soothing caffeine-free herbal infusion', price: '$3.25', image: '/placeholder.svg?height=300&width=300' },
      { id: 't4', name: 'Chai Latte', description: 'Spiced tea with frothy milk', price: '$4.50', image: '/placeholder.svg?height=300&width=300' },
    ],
    pastries: [
      { id: 'p1', name: 'Croissant', description: 'Flaky, buttery perfection', price: '$3.25', image: '/placeholder.svg?height=300&width=300' },
      { id: 'p2', name: 'Blueberry Muffin', description: 'Bursting with fresh blueberries', price: '$3.50', image: '/placeholder.svg?height=300&width=300' },
      { id: 'p3', name: 'Cinnamon Roll', description: 'Gooey, sweet, and aromatic', price: '$4.00', image: '/placeholder.svg?height=300&width=300' },
      { id: 'p4', name: 'Chocolate Chip Cookie', description: 'Classic comfort with a crisp edge', price: '$2.75', image: '/placeholder.svg?height=300&width=300' },
    ],
  }

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        )
      }
      return prevCart.filter(cartItem => cartItem.id !== item.id)
    })
  }

  const getItemQuantity = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.price.slice(1)) * item.quantity), 0)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-md z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <ul className="flex space-x-8">
            {Object.keys(menuItems).map((category) => (
              <li key={category}>
                <button
                  className={`text-sm font-medium transition-colors ${activeCategory === category
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="relative"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
          >
            <FaShoppingCart className="w-6 h-6 text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-5xl font-bold text-center mb-16">Cafe Elegance</h1>

        <section>
          <h2 className="text-4xl font-semibold mb-12 text-center">{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            {menuItems[activeCategory].map((item) => (
              <div key={item.id} className="flex flex-col">
                <div className="aspect-square mb-4 relative">
                  <div className="aspect-square mb-4 relative flex items-center justify-center bg-gray-100 rounded-lg">
                    {item.image.includes('placeholder') ? (
                      activeCategory === 'coffee' ? (
                        <FaCoffee className="text-gray-400 w-12 h-12" />
                      ) : activeCategory === 'tea' ? (
                        <FaMugHot className="text-gray-400 w-12 h-12" />
                      ) : (
                        <FaCookie className="text-gray-400 w-12 h-12" />
                      )
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    )}
                  </div>

                </div>
                <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2 flex-grow">{item.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-md font-medium">{item.price}</p>
                  <div className="flex items-center">
                    <button
                      onClick={() => removeFromCart(item)}
                      className="p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                    <span className="mx-2 font-medium">{getItemQuantity(item.id)}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-4 border-b">
                <div className="flex items-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-md mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.price} x {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => removeFromCart(item)}
                    className="p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors mr-2"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <FaMinus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    aria-label={`Add ${item.name} to cart`}
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => alert('Proceeding to checkout...')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500 text-sm">
          <p>&copy; 2023 Cafe Elegance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}