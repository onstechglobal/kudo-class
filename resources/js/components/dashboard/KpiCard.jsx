function KpiCard({ icon, title, value, greenText, sub, colorClass }) {
    return (
        <div className="rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            
            {/* Top colored section */}
            <div className={`flex justify-center items-center h-20 ${colorClass}`}>
                {icon}
            </div>

            {/* Content */}
            <div className="px-8 py-6 text-center bg-white space-y-3">
                <p className="text-xl font-medium text-gray-700">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
                {sub && (
                    <div className="flex justify-center gap-1 text-xl font-medium">
                        {greenText && <span className="text-green-600">{greenText}</span>}
                        <span className="text-gray-500">{sub}</span>
                    </div>
                )}
                <button className="w-full py-2 bg-[#4D85D7] text-white text-lg font-medium rounded-md hover:bg-[#3c73c7] transition">
                    View →
                </button>
            </div>
        </div>
    );
}

export default KpiCard;