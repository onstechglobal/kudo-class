import {ShieldAlert} from "lucide-react";
function AlertRow({ text }) {
    return (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4">
            <div className="flex items-center gap-4">
                <ShieldAlert className="text-orange-500" />
                <span className="text-gray-700 text-lg">{text}</span>
            </div>
            {/* 
            <button className="bg-[#4D85D7] hover:bg-[#3c73c7] transition text-white px-8 py-2 rounded-md text-lg">
                Fix Now →
            </button>
            */}
        </div>
    );
}

export default AlertRow;