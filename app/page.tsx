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
        image_url: '../public/coffee-6984075_1280.jpg',      // Assuming image_url exists in CartItem
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
                    <Image src={item.image ? item.image : 'data:image/jpeg;base64,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'} alt={item.name} layout="fill" objectFit="cover" className="rounded-lg" />
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
                    src={item.image ? item.image : 'data:image/jpeg;base64,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'}
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
