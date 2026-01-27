function FeeStatCard({ icon, title, value, bg }) {
    return (
        <div className="bg-white border border-gray-100 shadow-sm hover:shadow-xl rounded-2xl p-8 text-center space-y-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <p className="text-lg md:text-xl font-semibold text-gray-700">{title}</p>
            <p className="text-2xl md:text-3xl font-medium text-gray-700">{value}</p>
        </div>
    );
}


export default FeeStatCard;