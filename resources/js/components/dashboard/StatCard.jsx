
function StatCard({ title, value, sub, positive, green }) {
    return (
        <div
            className={`rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl text-center ${
                green ? "bg-green-50" : positive ? "bg-blue-50" : "bg-orange-50"
            }`}
        >
            <p className="text-lg text-gray-600">{title}</p>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            {sub && (
                <p className={`text-lg mt-1 ${positive ? "text-green-600" : "text-gray-500"}`}>
                    ▲ {sub}
                </p>
            )}
        </div>
    );
}


export default StatCard;