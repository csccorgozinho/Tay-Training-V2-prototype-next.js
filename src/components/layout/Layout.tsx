import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Drawer from "./Drawer";
import LoadingBar from "./LoadingBar";

interface LayoutProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
  transparent?: boolean;
}

// CLEANUP: Extracted authenticated route list to constant for maintainability
const AUTHENTICATED_ROUTES = [
  "/home", 
  "/exercises", 
  "/methods", 
  "/workout-sheets", 
  "/training-schedule"
] as const;

export const Layout = ({ children, hideNavbar = false, transparent = false }: LayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  // CLEANUP: Simplified authentication detection - now just checks if current route is protected
  const isAuthenticated = AUTHENTICATED_ROUTES.some(route => router.asPath.startsWith(route));

  const toggleDrawer = (): void => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      <LoadingBar />
      {!hideNavbar && (
        <Navbar 
          toggleDrawer={toggleDrawer} 
          isAuthenticated={isAuthenticated} 
          transparent={transparent}
        />
      )}
      
      {isAuthenticated && (
        <Drawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
        />
      )}
      
      <main className={`flex-1 w-full flex flex-col items-center ${!hideNavbar ? "pt-16" : ""}`}>
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
