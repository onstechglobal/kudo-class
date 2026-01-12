function FeeStatCard({ icon, title, value, bg }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <p className="text-xl font-semibold text-gray-700">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    );
}


export default FeeStatCard;