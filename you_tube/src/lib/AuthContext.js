import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, createContext, useEffect, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";
import { useTheme } from "./ThemeContext";
import { useRouter } from "next/router";
import { toast } from "sonner";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const { setTheme } = useTheme();
    const router = useRouter();

    const login = (userdata) => {
        setUser(userdata);
        localStorage.setItem("user", JSON.stringify(userdata));
        if (userdata.themePreference) {
            setTheme(userdata.themePreference);
        }
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };

    // STEP 1: Initiate Login (Send OTP)
    const initiateLogin = async (payload) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/user/login", payload);
            if (response.data.success) {
                // Set theme immediately based on server context logic
                if (response.data.theme) setTheme(response.data.theme);

                toast.success(response.data.message);

                // Redirect to OTP verification page
                router.push({
                    pathname: "/auth/verify-otp",
                    query: {
                        userId: response.data.userId,
                        method: response.data.authMethod,
                        mockOTP: response.data.mockOTP // Only in dev
                    }
                });
            }
        } catch (error) {
            console.error("Login Initiate Error:", error);
            const errMsg = error.response?.data?.message || "Could not connect to the server. Please check your internet or NEXT_PUBLIC_BACKEND_URL.";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify OTP
    const verifyOTP = async (userId, otp) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/user/verify-otp", { userId, otp });
            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                login(response.data.result);
                toast.success("Login Successful!");
                router.push("/");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handlegooglesignin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const firebaseuser = result.user;
            const payload = {
                email: firebaseuser.email,
                name: firebaseuser.displayName,
                image: firebaseuser.photoURL || "https://tse2.mm.bing.net/th/id/OIP.9-uO9K5uFpERhAc8OShvlQHaFj?pid=Api&P=0&h=180",
            };
            // Now initiates OTP flow instead of direct login
            await initiateLogin(payload);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser) {
                    setUser(parsedUser);
                    if (parsedUser.themePreference) setTheme(parsedUser.themePreference);
                }
            } catch (error) {
                console.error("AuthContext Load Error:", error);
                localStorage.removeItem("user");
            }
        }

        const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
            // Note: Firebase session is separate from our OTP-verified session
            // For this specific task, we'll rely more on our proprietary JWT/OTP flow
        });
        return () => unsubcribe();
    }, []);

    return (
        <UserContext.Provider value={{
            user, setUser, login, logout,
            handlegooglesignin, initiateLogin, verifyOTP, loading
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);