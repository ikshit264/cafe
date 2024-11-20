'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import axios from 'axios'

enum Category {
    Coffee = 'Coffee',
    Tea = 'Tea',
    Pastries = 'Pastries'
}

type MenuItem = {
    id: string
    name: string
    description: string
    price: number
    image_url: string
    category: Category
}

const API_BASE_URL = "http://23.20.192.56:8000/menu"
// const API_BASE_URL = "http://localhost:8000/menu"

const ItemForm: React.FC<{
    item: Partial<MenuItem>
    setItem: React.Dispatch<React.SetStateAction<Partial<MenuItem>>>
    handleSubmit: (e: React.FormEvent) => void
    isEditing: boolean
}> = ({ item, setItem, handleSubmit, isEditing }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
                type="text"
                id="name"
                value={item.name || ''}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
                id="description"
                value={item.description || ''}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
                type="number"
                id="price"
                value={item.price || ''}
                onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>
        <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
            <input
                type="text"
                id="image"
                value={item.image_url || ''}
                onChange={(e) => setItem({ ...item, image_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
                id="category"
                value={item.category || Category.Coffee}
                onChange={(e) => setItem({ ...item, category: e.target.value as Category })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                <option value={Category.Coffee}>Coffee</option>
                <option value={Category.Tea}>Tea</option>
                <option value={Category.Pastries}>Pastries</option>
            </select>
        </div>
        <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
            {isEditing ? 'Update Item' : 'Add Item'}
        </button>
    </form>
)

const MenuItemCard: React.FC<{
    item: MenuItem
    onEdit: () => void
    onDelete: () => void
}> = ({ item, onEdit, onDelete }) => (
    <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-sm font-medium">${item.price}</p>
            <p className="text-sm text-gray-500 capitalize">{item.category}</p>
        </div>
        <div className="flex space-x-2">
            <button
                onClick={onEdit}
                className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition-colors"
            >
                <FaEdit className="h-4 w-4" />
                <span className="sr-only">Edit {item.name}</span>
            </button>
            <button
                onClick={onDelete}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors"
            >
                <FaTrash className="h-4 w-4" />
                <span className="sr-only">Delete {item.name}</span>
            </button>
        </div>
    </div>
)

const Dialog: React.FC<{
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title: string
}> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default function CafeAdmin() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [newItem, setNewItem] = useState<Partial<MenuItem>>({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: Category.Coffee
    })
    const [editingItem, setEditingItem] = useState<Partial<MenuItem>>({})
    const [error, setError] = useState<string | null>(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/get-items`)
                setMenuItems(response.data.items)
            } catch (err) {
                setError('Error fetching menu items.')
                console.error(err)
            }
        }
        fetchItems()
    }, [])

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${API_BASE_URL}/add-item`, newItem)

            const item: MenuItem = {
                id: response.data.$oid,
                name: newItem.name || '',
                description: newItem.description || '',
                price: newItem.price || 0,
                image_url: newItem.image_url || '',
                category: newItem.category || Category.Coffee
            }
            setMenuItems([...menuItems, item])

            setNewItem({ name: '', description: '', price: 0, image_url: '', category: Category.Coffee })
            setIsAddDialogOpen(false)
            setError(null)
        } catch (err) {
            setError('Error adding item. Please try again.')
            console.error(err)
        }
    }

    const handleUpdateItem = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return
        try {
            const response = await axios.patch(`${API_BASE_URL}/update-item/${editingItem.id}`, editingItem)

            setMenuItems(menuItems.map((item) => (item.id === editingItem.id ? editingItem as MenuItem : item)))

            setEditingItem({})
            setIsEditDialogOpen(false)
            setError(null)
        } catch (err) {
            setError('Error updating item. Please try again.')
            console.error(err)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/delete-item/${id}`)
            setMenuItems(menuItems.filter((item) => item.id !== id))
            setError(null)
        } catch (err) {
            setError('Error deleting item.')
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 text-black">
            <h1 className="text-4xl font-bold mb-8 text-center">Cafe Admin</h1>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Menu Items</h2>
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <FaPlus className="mr-2" />
                        Add New Item
                    </button>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="space-y-4">
                    {menuItems.map((item) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            onEdit={() => {
                                setEditingItem(item)
                                setIsEditDialogOpen(true)
                            }}
                            onDelete={() => handleDelete(item.id)}
                        />
                    ))}
                </div>
            </div>

            <Dialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="Add New Item"
            >
                <ItemForm
                    item={newItem}
                    setItem={setNewItem}
                    handleSubmit={handleAddItem}
                    isEditing={false}
                />
            </Dialog>

            <Dialog
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                title="Edit Item"
            >
                {editingItem && (
                    <ItemForm
                        item={editingItem}
                        setItem={setEditingItem}
                        handleSubmit={handleUpdateItem}
                        isEditing={true}
                    />
                )}
            </Dialog>
        </div>
    )
}