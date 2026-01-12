function AttendanceBar({ label, value }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <span className="text-xl font-semibold text-blue-600">{value}%</span>
            <div className="w-16 bg-blue-100 rounded-xl h-full flex items-end">
                <div
                    className="w-full bg-blue-500 rounded-xl"
                    style={{ height: `${value}%` }}
                />
            </div>
            <span className="text-md text-gray-600">{label}</span>
        </div>
    );
}

export default AttendanceBar;