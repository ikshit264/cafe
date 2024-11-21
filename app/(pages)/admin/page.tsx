'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiLoader } from 'react-icons/fi';

const API_BASE_URL = "http://23.20.192.56:8000" // Replace with your API base URL

export default function AdminCafe() {
    const [orders, setOrders] = useState<any[]>([]);  // State to store the orders
    const [pendingCount, setPendingCount] = useState<number>(0);  // State for pending orders count

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/order/get-orders`);

                // Filter orders with status 'pending'
                const pendingOrders = response.data.orders.filter((order: any) => order.status === 'pending');
                console.log(pendingOrders)
                // Set the filtered orders
                setOrders(response.data.orders);

                // Set the count of pending orders
                setPendingCount(pendingOrders.length);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-semibold mb-6 text-black">Welcome to the Admin Page</h1>

            <div className="space-x-4">
                <Link href="/admin/add-item" passHref>
                    <button
                        className="inline-block px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        aria-label="Add a new item"
                    >
                        Add Item
                    </button>
                </Link>

                <Link href="/admin/order-managment" passHref>
                    <button
                        className="relative inline-block px-6 py-3 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                        aria-label="Manage Orders"
                    >
                        Manage Orders
                        {pendingCount > 0 ? (
                            <span className="absolute top-0 left-full bg-yellow-200 text-yellow-900 text-xs font-bold rounded border border-1 border-yellow-800/50 w-5 h-5 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                                {pendingCount}
                            </span>
                        ) : ''}
                    </button>
                </Link>
            </div>


        </div>
    );
};
