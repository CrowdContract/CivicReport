import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";

export default function Main() {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    setAuth({ user: null, token: "", refreshToken: "" });
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const loggedIn =
    auth.user !== null && auth.token !== "" && auth.refreshToken !== "";

  const handleReportClick = () => {
    if (loggedIn) {
      navigate("/report/create");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="nav d-flex justify-content-between align-items-center lead p-3 bg-light shadow-sm">
      <div className="d-flex align-items-center">
        <NavLink className="nav-link fw-bold text-primary" to="/">
          🏛️ Civic Report
        </NavLink>
        <NavLink className="nav-link" to="/">
          Home
        </NavLink>
      </div>

      <div className="d-flex align-items-center">
        <a className="nav-link pointer btn btn-primary text-white me-3" onClick={handleReportClick}>
          📝 Submit Report
        </a>

        {!loggedIn ? (
          <>
            <NavLink className="nav-link" to="/login">
              Login
            </NavLink>
            <NavLink className="nav-link" to="/register">
              Register
            </NavLink>
          </>
        ) : (
          <div className="dropdown">
            <a
              className="nav-link dropdown-toggle pointer"
              data-bs-toggle="dropdown"
            >
              👤 {auth?.user?.name || auth?.user?.username}
              {auth?.user?.role?.includes("Admin") && (
                <span className="badge bg-danger ms-2">Admin</span>
              )}
              {auth?.user?.role?.includes("Official") && (
                <span className="badge bg-info ms-2">Official</span>
              )}
            </a>
            <ul className="dropdown-menu">
              <li>
                <NavLink className="dropdown-item" to="/dashboard">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <a onClick={logout} className="dropdown-item pointer">
                  Logout
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
