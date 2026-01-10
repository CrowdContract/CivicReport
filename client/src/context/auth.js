import { useState, createContext, useContext, useEffect } from "react";
import axios from "axios";
import { API } from "../config";

const AuthContext = createContext();

// Set axios base URL once at module level
axios.defaults.baseURL = API;

// Restore token from localStorage immediately (before any component mounts)
const savedAuth = localStorage.getItem("auth");
if (savedAuth) {
  try {
    const parsed = JSON.parse(savedAuth);
    if (parsed?.token) {
      axios.defaults.headers.common["Authorization"] = parsed.token;
      axios.defaults.headers.common["refresh_token"] = parsed.refreshToken || "";
    }
  } catch (e) {}
}

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const fromLS = localStorage.getItem("auth");
      return fromLS ? JSON.parse(fromLS) : { user: null, token: "", refreshToken: "" };
    } catch {
      return { user: null, token: "", refreshToken: "" };
    }
  });

  // Keep axios headers in sync whenever auth changes
  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = auth?.token || "";
    axios.defaults.headers.common["refresh_token"] = auth?.refreshToken || "";
  }, [auth?.token, auth?.refreshToken]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalConfig = err.config;

        if (err.response) {
          // token is expired — try refresh
          if (err.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;

            try {
              const { data } = await axios.get("/refresh-token");
              axios.defaults.headers.common["Authorization"] = data.token;
              axios.defaults.headers.common["refresh_token"] = data.refreshToken;

              setAuth(data);
              localStorage.setItem("auth", JSON.stringify(data));

              originalConfig.headers["Authorization"] = data.token;
              return axios(originalConfig);
            } catch (_error) {
              // Refresh failed — clear auth
              setAuth({ user: null, token: "", refreshToken: "" });
              localStorage.removeItem("auth");
              return Promise.reject(_error);
            }
          }

          if (err.response.status === 403 && err.response.data) {
            return Promise.reject(err.response.data);
          }
        }

        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
