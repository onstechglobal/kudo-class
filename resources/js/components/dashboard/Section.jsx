
function Section({ title, icon, rightAction, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 text-2xl font-semibold text-gray-800">
                    {icon}
                    {title}
                </div>
                {rightAction}
            </div>
            <div className="p-6 bg-[#F4F4FB] border border-gray-100 rounded-b-2xl shadow-sm">
                {children}
            </div>
        </div>
    );
}

export default Section;