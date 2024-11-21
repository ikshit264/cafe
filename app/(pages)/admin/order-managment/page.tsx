'use client'

import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { FiClock, FiCheck, FiCoffee, FiX, FiLoader } from 'react-icons/fi'

type OrderStatus = 'pending' | 'confirmed' | 'inprogress' | 'ready' | 'cancelled'

export interface Order {
    id: string
    customer_name: string
    order_items: {
        items: {
            name: string;
            price: number;
        };
        quantity: number
    }[] // Added quantity
    total_price: number
    status: OrderStatus
    created_at: Date
}

const statusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-200 text-yellow-800',
    confirmed: 'bg-blue-200 text-blue-800',
    inprogress: 'bg-purple-200 text-purple-800',
    ready: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-200 text-red-800',
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
    pending: <FiClock className="w-4 h-4" />,
    confirmed: <FiCheck className="w-4 h-4" />,
    inprogress: <FiCoffee className="w-4 h-4" />,
    ready: <FiCheck className="w-4 h-4" />,
    cancelled: <FiX className="w-4 h-4" />,
}

const API_BASE_URL = "http://23.20.192.56:8000/order"
// const API_BASE_URL = "http://localhost:8000/menu"

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loadingOrders, setLoadingOrders] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true) // Lazy loader state

    // Fetch orders from the API
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/get-orders`)
                console.log(response.data.orders)
                setOrders(response.data.orders)
            } catch (error) {
                console.error('Error fetching orders:', error)
            } finally {
                setLoading(false)  // Set loading to false after data is fetched
            }
        }

        fetchOrders()
    }, [])

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        // Mark the order as loading before updating
        setLoadingOrders((prevLoading) => new Set(prevLoading.add(orderId)))

        try {
            await axios.patch(`${API_BASE_URL}/update-order/${orderId}`, { status: newStatus })
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            )
        } catch (error) {
            console.error('Error updating order status:', error)
        } finally {
            // Remove the order from loading state after update
            setLoadingOrders((prevLoading) => {
                const newLoading = new Set(prevLoading)
                newLoading.delete(orderId)
                return newLoading
            })
        }
    }

    const StatusButton: React.FC<{ status: OrderStatus; isActive: boolean; isLoading: boolean; onClick: () => void }> = ({ status, isActive, isLoading, onClick }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${isActive ? statusColors[status] : 'bg-gray-200 text-gray-800'}`}
            disabled={isLoading}  // Disable the button while loading
        >
            {isLoading ? <FiLoader className="w-4 h-4 animate-spin" /> : statusIcons[status]}
            {status}
        </button>
    )

    if (loading) {
        // Show loading spinner while data is being fetched
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <FiLoader className="animate-spin w-8 h-8 text-gray-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-black">
            <h1 className="text-4xl font-bold mb-8 text-center">Order Management</h1>
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <ul>
                                            {order.order_items.map((item, index) => (
                                                <li key={index}>
                                                    {item.items.name} x {item.quantity} - ${item.items.price}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total_price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-wrap gap-2">
                                            <StatusButton
                                                status="confirmed"
                                                isActive={order.status === 'confirmed'}
                                                isLoading={loadingOrders.has(order.id)}
                                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                            />
                                            <StatusButton
                                                status="inprogress"
                                                isActive={order.status === 'inprogress'}
                                                isLoading={loadingOrders.has(order.id)}
                                                onClick={() => updateOrderStatus(order.id, 'inprogress')}
                                            />
                                            <StatusButton
                                                status="ready"
                                                isActive={order.status === 'ready'}
                                                isLoading={loadingOrders.has(order.id)}
                                                onClick={() => updateOrderStatus(order.id, 'ready')}
                                            />
                                            <StatusButton
                                                status="cancelled"
                                                isActive={order.status === 'cancelled'}
                                                isLoading={loadingOrders.has(order.id)}
                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
