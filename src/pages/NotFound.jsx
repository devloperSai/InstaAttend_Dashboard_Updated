import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
        <h1 className="text-6xl sm:text-7xl font-bold text-attendo-400 mb-2">404</h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-6">Page Not Found</p>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button className="bg-attendo-500 hover:bg-attendo-600">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
