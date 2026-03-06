import Header from "@/components/ui/Header";
import Sidebar from "@/components/Sidebar";
import CallListener from "@/components/voip/CallListener";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import { ThemeProvider } from "../lib/ThemeContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="min-h-screen transition-colors duration-300">
          <title>Your-Tube Clone</title>
          <Header />
          <Toaster />
          <CallListener />
          <div className="flex">
            <Sidebar />
            <div className="flex-1">
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}