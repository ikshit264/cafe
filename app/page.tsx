'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FaShoppingCart, FaPlus, FaMinus, FaTimes, FaCoffee, FaMugHot, FaCookie } from 'react-icons/fa'
import axios from 'axios'
import { Order } from './(pages)/admin/order-managment/page'
import { FiLoader } from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type MenuItem = {
  id: string
  name: string
  description: string
  price: string
  image: string
  category?: string
}

type CartItem = MenuItem & { quantity: number }

const API_BASE_URL = "https://menu.anatrix.tech"

export default function AppleStyleCafeMenu() {
  const [activeCategory, setActiveCategory] = useState('Coffee')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({
    Coffee: [],
    Tea: [],
    Pastries: []
  })

  const categorizeItems = (items: MenuItem[]) => {
    const categories: Record<string, MenuItem[]> = {
      Coffee: [],
      Tea: [],
      Pastries: []
    }
    console.log(items)
    items.forEach((item) => {
      if (item.category && categories[item.category]) {
        categories[item.category].push(item)
      } else {
        categories['Coffee'].push(item)
      }
    })
    setMenuItems(categories)
    console.log(categories)
  }

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/menu/get-items`)
        categorizeItems(response.data.items)
      } catch (err) {
        console.error(err)
      }finally {
        setLoading(false)  // Set loading to false after data is fetched
    }
    }
    fetchItems()
  }, [])

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        )
      }
      return prevCart.filter((cartItem) => cartItem.id !== item.id)
    })
  }

  const getItemQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem.id === itemId)
    return item ? item.quantity : 0
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)

  const handleOrder = async (FinalOrder: Order) => {
    try {
      // Send the order to the backend using POST request
      await axios.post(`${API_BASE_URL}/order/add-order`, FinalOrder);
      setError(null);  // Clear error if request is successful
      console.log("Order sent successfully.");
      toast.success("Your order has been placed successfully!");
      setIsCheckoutLoading(false);
      setCart([]);
      setIsCartOpen(false)
    } catch (err) {
      setError('Error placing the order.');
      console.error(err);
    }
  }
  const conformOrder = (cart: CartItem[]) => {
    // Prepare the order structure from the cart
    const order_items = cart.map((item) => ({
      items: {
        name: item.name,
        price: parseFloat(item.price),  // Convert price to a number
        description: item.description,  // Assuming description exists in CartItem
        image_url: item.image || '',      // Assuming image_url exists in CartItem
        category: item.category         // Assuming category exists in CartItem
      },
      quantity: item.quantity,
    }));
  
    // Calculate total price for the order
    const total_price = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  
    // Construct the final order object
    const FinalOrder: Order = {
      id: '',  // Leave ID empty for new orders, MongoDB will generate it
      customer_name: 'Ikshit', // Example customer name
      order_items: order_items,
      total_price: total_price,
      status: 'pending', // Assuming `OrderStatus` has a 'pending' value
      created_at: new Date(), // Ensure it's a valid ISO date string
    };
  
    setIsCheckoutLoading(true);

    // Call handleOrder to send the final order
    handleOrder(FinalOrder);
  };
  
  if (loading) {
    // Show loading spinner while data is being fetched
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <FiLoader className="animate-spin w-8 h-8 text-gray-500" />
        </div>
    )
}

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ToastContainer />
      <header className="sticky top-0 bg-white bg-opacity-90 backdrop-blur-md z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <ul className="flex space-x-8">
            {Object.keys(menuItems).map((category) => (
              <li key={category}>
                <button
                  className={`text-sm font-medium transition-colors ${activeCategory === category ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
          <button className="relative" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
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
          <h2 className="text-4xl font-semibold mb-12 text-center">{activeCategory}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            {menuItems[activeCategory]?.map((item) => (
              <div key={item.id} className="flex flex-col">
                <div className="aspect-square mb-4 relative flex items-center justify-center bg-gray-100 rounded-lg">
                  {item.image && item.image?.includes('placeholder') ? (
                    activeCategory === 'Coffee' ? (
                      <FaCoffee className="text-gray-400 w-12 h-12" />
                    ) : activeCategory === 'Tea' ? (
                      <FaMugHot className="text-gray-400 w-12 h-12" />
                    ) : (
                      <FaCookie className="text-gray-400 w-12 h-12" />
                    )
                  ) : (
                    <Image src={item.image ? item.image : '/default-placeholder.png'} alt={item.name} layout="fill" objectFit="cover" className="rounded-lg" />
                  )}
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
                    src={item.image ? item.image : '/default-placeholder.png'}
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
                onClick={() => conformOrder(cart)}
                disabled={cart.length === 0 || isCheckoutLoading}
              >
                {isCheckoutLoading ? <FiLoader className="animate-spin w-5 h-5" /> : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <footer className="bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-500 text-sm">
          <p>&copy; 2023 Cafe Elegance. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
