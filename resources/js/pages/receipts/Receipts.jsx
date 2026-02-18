import React, { useEffect, useState } from "react";
import api from "../../helpers/api";
import AdminLayout from "../../layouts/AdminLayout";
import Stat from "../../components/common/StatCard";
import {
  Download,
  CheckCircle2,
  Search,
  Receipt,
  IndianRupee,
  CreditCard
} from "lucide-react";

const Receipts = () => {

  const user = JSON.parse(localStorage.getItem("user"));

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [totalReceipts, setTotalReceipts] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  /* ================= FETCH RECEIPTS ================= */

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/receipts", {
        params: { user_id: user.id }
      });

      const formattedHistory = data.history.map(item => ({
        payment_id: item.payment_id,
        receipt_no: item.payment_id,
        student_name: `${item.first_name} ${item.last_name}`,
        admission_no: item.admission_no,
        class: item.class,
        amount_paid: item.amount_paid,
        payment_mode: item.payment_mode,
        transaction_id: item.transaction_id,
        created_at: item.payment_date,
        status: item.status,
      }));

      setHistoryData(formattedHistory);
      setTotalReceipts(formattedHistory.length);

      const total = formattedHistory.reduce(
        (sum, item) => sum + parseFloat(item.amount_paid || 0),
        0
      );

      setTotalAmount(total);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  /* ================= SEARCH ================= */

  const applySearch = () => {
    setAppliedSearch(searchInput);
  };

  const filteredReceipts = appliedSearch
    ? historyData.filter(r =>
        r.student_name?.toLowerCase().includes(appliedSearch.toLowerCase())
      )
    : historyData;

  /* ================= DOWNLOAD ================= */

  const downloadInvoice = (id) => {
    const url = `/api/invoice/${id}`;
    const link = document.createElement("a");
    link.href = url;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="relative p-6 bg-gray-50 min-h-screen font-sans">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Receipts
            </h1>
            <p className="text-sm text-gray-500">
              View and download student payment receipts
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat
            label="Total Receipts"
            value={totalReceipts.toString()}
            icon={<Receipt />}
          />
          <Stat
            label="Total Amount"
            value={`₹ ${totalAmount.toLocaleString("en-IN")}`}
            icon={<IndianRupee />}
            color="green"
          />
          <Stat
            label="Successful Payments"
            value={filteredReceipts.length.toString()}
            icon={<CreditCard />}
            color="blue"
          />
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applySearch()}
              placeholder="Search by student name..."
              className="w-full pl-10 pr-12 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={applySearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#faae1c] hover:bg-[#faae1c]/90 text-white p-2 rounded-lg"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-6 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="text-xs font-medium text-gray-600 animate-pulse tracking-widest">
                          Loading Receipts...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredReceipts.length > 0 ? (
                  filteredReceipts.map(item => (
                    <tr key={item.payment_id} className="hover:bg-gray-50">

                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        #{item.receipt_no}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-800">
                          {item.student_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.admission_no}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.class || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        ₹ {parseFloat(item.amount_paid || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-sm capitalize text-gray-600">
                        {item.payment_mode}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                          Success
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => downloadInvoice(item.payment_id)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                        >
                          <Download size={16} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      <p className="text-lg font-semibold">
                        No receipts found
                      </p>
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

export default Receipts;
