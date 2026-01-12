import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#f5f7fb]">
            <Sidebar />

            <div className="flex flex-col flex-1">
                <Header />

                <main className="flex-1 p-4">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}
