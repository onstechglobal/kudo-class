import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Calendar, ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import CustomSelect from "../../components/form/CustomSelect";
import DatePicker from "react-datepicker";
import { Api_url } from "../../helpers/api";

import "react-datepicker/dist/react-datepicker.css";

export default function Attendance() {

  /* ---------------- HELPERS ---------------- */
  const formatDate = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const formatDBDate = (d) => d.toISOString().split("T")[0];

  // Map frontend status codes to database values
  const statusMap = {
    'P': 'present',
    'A': 'absent', 
    'L': 'leave'
  };

  // Map database values to frontend status codes
  const reverseStatusMap = {
    'present': 'P',
    'absent': 'A',
    'leave': 'L'
  };

  /* ---------------- STATES ---------------- */
  const currentDate = new Date();
  const formattedCurrentDate = formatDate(currentDate);
  const endDate = currentDate;
  const minDate = new Date(2025, 3, 1);

  const [startDate, setStartDate] = useState(new Date());
  const [selectDate, setSelectDate] = useState(false);
  const [date, setDate] = useState(formatDate(new Date()));
  const [view, setView] = useState("list");

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [studentSelect, setStudentSelect] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [statsData, setStatsData] = useState([]);
  const [studentStats, setStudentStats] = useState({
    attendanceRate: "0%",
    totalPresent: "0",
    totalAbsent: "0",
    lateEntry: "0",
    totalDays: "0",
    currentYear: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [monthlyAttendance, setMonthlyAttendance] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const school_id = 1;
  const class_id = 1;
  const section_id = 1;

  /* ---------------- FETCH STUDENTS ---------------- */
  const fetchAttendance = async (d = startDate) => {
    try {
      const res = await axios.get(
        `${Api_url.name}api/attendance/students`,
        {
          params: {
            school_id,
            class_id,
            section_id,
            date: formatDBDate(d),
          },
          withCredentials: true,
        }
      );

      // Check if response.data is an array
      if (Array.isArray(res.data)) {
        setStudents(res.data);

        const map = {};
        res.data.forEach(s => {
          // Convert database status to frontend status code
          const frontendStatus = reverseStatusMap[s.status];
          console.log(s);
          map[s.student_id] = {
            status: "",
            remarks: s.remarks ?? "",
          };
        });

        setAttendance(map);

        if (!studentSelect && res.data.length) {
          const firstStudentId = res.data[0].student_id;
          setStudentSelect(firstStudentId);
          // Fetch stats for the first student
          fetchStudentStats(firstStudentId);
        }
      } else if (res.data && res.data.success === false) {
        // Handle error response from API
        setMessage({
          type: 'error',
          text: res.data.message || 'Failed to load attendance data'
        });
        setStudents([]);
        setAttendance({});
      } else {
        // Handle unexpected response format
        setStudents([]);
        setAttendance({});
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setMessage({
        type: 'error',
        text: 'Failed to load attendance data'
      });
      setStudents([]);
      setAttendance({});
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  /* ---------------- FETCH STUDENT STATS ---------------- */
  const fetchStudentStats = async (studentId) => {
    try {
      setLoading(true);
      setHeatmapLoading(true);
      
      const res = await axios.get(
        `${Api_url.name}api/attendance/student-stats/${studentId}`,
        { withCredentials: true }
      );
      
      if (res.data && res.data.success === true) {
        const { monthly_stats, yearly_stats, current_year } = res.data;
        
        // Process monthly data for chart
        if (monthly_stats && Array.isArray(monthly_stats)) {
          // Create array for all months (Jan-Dec)
          const allMonthsData = [
            { name: 'Jan', Present: 0, month: 1 },
            { name: 'Feb', Present: 0, month: 2 },
            { name: 'Mar', Present: 0, month: 3 },
            { name: 'Apr', Present: 0, month: 4 },
            { name: 'May', Present: 0, month: 5 },
            { name: 'Jun', Present: 0, month: 6 },
            { name: 'Jul', Present: 0, month: 7 },
            { name: 'Aug', Present: 0, month: 8 },
            { name: 'Sep', Present: 0, month: 9 },
            { name: 'Oct', Present: 0, month: 10 },
            { name: 'Nov', Present: 0, month: 11 },
            { name: 'Dec', Present: 0, month: 12 }
          ];
          
          // Fill in data from API response
          monthly_stats.forEach(item => {
            if (item.month >= 1 && item.month <= 12) {
              let percentage = parseFloat(item.percentage) || 0;
              allMonthsData[item.month - 1].Present = percentage;
            }
          });
          
          setStatsData(allMonthsData);
        } else {
          // If no monthly data, show empty chart
          const emptyData = [
            { name: 'Jan', Present: 0 },
            { name: 'Feb', Present: 0 },
            { name: 'Mar', Present: 0 },
            { name: 'Apr', Present: 0 },
            { name: 'May', Present: 0 },
            { name: 'Jun', Present: 0 },
            { name: 'Jul', Present: 0 },
            { name: 'Aug', Present: 0 },
            { name: 'Sep', Present: 0 },
            { name: 'Oct', Present: 0 },
            { name: 'Nov', Present: 0 },
            { name: 'Dec', Present: 0 }
          ];
          setStatsData(emptyData);
        }
        
        // Set yearly stats
        if (yearly_stats) {
          const totalDays = parseInt(yearly_stats.total_days) || 0;
          const presentDays = parseInt(yearly_stats.present_days) || 0;
          const absentDays = parseInt(yearly_stats.absent_days) || 0;
          const leaveDays = parseInt(yearly_stats.leave_days) || 0;
          const attendanceRate = yearly_stats.attendance_rate || 0;
          
          setStudentStats({
            attendanceRate: `${attendanceRate}%`,
            totalPresent: presentDays.toString(),
            totalAbsent: absentDays.toString(),
            lateEntry: leaveDays.toString(),
            totalDays: totalDays.toString(),
            currentYear: current_year
          });
        } else {
          setStudentStats({
            attendanceRate: "0%",
            totalPresent: "0",
            totalAbsent: "0",
            lateEntry: "0",
            totalDays: "0",
            currentYear: current_year
          });
        }
        
        // Fetch monthly attendance for heatmap
        await fetchMonthlyAttendance(studentId);
      } else {
        // Handle error response
        const errorMessage = res.data?.message || 'Failed to load student statistics';
        setMessage({
          type: 'error',
          text: errorMessage
        });
        
        // Set empty data
        const emptyData = [
          { name: 'Jan', Present: 0 },
          { name: 'Feb', Present: 0 },
          { name: 'Mar', Present: 0 },
          { name: 'Apr', Present: 0 },
          { name: 'May', Present: 0 },
          { name: 'Jun', Present: 0 },
          { name: 'Jul', Present: 0 },
          { name: 'Aug', Present: 0 },
          { name: 'Sep', Present: 0 },
          { name: 'Oct', Present: 0 },
          { name: 'Nov', Present: 0 },
          { name: 'Dec', Present: 0 }
        ];
        setStatsData(emptyData);
        setMonthlyAttendance([]);
        setStudentStats({
          attendanceRate: "0%",
          totalPresent: "0",
          totalAbsent: "0",
          lateEntry: "0",
          totalDays: "0",
          currentYear: new Date().getFullYear()
        });
      }
    } catch (error) {
      console.error("Error fetching student stats:", error);
      // Set empty data on error
      const emptyData = [
        { name: 'Jan', Present: 0 },
        { name: 'Feb', Present: 0 },
        { name: 'Mar', Present: 0 },
        { name: 'Apr', Present: 0 },
        { name: 'May', Present: 0 },
        { name: 'Jun', Present: 0 },
        { name: 'Jul', Present: 0 },
        { name: 'Aug', Present: 0 },
        { name: 'Sep', Present: 0 },
        { name: 'Oct', Present: 0 },
        { name: 'Nov', Present: 0 },
        { name: 'Dec', Present: 0 }
      ];
      setStatsData(emptyData);
      setMonthlyAttendance([]);
      
      setMessage({
        type: 'error',
        text: 'Failed to load student statistics'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
      setHeatmapLoading(false);
    }
  };

  /* ---------------- FETCH MONTHLY ATTENDANCE FOR HEATMAP ---------------- */
  const fetchMonthlyAttendance = async (studentId) => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const res = await axios.get(
        `${Api_url.name}api/attendance/monthly-attendance/${studentId}`,
        {
          params: {
            year: currentYear,
            month: currentMonth
          },
          withCredentials: true
        }
      );
      
      if (res.data && res.data.success === true && Array.isArray(res.data.data)) {
        // Create a map of date -> status
        const attendanceMap = {};
        res.data.data.forEach(item => {
          const date = new Date(item.date);
          const day = date.getDate();
          attendanceMap[day] = item.status;
        });
        
        // Get number of days in current month
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();
        
        // Create heatmap data for all days in month
        const heatmapData = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const status = attendanceMap[day];
          heatmapData.push({
            day: day,
            status: status || 'none',
            date: new Date(currentYear, currentMonth - 1, day)
          });
        }
        
        setMonthlyAttendance(heatmapData);
      } else {
        // If no data, create empty heatmap for current month
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();
        const emptyHeatmap = [];
        for (let day = 1; day <= daysInMonth; day++) {
          emptyHeatmap.push({
            day: day,
            status: 'none',
            date: new Date(currentYear, currentMonth - 1, day)
          });
        }
        setMonthlyAttendance(emptyHeatmap);
      }
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      // Create empty heatmap for current month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const lastDay = new Date(currentYear, currentMonth, 0);
      const daysInMonth = lastDay.getDate();
      
      const emptyHeatmap = [];
      for (let day = 1; day <= daysInMonth; day++) {
        emptyHeatmap.push({
          day: day,
          status: 'none',
          date: new Date(currentYear, currentMonth - 1, day)
        });
      }
      setMonthlyAttendance(emptyHeatmap);
    }
  };

  /* ---------------- GET STATUS COLOR ---------------- */
  const getStatusColor = (status) => {
    switch(status) {
      case 'present':
        return "bg-[#dcfce7] text-[#166534] border border-[#bdf0d2]";
      case 'absent':
        return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
      case 'leave':
        return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
      default:
        return "bg-[#f1f5f9] text-[#94a3b8]";
    }
  };

  /* ---------------- GET STATUS TOOLTIP ---------------- */
  const getStatusTooltip = (status) => {
    switch(status) {
      case 'present':
        return "Present";
      case 'absent':
        return "Absent";
      case 'leave':
        return "Leave";
      default:
        return "No Attendance";
    }
  };

  /* ---------------- GET LEGEND COLOR ---------------- */
  const getLegendColor = (status) => {
    switch(status) {
      case 'present':
        return "bg-[#dcfce7] border border-[#bdf0d2]";
      case 'absent':
        return "bg-[#fee2e2] border border-[#fecaca]";
      case 'leave':
        return "bg-[#fef3c7] border border-[#fde68a]";
      default:
        return "bg-[#f1f5f9]";
    }
  };

  useEffect(() => {
    fetchAttendance();
    
    // Check screen size for mobile
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (studentSelect) {
      fetchStudentStats(studentSelect);
    }
  }, [studentSelect, refreshTrigger]);

  /* ---------------- STATUS ---------------- */
  const setStatus = (id, status) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const markAllPresent = () => {
    const updated = {};
    students.forEach(s => {
      updated[s.student_id] = { status: "P", remarks: "" };
    });
    setAttendance(updated);
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  /* ---------------- DATE PICKER ---------------- */
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDatepickerOpen = () => {
    inputRef.current.setOpen(!isOpen);
  };

  const handleDateChange = (d) => {
    inputRef.current.setOpen(false);
    setStartDate(d);
    setSelectDate(true);
    setDate(formatDate(d));
    fetchAttendance(d);
  };

  const handleDateIncrease = () => {
    if(formattedCurrentDate!=date){
      const d = new Date(startDate);
      d.setDate(d.getDate() + 1);
      handleDateChange(d);
    }
  };

  const handleDateDecrease = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - 1);
    handleDateChange(d);
  };

  /* ---------------- SAVE ---------------- */
  const saveAttendance = async () => {
    try {
      // Prepare attendance data with proper status mapping
      const attendanceData = Object.keys(attendance).map(id => ({
        student_id: parseInt(id),
        status: statusMap[attendance[id].status] || 'present',
        remarks: attendance[id].remarks,
      }));

      await axios.post(
        `${Api_url.name}api/attendance/save`,
        {
          school_id,
          class_id,
          section_id,
          date: formatDBDate(startDate),
          attendance: attendanceData,
        },
        { withCredentials: true }
      );

      setMessage({
        type: 'success',
        text: 'Attendance saved successfully ✅'
      });
      
      // Refresh attendance data
      await fetchAttendance(startDate);
      
      // ALWAYS refresh stats when saving attendance, regardless of view
      // This ensures data consistency
      if (studentSelect) {
        // Force refresh by incrementing refresh trigger
        setRefreshTrigger(prev => prev + 1);
        // Also call fetchStudentStats directly for immediate update
        fetchStudentStats(studentSelect);
      }
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error("Error saving attendance:", error);
      setMessage({
        type: 'error',
        text: 'Failed to save attendance. Please try again.'
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  /* ---------------- DISCARD CHANGES ---------------- */
  const discardChanges = () => {
    fetchAttendance(startDate);
    setMessage({
      type: 'info',
      text: 'Changes discarded'
    });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const yTicks = Array.from({ length: 11 }, (_, i) => i * 20);

  // Get current month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6 pb-32">
        
        {/* HEADER */}
        <div className="sm:flex justify-between items-center mb-6">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">
              {view === "list" ? "Attendance Register" : "Student Insights"}
            </h1>
            <p className="text-gray-500">
              Class 10-A | {!selectDate ? `Today: ${date}` : `Date: ${date}`}
            </p>
          </div>

          <div className="[@media(min-width:400px)]:flex gap-2">
            <button
              onClick={() => setView("list")}
              className={`w-full [@media(min-width:400px)]:w-[fit-content] cursor-pointer px-4 py-2 mb-2 sm:mb-0 rounded-md border border-gray-200 font-semibold transition ${
                view === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Marking List
            </button>
            <button
              onClick={() => setView("stats")}
              className={`w-full [@media(min-width:400px)]:w-[fit-content] cursor-pointer px-4 py-2 mb-2 sm:mb-0 rounded-md border border-gray-200 font-semibold transition ${
                view === "stats"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              Student Analytics
            </button>
          </div>
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
          <>
            {/* DATE BAR */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:flex justify-between items-center mb-5">
              <div className="flex items-center gap-4">
                <ArrowLeft 
                  className="w-[20px] h-[20px] cursor-pointer" 
                  onClick={handleDateDecrease} 
                />
                <div
                  onClick={handleDatepickerOpen}
                  className="relative"
                >
                  <div className="flex items-center justify-between min-w-[150px] text-sm p-2 bg-gray-100 rounded-xl cursor-pointer">
                    <span className="text-[16px] font-bold text-[#1e3a8a]">{date}</span>
                    <div className="text-end">
                      <Calendar className="w-[20px] h-[20px]" />
                    </div>
                  </div>
                  <div className="absolute top-0 left-2">
                    <DatePicker
                      ref={inputRef}
                      selected={startDate}
                      onChange={handleDateChange}
                      maxDate={endDate}
                      dateFormat="MMM dd, yyyy"
                      className="outline-none focus:ring-2 focus:ring-blue-500 p-0 border-0 opacity-0"
                    />
                  </div>
                </div>
                <ArrowRight 
                  className={`w-[20px] h-[20px] cursor-pointer ${formattedCurrentDate==date ? "text-gray-400" : ""}`} 
                  onClick={handleDateIncrease} 
                />
              </div>

              <button
                onClick={markAllPresent}
                className="cursor-pointer bg-blue-600 text-white px-5 py-2 mt-2 sm:mt-0 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Quick Mark All Present
              </button>
            </div>

            {/* MESSAGE ALERT */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : message.type === 'error' ? (
                  <XCircle className="w-5 h-5" />
                ) : null}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            {/* TABLE */}
            <div className="bg-white rounded-xl border border-gray-300 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-bold text-gray-600">
                    <th className="p-4 text-left">Roll</th>
                    <th className="p-4 text-left">Student</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Remarks</th>
                    <th className="p-4 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                {students.length > 0 ? (
                  students.map(s => (
                    <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="text-sm font-semibold text-gray-800">
                          #{s.roll_no}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-bold text-gray-900">
                          {s.name}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                          {["P", "A", "L"].map(st => (
                            <button
                              key={st}
                              onClick={() => setStatus(s.student_id, st)}
                              className={`cursor-pointer w-7 sm:w-9 h-7 sm:h-9 rounded-md font-bold transition ${
                                attendance[s.student_id]?.status === st
                                  ? st === "P"
                                    ? "bg-green-500 text-white"
                                    : st === "A"
                                    ? "bg-red-500 text-white"
                                    : "bg-yellow-400 text-white"
                                  : "bg-white text-gray-400 hover:bg-gray-50"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          value={attendance[s.student_id]?.remarks || ""}
                          onChange={e =>
                            setAttendance(prev => ({
                              ...prev,
                              [s.student_id]: {
                                ...prev[s.student_id],
                                remarks: e.target.value,
                              },
                            }))
                          }
                          placeholder="Note..."
                          className="border border-gray-200 rounded-md px-2 py-1 w-28 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => {
                            const studentId = s.student_id;
                            setStudentSelect(studentId);
                            setView("stats");
                            // Force immediate stats refresh when switching to analytics
                            setTimeout(() => {
                              fetchStudentStats(studentId);
                            }, 100);
                          }}
                          className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* --- NO DATA FOUND --- */
                  <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          <p className="text-lg font-semibold">No data found</p>
                      </td>
                  </tr>
                )}
                
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* STATS VIEW */}
        {view === "stats" && (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 sm:flex justify-between items-center">
              <div className="w-48">
                <CustomSelect
                  options={students.map((s) => ({
                    label: s.name,
                    value: s.student_id,
                  }))}
                  value={studentSelect}
                  onChange={(value) => {
                    setStudentSelect(value);
                    // Force refresh stats when changing student
                    setTimeout(() => {
                      fetchStudentStats(value);
                    }, 0);
                  }}
                  placeholder="Select Student"
                />
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-600">
                  Attendance Rate: {studentStats.attendanceRate}
                </span>
                <p className="text-sm text-gray-500">
                  Year {studentStats.currentYear} | Total Days: {studentStats.totalDays}
                </p>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                ["Attendance Rate", studentStats.attendanceRate, "text-blue-600"],
                ["Total Present", studentStats.totalPresent, "text-green-600"],
                ["Total Absent", studentStats.totalAbsent, "text-red-600"],
                ["Total Leave", studentStats.lateEntry, "text-yellow-500"],
              ].map(([label, val, color]) => (
                <div
                  key={label}
                  className="bg-white border border-gray-200 rounded-lg p-4 text-center"
                >
                  <div className="text-xs text-gray-500 uppercase">{label}</div>
                  <div className={`text-2xl font-bold ${color}`}>{val}</div>
                </div>
              ))}
            </div>

            {/* CHART AND HEATMAP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* CHART */}
              <div className="sm:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold mb-3">
                  Monthly Presence Trends ({studentStats.currentYear})
                </h3>
                <div className="py-4 min-h-[fit-content] h-64 border border-dashed border-gray-200 rounded-md flex items-center justify-center">
                  <div className="w-full h-[300px] sm:h-[400px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading chart data...</div>
                      </div>
                    ) : statsData.length > 0 && statsData.some(item => item.Present > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={statsData} 
                          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                          style={{ outline: "none" }}
                        >
                          <XAxis 
                            dataKey="name" 
                            interval={isMobile ? 1 : 0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            ticks={yTicks}
                            tickFormatter={(v) => `${v}%`}
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            cursor={false}
                            labelFormatter={(label) => `${label}`}
                            formatter={(value) => [`${value}%`, "Attendance"]}
                          />
                          <Bar 
                            dataKey="Present" 
                            fill="#155dfc" 
                            barSize={30}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500 text-center">
                          No attendance data available for {studentStats.currentYear}
                          <p className="text-sm mt-1">Start marking attendance to see analytics</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* HEATMAP */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Monthly Heatmap - {currentMonth}</h3>
                  {heatmapLoading && (
                    <span className="text-xs text-gray-500">Loading...</span>
                  )}
                </div>
                
                {/* LEGEND */}
                <div className="flex flex-wrap gap-5 mb-6 text-xs">
                  <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded ${getLegendColor('present')}`}></div>
                    <span className="text-[#166534] font-medium">Present</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded ${getLegendColor('absent')}`}></div>
                    <span className="text-[#991b1b] font-medium">Absent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded ${getLegendColor('leave')}`}></div>
                    <span className="text-[#92400e] font-medium">Leave</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-[#f1f5f9]"></div>
                    <span className="text-[#94a3b8] font-medium">No Data</span>
                  </div>
                </div>
                
                {/* HEATMAP GRID */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Weekday headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 pb-1">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before the 1st of the month */}
                  {monthlyAttendance.length > 0 && 
                    Array.from({ length: new Date(monthlyAttendance[0].date).getDay() }).map((_, index) => (
                      <div key={`empty-${index}`} className="aspect-square"></div>
                    ))
                  }
                  
                  {/* Days of the month */}
                  {monthlyAttendance.map((item) => {
                    const date = new Date(item.date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={item.day}
                        className={`aspect-square rounded flex flex-col items-center justify-center text-xs relative ${
                          getStatusColor(item.status)
                        } ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                        title={`${item.day} ${currentMonth.split(' ')[0]} - ${getStatusTooltip(item.status)}`}
                      >
                        <span className={`font-medium ${item.status === 'none' ? 'text-[#94a3b8]' : ''}`}>
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ACTION BAR */}
        {view === "list" && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white lg:ml-[260px] p-4 sm:px-10 flex justify-end items-center">
            <div className="flex gap-3">
              <button 
                onClick={discardChanges}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-xl cursor-pointer border border-gray-200"
              >
                Discard
              </button>
              <button
                onClick={saveAttendance}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer bg-[#faae1c] text-white hover:bg-[#faae1c]/90"
              >
                Save Attendance
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}