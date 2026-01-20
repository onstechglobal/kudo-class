import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
 
export default function AdminLayout({ children }) {
    return (
        /* h-screen + overflow-hidden prevents the whole page from scrolling */
        <div className="flex h-screen overflow-hidden bg-[#f5f7fb]">
           
            {/* Sidebar: Takes its natural width, stays locked to the left */}
            <aside className="flex-shrink-0 bg-white">
                <Sidebar />
            </aside>
 
            {/* Main Wrapper: Takes all remaining width */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
               
                {/* Header: Locked at the top of the content area */}
                <header className="flex-shrink-0 bg-white shadow-sm z-10">
                    <Header />
                </header>
 
                {/* Main: The ONLY scrollable part of the page */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="w-full px-[clamp(12px,1.5vw,32px)] py-5">
                        {children}
                    </div>
                    <Footer />
                </main>
               
            </div>
        </div>
    );
}