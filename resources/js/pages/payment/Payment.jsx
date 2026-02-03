import axios from "axios";
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import loadRazorpay from "../../helpers/loadRazorpay";

export default function Payment() {
    const [loading, setLoading] = useState(false);

    const payNow = async () => {
        try {
            setLoading(true);

            // 1️⃣ Load Razorpay SDK (ONLY HERE)
            const loaded = await loadRazorpay();
            if (!loaded) {
                alert("Razorpay SDK failed to load");
                return;
            }

            // 2️⃣ Create Order
            const { data } = await axios.post(
                "/razorpay/create-order",
                { amount: 1 } // ₹1
            );

            // 3️⃣ Options
            const options = {
                key: data.key,
                amount: data.amount,
                currency: "INR",
                name: "School Admin",
                description: "Test Payment",
                order_id: data.order_id,

                handler: async function (response) {
                    await axios.post(
                        "/razorpay/verify-payment",
                        response
                    );
                    alert("Payment Successful 🎉");
                },

                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999",
                },

                theme: {
                    color: "#2563eb",
                },
            };

            // 4️⃣ Open Razorpay
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-center items-center min-h-[70vh] bg-slate-100">
                <div className="bg-white p-8 rounded-xl shadow-lg w-80 text-center">
                    <h2 className="text-xl font-semibold mb-4">
                        Make a Payment
                    </h2>

                    <p className="text-lg mb-6">Amount: ₹1</p>

                    <button
                        onClick={payNow}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Pay Now"}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
