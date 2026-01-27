import AdminLayout from "@/layouts/AdminLayout";
import {
    Users,
    GraduationCap,
    UserCheck,
    ClipboardCheck,
    ShieldAlert,
    CalendarDays,
    FileText,
    Megaphone,
    Palmtree,
    IndianRupee,
} from "lucide-react";

import { useEffect, useState } from "react";
import api from "../helpers/api";

import Section from "../components/dashboard/Section";
import TimelineItem from "../components/dashboard/TimelineItem";
import FeeStatCard from "../components/dashboard/FeeStatCard";
import StatCard from "../components/dashboard/StatCard";
import AttendanceBar from "../components/dashboard/AttendanceBar";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import MiniCard from "../components/dashboard/MiniCard";
import AlertRow from "../components/dashboard/AlertRow";

export default function Dashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get("/dashboard")
            .then(res => setData(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <AdminLayout>
            {/* NO EXTRA PADDING */}
            <div className="space-y-6">

                {/* KPI SUMMARY */}
                <Section
                    title="KPI Summary"
                    icon={<ShieldAlert className="text-blue-600" />}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MiniCard
                            icon={<Users size={32} className="text-blue-500" />}
                            colorClass="bg-blue-50"
                            title="Total Students"
                            value="1,280"
                            sub="Total Students"
                        />
                        <MiniCard
                            icon={<GraduationCap size={32} className="text-teal-500" />}
                            colorClass="bg-teal-50"
                            title="Total Teachers"
                            value="75"
                            sub="Total Teachers"
                        />
                        <MiniCard
                            icon={<UserCheck size={32} className="text-orange-500" />}
                            colorClass="bg-orange-50"
                            title="Active Parents"
                            value="1,200"
                            sub="Active Parents"
                        />
                        <MiniCard
                            icon={<ClipboardCheck size={32} className="text-rose-500" />}
                            colorClass="bg-rose-50"
                            title="Today's Attendance"
                            value="92%"
                            greenText="+2.5%"
                            sub="vs yesterday"
                        />
                    </div>
                </Section>

                {/* ALERTS */}
                <Section
                    title="Alerts & Attention Required"
                    icon={<ShieldAlert className="text-orange-500" />}
                >
                    <div className="space-y-2">
                        <AlertRow text="Attendance not marked for Class 3A and 5B" />
                        <AlertRow text="₹ 85,400 fees pending collection" />
                        <AlertRow text="17 parents have not logged in yet" />
                        <AlertRow text="6 notifications failed to send" />
                    </div>
                </Section>

                {/* TODAY AT A GLANCE */}
                <Section
                    title="Today at a Glance"
                    icon={<CalendarDays className="text-blue-500" />}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MiniCard
                            icon={<CalendarDays size={32} className="text-blue-500" />}
                            colorClass="bg-blue-50"
                            title="Events Today"
                            value="2"
                            sub="Events Today"
                        />
                        <MiniCard
                            icon={<FileText size={32} className="text-teal-500" />}
                            colorClass="bg-teal-50"
                            title="Exams Today"
                            value="1"
                            sub="Exams Today"
                        />
                        <MiniCard
                            icon={<Megaphone size={32} className="text-orange-500" />}
                            colorClass="bg-orange-50"
                            title="Circulars Today"
                            value="3"
                            sub="Circulars Today"
                        />
                        <MiniCard
                            icon={<Palmtree size={32} className="text-rose-500" />}
                            colorClass="bg-rose-50"
                            title="Holidays Today"
                            value="0"
                            sub="Holidays Today"
                        />
                    </div>
                </Section>

                {/* QUICK ACTIONS — FULL WIDTH */}
                <Section title="Quick Actions">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickActionCard
                            icon={<Users size={28} />}
                            title="Add Student"
                            bg="bg-blue-50 text-blue-600"
                        />
                        <QuickActionCard
                            icon={<Megaphone size={28} />}
                            title="Post Circular"
                            bg="bg-orange-50 text-orange-500"
                        />
                        <QuickActionCard
                            icon={<FileText size={28} />}
                            title="Upload Resource"
                            bg="bg-indigo-50 text-indigo-500"
                        />
                        <QuickActionCard
                            icon={<ClipboardCheck size={28} />}
                            title="Mark Attendance"
                            bg="bg-green-50 text-green-500"
                        />
                    </div>
                </Section>

                {/* ATTENDANCE SNAPSHOT — FULL WIDTH BELOW */}
                <Section
                    title="Attendance Snapshot"
                    rightAction={
                        <span className="text-blue-600 text-sm cursor-pointer">
                            View Attendance Report →
                        </span>
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* BAR CHART */}
                        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-xl flex flex-col">
                            <p className="text-base font-semibold mb-4">
                                Today's Attendance
                            </p>

                            <div className="flex-1 flex items-end justify-around">
                                <AttendanceBar label="Today" value={92} />
                                <AttendanceBar label="Yesterday" value={89} />
                                <AttendanceBar label="Weekly Avg" value={87} />
                            </div>
                        </div>

                        {/* STATS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-4">
                            <StatCard
                                title="Today"
                                value="92%"
                                sub="+2.5% vs yesterday"
                                positive
                            />
                            <StatCard title="Yesterday" value="89%" />
                            <StatCard title="Weekly Avg" value="87%" />
                            <StatCard title="Teachers" value="78%" green />
                        </div>

                    </div>
                </Section>

                {/* FEES SNAPSHOT */}
                <Section
                    title="Fees Snapshot"
                    rightAction={
                        <span className="text-blue-600 text-sm cursor-pointer">
                            View Fee Report →
                        </span>
                    }
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FeeStatCard
                            icon={<IndianRupee size={28} className="text-orange-500" />}
                            title="Fees Due"
                            value="₹ 1,20,000"
                            bg="bg-orange-50"
                        />
                        <FeeStatCard
                            icon={<IndianRupee size={28} className="text-green-600" />}
                            title="Fees Collected"
                            value="₹ 3,65,000"
                            bg="bg-green-50"
                        />
                        <FeeStatCard
                            icon={<ShieldAlert size={28} className="text-red-500" />}
                            title="Outstanding"
                            value="₹ 85,400"
                            bg="bg-red-50"
                        />
                    </div>
                </Section>

                {/* TIMELINE */}
                <Section
                    title="Timeline"
                    rightAction={
                        <span className="text-blue-600 text-sm cursor-pointer">
                            View All Timeline →
                        </span>
                    }
                >
                    <div className="space-y-3">
                        <TimelineItem
                            icon={<CalendarDays className="text-blue-500" />}
                            title="Annual Sports Day"
                            desc="Sports Day event scheduled for next Friday"
                            date="Apr 23, 2024"
                            bg="bg-blue-50"
                        />
                        <TimelineItem
                            icon={<FileText className="text-indigo-500" />}
                            title="Study Materials for Class 10"
                            desc="Uploaded new study resources for Class 10 students"
                            date="Apr 22, 2024"
                            bg="bg-indigo-50"
                        />
                        <TimelineItem
                            icon={<Megaphone className="text-orange-500" />}
                            title="New School Uniform Circular"
                            desc="Updated guidelines on the new school uniform"
                            date="Apr 20, 2024"
                            bg="bg-orange-50"
                        />
                        <TimelineItem
                            icon={<ClipboardCheck className="text-rose-500" />}
                            title="Upcoming Exam Dates Announced"
                            desc="Timetable for the upcoming exams has been posted"
                            date="Apr 18, 2024"
                            bg="bg-rose-50"
                        />
                    </div>
                </Section>

            </div>
        </AdminLayout>
    );
}
