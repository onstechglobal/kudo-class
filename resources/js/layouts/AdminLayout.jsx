import { useState } from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import Footer from "../components/common/Footer";
 
export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        /* h-screen + overflow-hidden prevents the whole page from scrolling */
        <div className="flex h-screen overflow-hidden bg-[#f5f7fb]">
           
            {/* Sidebar: Takes its natural width, stays locked to the left */}
            <aside className="flex-shrink-0 bg-white">
                <Sidebar 
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)} 
                />
            </aside>
 
            {/* Main Wrapper: Takes all remaining width */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
               
                {/* Header: Locked at the top of the content area */}
                <header className="lg:ml-[260px]">
                    <Header 
                        onMenuOpen={() => setSidebarOpen(true)}
                        sidebarOpen={sidebarOpen}
                    />
                </header>
 
                {/* Main: The ONLY scrollable part of the page */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden lg:ml-[260px]">
                    <div className="relative w-full px-[clamp(12px,1.5vw,32px)] py-5">
                        {children}
                    </div>
                    <Footer />
                </main>
               
            </div>
        </div>
    );
}