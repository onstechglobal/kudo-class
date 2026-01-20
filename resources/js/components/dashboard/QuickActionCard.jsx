
function QuickActionCard({ icon, title, bg }) {
    return (
        <button className="group bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-xl transition-all hover:bg-[#4D85D7] transition flex flex-col items-center text-center gap-4 cursor-pointer">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <p className="text-xl font-semibold text-gray-700 group-hover:text-white transition-colors">{title}</p>
        </button>
    );
}

export default QuickActionCard;