import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/layouts/AdminLayout";
import Stat from "../../components/common/StatCard";
import CustomButton from "../../components/form/CustomButton";
import { ArrowLeft, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import api from "../../helpers/api";

const View = () => {
  const { id } = useParams();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    balance: 0
  });

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/student-fees/${id}`);

      if (response.data.status) {
        const fees = response.data.data;
        setData(fees);
        calculateStats(fees);
      }
    } catch (error) {
      console.error("Error fetching details", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (fees) => {
    let total = 0;
    let paid = 0;
    let balance = 0;

    fees.forEach(f => {
      total += Number(f.net_amount);
      paid += Number(f.paid_amount);
      balance += Number(f.balance);
    });

    setStats({ total, paid, balance });
  };

  return (
    <AdminLayout>
      <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Student Payment Details
            </h1>
            <p className="text-sm text-gray-500">
              Complete breakdown of student fee payments
            </p>
          </div>

            <CustomButton
                text="Back"
                to="/student-fees"
                Icon = 'ArrowLeft'
                className="bg-[#faae1c] text-white hover:bg-[#faae1c]/85"
            />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat
            label="Total Fee"
            value={`₹${stats.total}`}
            icon={<Wallet />}
          />
          <Stat
            label="Total Paid"
            value={`₹${stats.paid}`}
            icon={<CheckCircle2 />}
            color="green"
          />
          <Stat
            label="Total Balance"
            value={`₹${stats.balance}`}
            icon={<AlertCircle />}
            color="red"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Fee Type</th>
                  <th className="px-6 py-4">Net Amount</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Penalty</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Due Day</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="text-xs text-gray-500 animate-pulse">
                          Loading Data...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">

                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {fee.fee_type}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ₹{fee.net_amount}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ₹{fee.paid_amount}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                        ₹{Number(fee.penalty_amount || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        ₹{Number(fee.penalty_amount || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {fee.due_day}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            fee.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : fee.status === "partial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No Fee Records Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default View;
