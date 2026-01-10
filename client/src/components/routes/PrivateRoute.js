import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import axios from "axios";

export default function PrivateRoute() {
  const [auth] = useAuth();
  const [ok, setOk] = useState(null); // null = loading, true = ok, false = denied

  useEffect(() => {
    if (!auth?.token) {
      setOk(false);
      return;
    }
    getCurrentUser();
  }, [auth?.token]);

  const getCurrentUser = async () => {
    try {
      await axios.get("/current-user");
      setOk(true);
    } catch (err) {
      setOk(false);
    }
  };

  if (ok === null) return null; // still loading
  if (!ok) return <Navigate to="/login" replace />;
  return <Outlet />;
}
