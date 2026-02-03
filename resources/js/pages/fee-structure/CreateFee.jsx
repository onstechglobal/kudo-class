import AdminLayout from "../../layouts/AdminLayout";
import PageHeader from "../../components/common/PageHeader";
import Input from "../../components/form/Input";
import CustomSelect from "../../components/form/CustomSelect";

import { School, Save, Camera, Clock, MapPin, Bus } from "lucide-react";
import { useState } from "react";

const feeTypeClass = [
    { label: "Exam Fee", value: 1 },
    { label: "Educational Tour", value: 2 },
];

const frequencyClass = [
    { label: "One Time", value: "one_time" },
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Annual", value: "annual" },
];

const statusType = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 2 },
];

const CreateFee = () => {
    const [tab, setTab] = useState(1);

    const handleTab = (val) => {
        setTab(val);
    };

    return (
        <AdminLayout>
            <div className="bg-[#F8FAFC] min-h-screen p-6">
                <form id="school-reg-form">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-8 py-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <PageHeader
                                prevRoute="/fee-structure"
                                breadcrumbParent="Fee Structure"
                                breadcrumbCurrent="Add"
                                title="Configure Fee Structure"
                            />

                            <div className="items-center gap-3">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-[#faae1c] hover:bg-[#faae1c] text-white px-7 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                                >
                                    <Save size={18} />
                                    Save Structure
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Fee Type Tabs */}
                    <div className="flex gap-4 mb-8 mt-5 ml-7 bg-white p-2 rounded-2xl border border-gray-200 w-fit">
                        <button
                            type="button"
                            id="btnAcademic"
                            onClick={() => handleTab(1)}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all
        flex items-center gap-2 cursor-pointer
        ${
            tab === 1
                ? "text-white bg-[#0468C3] hover:bg-[#0468C3]"
                : "text-gray-400 hover:bg-gray-50"
        }
    `}
                        >
                            <School size={24} />
                            Academic Fee
                        </button>

                        <button
                            type="button"
                            id="btnTransport"
                            onClick={() => handleTab(0)}
                            className={`px-8 py-3 rounded-xl font-black text-sm transition-all
        flex items-center gap-2 cursor-pointer
        ${
            tab === 0
                ? "text-white bg-[#0468C3] hover:bg-[#0468C3]"
                : "text-gray-400 hover:bg-gray-50"
        }
    `}
                        >
                            <Bus size={24} />
                            Transport Fee
                        </button>
                    </div>

                    {/* --- FORM BODY --- */}
                    <div className="py-0 sm:p-8 max-w-[1600px] mx-auto">
                        <div className="sm:grid sm:grid-cols-12 sm:gap-8">
                            {/* Logo */}
                            <div className="py-8 sm:py-0 col-span-12 md:col-span-4 xl:col-span-3">
                                <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm text-center">
                                    <div className="relative w-40 h-40 mx-auto mb-6">
                                        <div className="w-full h-full rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            {tab === 1 ? (
                                                <AvatarLetter text="A" />
                                            ) : (
                                                <AvatarLetter text="T" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mt-2">
                                        Academic Fee
                                    </h3>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="col-span-12 md:col-span-8 xl:col-span-9">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-200 shadow-sm space-y-12">
                                    {/* Basic Details */}
                                    {tab === 1 && (
                                        <section>
                                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <School
                                                    className="text-blue-600"
                                                    size={24}
                                                />
                                                Academic Fee Details
                                            </h2>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="Fee Name *" />

                                                <CustomSelect
                                                    label="Fee Type *"
                                                    options={feeTypeClass}
                                                />

                                                <CustomSelect
                                                    label="Frequency *"
                                                    options={frequencyClass}
                                                />

                                                <Input label="Total Fee (₹) *" />

                                                <CustomSelect
                                                    label="Status *"
                                                    options={statusType}
                                                />
                                            </div>
                                        </section>
                                    )}

                                    {tab === 0 && (
                                        <section>
                                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <Bus
                                                    className="text-blue-600"
                                                    size={24}
                                                />
                                                Transport Fee Details
                                            </h2>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input label="Route Name *" />
                                                <Input label="Driver Name *" />
                                                <Input label="Monthly Amount (₹) *" />

                                                <CustomSelect
                                                    label="Status *"
                                                    options={statusType}
                                                />
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

/* ================= AVATAR ================= */
function AvatarLetter({ text }) {
    const letter = text?.trim()?.charAt(0)?.toUpperCase() || "U";
    return (
        <div
            className="w-32 h-32 mx-auto rounded-3xl flex items-center justify-center text-white text-5xl font-black"
            style={{ backgroundColor: "#FAAE1C" }}
        >
            {letter}
        </div>
    );
}

export default CreateFee;
