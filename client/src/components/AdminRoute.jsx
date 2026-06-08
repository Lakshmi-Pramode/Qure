import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const adminInfo = JSON.parse(
    localStorage.getItem("adminInfo")
  );

  if (!adminInfo) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default AdminRoute;