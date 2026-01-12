function TimelineItem({ icon, title, desc, date, bg }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bg}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xl font-semibold text-gray-800">{title}</p>
                    <p className="text-lg text-gray-500">{desc}</p>
                </div>
            </div>
            <span className="text-lg text-gray-500 whitespace-nowrap">
                {date}
            </span>
        </div>
    );
}

export default TimelineItem;