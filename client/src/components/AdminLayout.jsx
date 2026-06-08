import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const info = localStorage.getItem("adminInfo");
    if (!info) {
      navigate("/admin-login");
    }
  }, [navigate]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
