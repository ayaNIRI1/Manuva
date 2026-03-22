'use client'
import { XIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { addAddress } from "@/lib/features/address/addressSlice"
import { algeriaData } from "@/lib/algeria-data"

const AddressModal = ({ setShowAddressModal }) => {

    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: 'Algeria',
        phone: ''
    })

    const [communes, setCommunes] = useState([])

    useEffect(() => {
        if (address.state && algeriaData[address.state]) {
            setCommunes(algeriaData[address.state].communes)
        } else {
            setCommunes([])
        }
    }, [address.state])

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'state') {
            setAddress(prev => ({
                ...prev,
                state: value,
                city: '' // Reset city when wilaya changes
            }))
        } else {
            setAddress(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatch(addAddress(address))
        setShowAddressModal(false)
        toast.success('Address added successfully')
    }

    const wilayaKeys = Object.keys(algeriaData).sort();

    return (
        <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-md mx-6 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-3xl ">Add New <span className="font-semibold text-brand-orange">Address</span></h2>
                </div>
                
                <div className="space-y-4">
                    <input name="name" onChange={handleAddressChange} value={address.name} className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors" type="text" placeholder="Full Name" required />
                    <input name="email" onChange={handleAddressChange} value={address.email} className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors" type="email" placeholder="Email Address" required />
                    <input name="address" onChange={handleAddressChange} value={address.address} className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors" type="text" placeholder="Street Address (e.g. 123 Rue de la Liberté)" required />
                    
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Wilaya</label>
                            <select 
                                name="state" 
                                onChange={handleAddressChange} 
                                value={address.state} 
                                className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors bg-white" 
                                required
                            >
                                <option value="">Select Wilaya</option>
                                {wilayaKeys.map(key => (
                                    <option key={key} value={key}>
                                        {algeriaData[key].name_ar} - {algeriaData[key].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Commune</label>
                            <select 
                                name="city" 
                                onChange={handleAddressChange} 
                                value={address.city} 
                                className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400" 
                                required
                                disabled={!address.state}
                            >
                                <option value="">Select Commune</option>
                                {communes.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors" type="number" placeholder="Zip Code" required />
                        <input name="country" readOnly value={address.country} className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full bg-slate-50 text-slate-500 cursor-not-allowed" type="text" placeholder="Country" />
                    </div>
                    
                    <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-3 px-4 outline-none border border-slate-200 rounded-xl w-full focus:border-brand-orange/50 transition-colors" type="text" placeholder="Phone Number (e.g. 05XX XX XX XX)" required />
                </div>

                <button className="bg-brand-mauve text-white text-sm font-bold py-3.5 rounded-xl hover:bg-brand-orange active:scale-[0.98] transition-all shadow-lg shadow-brand-mauve/20 mt-2">
                    SAVE ADDRESS
                </button>
            </div>
            <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-800 cursor-pointer bg-white/80 rounded-full p-1 transition-colors" onClick={() => setShowAddressModal(false)} />
        </form>
    )
}

export default AddressModal