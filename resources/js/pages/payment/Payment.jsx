import React, { useState, useEffect } from 'react';
import api from "../../helpers/api";
import { ArrowRight, CheckCircle2, Download, History } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import loadRazorpay from "../../helpers/loadRazorpay";

const Payment = () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const isSchool = user?.role_id === 1 || user?.role_id === 2;
    const isParent = user?.role_id === 4;
    const studentId = user?.student_id ?? null;

    const [activeTab, setActiveTab] = useState(
        user?.role_id === 1 || user?.role_id === 2 ? 'history' : 'pending'
    );
    const [loading, setLoading] = useState(false);
    const [feesData, setFeesData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [totalDue, setTotalDue] = useState(0);
    const [pageLoading, setPageLoading] = useState(true);
    const [payCurrent, setPayCurrent] = useState(false);
    const [payBoth, setPayBoth] = useState(true);

    const downloadInvoice = (id) => {
        const url = `/api/invoice/${id}`;

        const link = document.createElement("a");
        link.href = url;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (user?.id) {
            fetchStudentData();
        }
    }, []);

    const fetchStudentData = async () => {
        try {
            setPageLoading(true);

            const { data } = await api.get(
                `/api/payments/student/${studentId}`,
                { params: { user_id: user.id } }
            );

            let previous = [];
            let current = [];

            const now = new Date();
            let currentMonth = now.getMonth() + 1; // Jan = 0 → Feb = 2

            // Academic session starts in April
            let sessionStartMonth = 4; // April
            let academicMonthIndex = (currentMonth - sessionStartMonth + 12) % 12 + 1; 
            // 1 = April, 2 = May, ..., 12 = March

            data.fees.forEach((fee) => {
                const totalDue = parseFloat(fee.total_due || 0);
                const monthly = parseFloat(fee.monthly_amount || 0);

                if (fee.fee_type === "academic" || fee.fee_type === "transport") {
                    if (monthly > 0 && totalDue > 0) {

                        const unpaidMonths = Math.floor(totalDue / monthly);

                        // 🔹 Previous months = all unpaid months before current month
                        const previousMonths = Math.min(unpaidMonths - 1, academicMonthIndex - 1);
                        if (previousMonths > 0) {
                            previous.push({
                                id: fee.id,
                                name: fee.fee_name + " (Previous)",
                                type: fee.fee_type,
                                amount: monthly * previousMonths
                            });
                        }

                        // 🔹 Current month fee
                        if (unpaidMonths >= academicMonthIndex) {
                            current.push({
                                id: fee.id,
                                name: fee.fee_name + " (Current Month)",
                                type: fee.fee_type,
                                amount: Math.min(monthly, totalDue - (previousMonths * monthly))
                            });
                        }
                    }
                } else {
                    // One-time fees (exam, misc, etc.)
                    if (totalDue > 0) {
                        current.push({
                            id: fee.id,
                            name: fee.fee_name,
                            type: fee.fee_type,
                            amount: totalDue
                        });
                    }
                }
            });

            // Format history as before
            const formattedHistory = data.history.map(item => ({
                payment_id: item.payment_id,
                receipt_no: item.payment_id,
                student_name: item.first_name,
                admission_no: item.admission_no,
                class: item.class,
                amount_paid: item.amount_paid,
                payment_mode: item.payment_mode,
                razorpay_payment_id: item.transaction_id,
                created_at: item.payment_date,
                status: item.status,
                receipt_url: item.receipt_url
            }));

            setFeesData({ previous, current });

            setHistoryData(formattedHistory);

            const total = [...previous, ...current].reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0);
            setTotalDue(total);

        } catch (err) {
            console.error(err);
        } finally {
            setPageLoading(false);
        }
    };

    // Dynamic total based on checkbox selection
    const getSelectedTotal = () => {
        if (!feesData) return 0;

        if (payBoth) {
            // Pay Previous + Current
            return [...feesData.previous, ...feesData.current].reduce(
                (sum, fee) => sum + parseFloat(fee.amount || 0),
                0
            );
        } else if (payCurrent) {
            // Pay only current month
            return feesData.current.reduce(
                (sum, fee) => sum + parseFloat(fee.amount || 0),
                0
            );
        }
        return 0; // nothing selected
    };

    const selectedTotal = getSelectedTotal();



    // ✅ BULK PAYMENT (PAY ALL PENDING)
    // ✅ PAYMENT FUNCTION WITH TYPE
    const payNow = async () => {
        if (selectedTotal === 0) return;

        const paymentType = payBoth ? "both" : "current";

        try {
            setLoading(true);
            await loadRazorpay();

            const { data } = await api.post("/api/payments/create-order", {
                amount: 5, // TEST MODE
                original_amount: selectedTotal, // ✅ dynamic based on checkbox
                payment_type: paymentType,
                user_id: user.id,
                student_id: studentId,
            });

            const options = {
                key: data.key,
                amount: data.amount,
                currency: "INR",
                order_id: data.order_id,

                handler: async function (response) {
                    await api.post("/api/payments/verify", {
                        ...response,
                        student_id: studentId,
                        original_amount: selectedTotal, // ✅ dynamic
                        payment_type: paymentType,
                        user_id: user.id
                    });

                    fetchStudentData();
                    setActiveTab("history");

                    setPayCurrent(false);
                    setPayBoth(true); // reset default
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            alert("Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-6 bg-[#f4f7fe] min-h-screen font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Payment Portal</h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Session: 2025-26 | Student ID: #{studentId}
                        </p>
                    </div>
                    {isParent && (
                        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-2">
                            <button 
                                onClick={() => setActiveTab('pending')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'pending'
                                        ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                Pending Fees
                            </button>
                            <button 
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === 'history'
                                        ? 'bg-[#0052cc] text-white shadow-lg shadow-blue-100'
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                Paid History
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {pageLoading ? (
                        <div className="lg:col-span-12 flex items-center justify-center py-24">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#0052cc]"></div>
                                <p className="text-xs font-semibold text-slate-500 tracking-widest animate-pulse">
                                    Loading Payment Data...
                                </p>
                            </div>
                        </div>
                    ) : (
                    !isSchool && activeTab === 'pending' ? (

                        feesData &&
                        (feesData.previous.length > 0 || feesData.current.length > 0) ? (

                            <>
                                <div className="lg:col-span-8">
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                                    <tr>
                                                        <th className="px-6 py-5">Fee Name</th>
                                                        <th className="px-6 py-5">Type</th>
                                                        <th className="px-6 py-5">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {/* 🔴 PREVIOUS PENDING FEES */}
                                                    {feesData?.previous?.length > 0 && (
                                                        <>
                                                            <tr>
                                                                <td
                                                                    colSpan="3"
                                                                    className="px-6 py-3 bg-red-50 text-red-600 text-xs font-bold uppercase"
                                                                >
                                                                    Previous Pending Fees
                                                                </td>
                                                            </tr>

                                                            {feesData.previous.map((fee, index) => (
                                                                <tr
                                                                    key={`prev-${fee.id}-${index}`}
                                                                    className="hover:bg-red-50 transition-colors"
                                                                >
                                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                                        {fee.name}
                                                                    </td>
                                                                    <td className="px-6 py-5">
                                                                        <span className="px-3 py-1 rounded-lg bg-red-100 text-red-600 text-[10px] font-black uppercase">
                                                                            {fee.type}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                                                                        ₹{fee.amount}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* 🔵 CURRENT MONTH / ACTIVE FEES */}
                                                    {feesData?.current?.length > 0 && (
                                                        <>
                                                            <tr>
                                                                <td
                                                                    colSpan="3"
                                                                    className="px-6 py-3 bg-blue-50 text-[#0052cc] text-xs font-bold uppercase"
                                                                >
                                                                    Current Month Fees
                                                                </td>
                                                            </tr>

                                                            {feesData.current.map((fee, index) => (
                                                                <tr
                                                                    key={`curr-${fee.id}-${index}`}
                                                                    className="hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                                        {fee.name}
                                                                    </td>
                                                                    <td className="px-6 py-5">
                                                                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#0052cc] text-[10px] font-black uppercase">
                                                                            {fee.type}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                                        ₹{fee.amount}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </>
                                                    )}

                                                    {/* 🟢 IF NO FEES */}
                                                    {feesData?.previous?.length === 0 &&
                                                        feesData?.current?.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan="3"
                                                                    className="px-6 py-6 text-center text-gray-400 text-sm"
                                                                >
                                                                    No pending fees 🎉
                                                                </td>
                                                            </tr>
                                                        )}

                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Summary */}
                                {isParent && activeTab === "pending" && (
                                <div className="lg:col-span-4">
                                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-6">
                                        <div className="bg-[#0052cc] p-6 text-white">
                                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                                                Total Amount Due
                                            </p>
                                            <h2 className="text-4xl font-black mt-1">
                                                ₹{selectedTotal}
                                            </h2>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium uppercase text-[10px] tracking-wider">
                                                    Final Total
                                                </span>
                                                <span className="text-xl font-black text-[#0052cc]">
                                                    ₹{selectedTotal}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-4">
                                                <span className="text-slate-500 font-medium uppercase text-[10px] tracking-wider">
                                                    Processing Fee
                                                </span>
                                                <span className="text-green-600 font-bold">
                                                    FREE
                                                </span>
                                            </div>

                                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

                                                <h3 className="text-lg font-bold text-gray-700">
                                                    Select Payment Option
                                                </h3>

                                                {/* Checkbox Options */}
                                                <div className="space-y-4">

                                                    {/* Current Month */}
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={payCurrent}
                                                            onChange={() => {
                                                                setPayCurrent(!payCurrent);
                                                                if (payBoth) setPayBoth(false); // uncheck payBoth if payCurrent selected
                                                            }}
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-600">
                                                            Pay Current Month
                                                        </span>
                                                    </label>

                                                    {/* Previous + Current */}
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={payBoth}
                                                            onChange={() => {
                                                                setPayBoth(!payBoth);
                                                                if (!payBoth) setPayCurrent(false); // uncheck payCurrent if payBoth selected
                                                            }}
                                                            className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-600">
                                                            Pay Previous + Current
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Single Payment Button */}
                                                <button
                                                    onClick={payNow}
                                                    disabled={loading || (!payCurrent && !payBoth) || totalDue === 0}
                                                    className="w-full bg-[#ffab00] hover:bg-[#e69a00] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 transition-all"
                                                >
                                                    {loading ? "Processing..." : "Proceed to Pay"}
                                                </button>

                                            </div>


                                        </div>
                                    </div>
                                </div>
                                )}
                            </>

                        ) : (

                            <div className="lg:col-span-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-white rounded-[32px] border border-slate-200 flex flex-col items-center justify-center py-12 px-6 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-800 mb-3 tracking-tight">
                                        All Settled!
                                    </h2>
                                    <p className="text-slate-500 max-w-sm mb-8 font-medium leading-relaxed">
                                        You don't have any pending payments for this month. 
                                        You're all caught up with your school dues.
                                    </p>
                                    <button 
                                        onClick={() => setActiveTab('history')}
                                        className="bg-[#ffab00] hover:bg-[#e69a00] text-white px-10 py-4 rounded-2xl flex items-center gap-3 uppercase text-sm font-bold transition-all"
                                    >
                                        <History size={18} />
                                        View Payment History
                                    </button>
                                </div>
                            </div>

                        )

                    ) : (
                        <div className="lg:col-span-12 animate-in fade-in duration-300">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        
                                        {/* Table Header */}
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                                                <th className="px-6 py-4">Receipt No</th>
                                                <th className="px-6 py-4">Student</th>
                                                <th className="px-6 py-4">Class</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Mode</th>
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Receipt</th>
                                            </tr>
                                        </thead>

                                        {/* Table Body */}
                                        <tbody className="divide-y divide-slate-100">

                                            {loading ? (
                                                <tr>
                                                    <td colSpan="8" className="py-14 text-center">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                                                            <p className="text-xs font-semibold text-slate-500 tracking-widest animate-pulse">
                                                                Loading Payment History...
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : historyData?.length > 0 ? (
                                                historyData.map((item, index) => (
                                                    <tr key={item.payment_id} className="hover:bg-slate-50 transition-all">
                                                        {/* Receipt */}
                                                        <td className="px-6 py-4 font-bold text-sm text-gray-700">
                                                            {item.receipt_no}
                                                        </td>

                                                        {/* Student */}
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            <div className="text-slate-800">
                                                                {item.student_name}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {item.admission_no}
                                                            </div>
                                                        </td>

                                                        {/* Class */}
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {item.class || "-"}
                                                        </td>

                                                        {/* Amount */}
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            ₹ {parseFloat(item.amount_paid || 0).toLocaleString("en-IN", {
                                                                minimumFractionDigits: 2,
                                                            })}
                                                        </td>

                                                        {/* Mode */}
                                                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                                                            {item.payment_mode}
                                                        </td>

                                                        {/* Transaction */}
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {item.razorpay_payment_id}
                                                        </td>

                                                        {/* Date */}
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {new Date(item.created_at).toLocaleDateString("en-IN")}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                                                                Success
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-500 flex items-center gap-3">
                                                            <Download
                                                                size={16}
                                                                className="text-blue-600 cursor-pointer hover:scale-110 transition"
                                                                onClick={() => downloadInvoice(item.payment_id)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                                        <p className="text-lg font-semibold">
                                                            No Payment History Found
                                                        </p>
                                                    </td>
                                                </tr>
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Payment;
