function TimelineItem({ icon, title, desc, date, bg }) {
    return (
        <div className="bg-white border border-gray-100 shadow-sm hover:shadow-xl rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-start sm:items-center gap-4">
                <div className={`p-3 sm:p-4 rounded-full flex items-center justify-center ${bg}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xl font-semibold text-gray-800">{title}</p>
                    <p className="text-lg text-gray-500">{desc}</p>
                    <p className="sm:hidden text-lg text-gray-500">{date}</p>
                </div>
            </div>
            <span className="hidden sm:block text-lg text-gray-500 whitespace-nowrap">
                {date}
            </span>
        </div>
    );
}

export default TimelineItem;