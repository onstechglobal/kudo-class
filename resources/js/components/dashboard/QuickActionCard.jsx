
function QuickActionCard({ icon, title, bg }) {
    return (
        <button className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition flex flex-col items-center text-center gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <p className="text-xl font-semibold text-gray-700">{title}</p>
        </button>
    );
}

export default QuickActionCard;