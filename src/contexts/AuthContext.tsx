import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-toastify";
import { mockApi } from "../utils/mockApi";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "employee";
  cnic: string;
  phoneNumber: string;
  designation: {
    _id: string;
    title: string;
  };
  department: {
    _id: string;
    name: string;
  };
  dateOfJoining: string;
  salary: number;
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await mockApi.auth.me();
          setUser(response.data);
          console.log("User authenticated:", response.data);
        } catch (error) {
          console.error("Auth initialization error:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("office_current_user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await mockApi.auth.login(email, password);
      console.log("Login response:", response.data);

      const { user: userData } = response.data;
      setUser(userData);

      toast.success(`Welcome back, ${userData.fullName}!`);
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error.message || "Login failed. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      console.log("Attempting registration with:", userData);
      const response = await mockApi.auth.register(userData);
      console.log("Registration response:", response.data);

      const { user: newUser } = response.data;
      setUser(newUser);

      toast.success(`Welcome to American Web Arena, ${newUser.fullName}!`);
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error.message || "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("office_current_user");
    setUser(null);
    toast.info("Logged out successfully");
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
