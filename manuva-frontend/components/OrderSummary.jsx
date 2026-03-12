import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/lib/features/cart/cartSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();
    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('CHARGILY');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);


    const { orderId } = useSelector(state => state.cart);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!selectedAddress) {
            toast.error('Please select a shipping address');
            return;
        }

        if (!orderId) {
            toast.error('No active cart found');
            return;
        }

        try {
            const token = await getToken();
            
            // 1. Checkout existing order
            const checkoutData = {
                shipping_address: {
                    name: selectedAddress.name,
                    address: selectedAddress.address,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zip: selectedAddress.zip
                },
                payment_method: paymentMethod
            };

            const order = await apiRequest(`/orders/checkout/${orderId}`, {
                method: 'POST',
                body: JSON.stringify(checkoutData),
                headers: { Authorization: `Bearer ${token}` }
            });

            if (paymentMethod === 'CHARGILY') {
                const paymentResponse = await apiRequest('/payments/checkout', {
                    method: 'POST',
                    body: JSON.stringify({
                        order_id: order.id,
                        amount: totalPrice,
                        success_url: `${window.location.origin}/orders?success=true`,
                        failure_url: `${window.location.origin}/cart?canceled=true`
                    }),
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (paymentResponse.checkout_url) {
                    dispatch(clearCart());
                    window.location.href = paymentResponse.checkout_url;
                } else {
                    throw new Error('Failed to get checkout URL');
                }
            }
        } catch (error) {
            console.error('Order placement error:', error);
            toast.error(error.message || 'Failed to place order');
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="CHARGILY" name='payment' onChange={() => setPaymentMethod('CHARGILY')} checked={paymentMethod === 'CHARGILY'} className='accent-gray-500' />
                <label htmlFor="CHARGILY" className='cursor-pointer'>Chargily (Edahabia/CIB)</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.address}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                    </div>
                </div>
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{totalPrice.toLocaleString()}</p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary
