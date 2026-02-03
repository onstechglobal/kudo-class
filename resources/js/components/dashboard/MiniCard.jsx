function MiniCard({ icon, title, value, sub, colorClass, titleClass, contentClass }) {
    return (
        <div className="rounded-2xl shadow-sm overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl ">
            
            {/* Top colored section */}
            <div className={`flex justify-center items-center h-20 ${colorClass}`}>
                {icon}
            </div>

            {/* Content */}
            <div className="px-8 py-6 text-center bg-white space-y-3">
                <p className={`text-xl font-medium text-gray-700 ${titleClass}`}>{title}</p>
                <h3 className="text-3xl font-medium text-gray-700">{value}</h3>
                {sub && (
                    <div className={`flex justify-center gap-1 text-xl font-medium ${contentClass}`}>
                        <span className="text-gray-500">{sub}</span>
                    </div>
                )}
                <button className="w-full py-2 bg-[#4D85D7] text-white text-lg font-medium rounded-md hover:bg-[#3c73c7] transition cursor-pointer">
                    View →
                </button>
            </div>
        </div>
    );
}

export default MiniCard;