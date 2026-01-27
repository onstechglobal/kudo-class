import { useEffect, useRef, useState } from "react";
import { Menu, Search, BellRing } from "lucide-react";
import AvatarLetter from "@/components/AvatarLetter";

export default function Header({ onMenuOpen, sidebarOpen }) {
  const containerRef = useRef(null);

  const [expanded, setExpanded] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);

  const [school, setSchool] = useState("Oakwood Academy");
  const [session, setSession] = useState("2025-26");

  const [schoolInput, setSchoolInput] = useState("");
  const [sessionInput, setSessionInput] = useState("");

  const schools = [
    "Oakwood Academy",
    "Evergreen High School",
    "Summit International",
    "Riverdale Preparatory",
  ];

  const sessions = ["2025-26", "2026-27", "2027-28"];

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setExpanded(false);
        setActiveSegment(null);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const filteredSchools = schools.filter((s) =>
    s.toLowerCase().includes(schoolInput.toLowerCase())
  );

  const filteredSessions = sessions.filter((s) =>
    s.toLowerCase().includes(sessionInput.toLowerCase())
  );

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm" />
      )}

      <header
        className={`sticky top-0 flex h-[80px] items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-10
        ${sidebarOpen ? "z-0" : "z-40"}
        lg:z-40`}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={onMenuOpen} className="lg:hidden">
            <Menu size={26} />
          </button>

          {/* SEARCH */}
          <div
            ref={containerRef}
            className={`${
              expanded
                ? "fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white p-4 lg:static lg:border-0 lg:p-0"
                : "relative "
            }`}
          >
            {/* ⬇️ WIDTH FIX APPLIED HERE */}
            <div
              className={`relative 
                ${expanded ? "w-full max-w-full" : "w-[fit-content] lg:w-[380px]"}
              `}
            >
              <div
                className={`flex items-center rounded-full border bg-white p-2 shadow-sm
                  ${expanded ? "w-full lg:w-[580px] shadow-lg border-[#0468c3]" : "border-gray-200"}
                `}
              >
                {/* SCHOOL */}
                <div
                  className={`relative flex-1 cursor-pointer rounded-full px-4 py-1
                    ${expanded && activeSegment === "school" ? "shadow-md" : ""}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                    setActiveSegment("school");
                    setSchoolInput("");
                  }}
                >
                  <p className="text-[11px] font-bold uppercase">School</p>

                  {expanded && activeSegment === "school" ? (
                    <input
                      autoFocus
                      value={schoolInput}
                      onChange={(e) => setSchoolInput(e.target.value)}
                      placeholder="Which school?"
                      className="w-full text-[16px] lg:text-sm font-semibold outline-none"
                    />
                  ) : (
                    <p
                      className="text-sm text-slate-500 truncate 
                      max-w-[45px] 
                      [@media(min-width:481px)]:max-w-[100px] 
                      lg:max-w-[none]"
                    >
                      {school}
                    </p>
                  )}

                  {/* SCHOOL DROPDOWN */}
                  {expanded && activeSegment === "school" && (
                    <div className="absolute left-0 top-full mt-4 w-full rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
                      <div className="max-h-[240px] overflow-y-auto">
                        {filteredSchools.map((s) => (
                          <div
                            key={s}
                            onClick={() => {
                              setSchool(s);
                              setActiveSegment("session");
                            }}
                            className="cursor-pointer px-6 py-3 hover:bg-blue-50 hover:text-blue-600 hover:font-medium"
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`h-5 w-px bg-slate-200
                    ${expanded ? "hidden" : "hidden sm:block"}
                `} />

                {/* SESSION */}
                <div
                  className={`relative flex-1 cursor-pointer rounded-full px-4
                    ${expanded && activeSegment === "session" ? "shadow-md" : ""}
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                    setActiveSegment("session");
                    setSessionInput("");
                  }}
                >
                  <p className="text-[11px] font-bold uppercase">Session</p>

                  {expanded && activeSegment === "session" ? (
                    <input
                      autoFocus
                      value={sessionInput}
                      onChange={(e) => setSessionInput(e.target.value)}
                      placeholder="Select session"
                      className="w-full text-[16px] lg:text-sm font-semibold outline-none"
                    />
                  ) : (
                    <p className="truncate text-sm text-slate-500">
                      {session}
                    </p>
                  )}

                  {/* SESSION DROPDOWN */}
                  {expanded && activeSegment === "session" && (
                    <div className="absolute left-0 top-full mt-4 w-full rounded-2xl border border-gray-200 bg-white shadow-xl z-50">
                      <div className="max-h-[240px] overflow-y-auto">
                        {filteredSessions.map((s) => (
                          <div
                            key={s}
                            onClick={() => {
                              setSession(s);
                              setExpanded(false);
                              setActiveSegment(null);
                            }}
                            className="cursor-pointer px-6 py-3 hover:bg-blue-50 hover:text-blue-600 hover:font-medium"
                          >
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button className="ml-2 flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-full bg-[#0468c3] text-white cursor-pointer">
                  <Search size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 sm:gap-4">
          <div className="rounded-4xl p-[10px] bg-[#0468c3] cursor-pointer">
            <BellRing size={20} className="text-white" />
          </div>

          <AvatarLetter
            text="AD"
            size={40}
            className="rounded-full cursor-pointer"
            bgColor="#0468C3"
          />
        </div>
      </header>
    </>
  );
}
