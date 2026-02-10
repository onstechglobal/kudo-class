import React, { useState, useEffect } from 'react';
// Import 'api' (your axios instance) and 'Api_url' (your string/object)
import api, { Api_url } from "../../helpers/api"; 
import { ArrowRight, CheckCircle2, Download } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import loadRazorpay from "../../helpers/loadRazorpay";

const Payment = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [feesData, setFeesData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [totalDue, setTotalDue] = useState(2099.99);

    useEffect(() => {
        setFeesData([
            { id: 1, name: 'Tuition Fee', type: 'Academic', amount: 1500.00 },
            { id: 2, name: 'Library Fund', type: 'Academic', amount: 500.00 },
            { id: 3, name: 'Lab Charges', type: 'Academic', amount: 99.99 },
        ]);
        setHistoryData([
            { id: 'TXN-8821', date: '12 Jan 2025', name: 'Admission Fee', method: 'UPI', status: 'Success', amount: 5000.00 },
        ]);
    }, []);

    const payNow = async () => {
        try {
            setLoading(true);

            // 1. Load Razorpay SDK
            const loaded = await loadRazorpay();
            if (!loaded) {
                alert("Razorpay SDK failed to load");
                return;
            }

            // 2. Create Order
            // Using 'api' instance automatically adds the baseURL and headers
            // We use /api/ prefix because it's defined in api.php
            const { data } = await api.post("/api/razorpay/create-order", { 
                amount: 2 
            });

            const options = {
                key: data.key,
                amount: data.amount,
                currency: "INR",
                name: "School Portal",
                description: "Test Payment",
                order_id: data.order_id,
                handler: async function (response) {
                    try {
                        // Use 'api' instance for verification too
                        await api.post("/api/razorpay/verify-payment", response);
                        alert("Payment Successful 🎉");
                        setActiveTab('history');
                    } catch (err) {
                        alert("Verification failed");
                    }
                },
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999",
                },
                theme: { color: "#0052cc" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Payment Error:", err);
            // Handling the case where Api_url might still be messy
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            {/* ... rest of your UI code remains exactly the same ... */}
            <div className="p-6 bg-[#f4f7fe] min-h-screen font-sans">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Payment Portal</h1>
                        <p className="text-slate-500 text-sm">Session: 2025-26 | Student ID: #10192</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-2">
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-[#0052cc] text-white' : 'text-slate-400'}`}
                        >
                            Pending Fees
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#0052cc] text-white' : 'text-slate-400'}`}
                        >
                            Paid History
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">{activeTab === 'pending' ? 'Fee Name' : 'Transaction'}</th>
                                            <th className="px-6 py-4">{activeTab === 'pending' ? 'Type' : 'Date'}</th>
                                            <th className="px-6 py-4">Amount</th>
                                            {activeTab === 'history' && <th className="px-8 py-5 text-center">Receipt</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 min-h-[400px]">
                                        {activeTab === 'pending' ? (
                                            feesData.map((fee) => (
                                                <tr key={fee.id} >
                                                    <td className="px-6 py-4 font-bold text-gray-800">{fee.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600"><span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">{fee.type}</span></td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">₹{fee.amount}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            historyData.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                                                    <td className="px-8 py-5 text-right font-black text-green-600">₹{item.amount}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600"><Download size={18} className="mx-auto text-blue-600 cursor-pointer" /></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {activeTab === 'pending' && (
                        <div className="w-full lg:w-96">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-6">
                                <div className="bg-[#0052cc] p-6 text-white">
                                    <p className="text-[10px] font-bold opacity-70 uppercase">Amount Due</p>
                                    <h2 className="text-4xl font-black mt-1">₹{totalDue}</h2>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-center text-sm font-bold pt-2">
                                        <span className="text-slate-800 uppercase text-xs">Final Total</span>
                                        <span className="text-2xl font-black text-[#0052cc]">₹{totalDue}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold pt-2">
                                        <span className="text-slate-800 uppercase text-xs">Processing Fee</span>
                                        <span className="text-green-600 font-bold">FREE</span>
                                    </div>

                                    <button 
                                        onClick={payNow}
                                        disabled={loading}
                                        className="w-full bg-[#ffab00] hover:bg-[#e69a00] text-white py-4 rounded-2xl font-black text-sm transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? "Processing..." : <>Pay ₹2 Test <ArrowRight size={18} /></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Payment;