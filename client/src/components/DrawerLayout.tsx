import { Link, Outlet, useLocation } from "react-router-dom";

function DrawerLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen text-white">
      <aside className="w-64 bg-gray-900 p-6 space-y-6">
        <h2 className="text-2xl font-bold text-indigo-400 mb-8">URL Shortener</h2>

        <nav className="flex flex-col space-y-4">
          <Link
            to="/"
            className={`hover:text-indigo-400 ${
              location.pathname === "/" ? "text-indigo-500 font-bold" : "text-white"
            }`}
          >
            🏠 Home
          </Link>
          <Link
            to="/published"
            className={`hover:text-indigo-400 ${
              location.pathname === "/published" ? "text-indigo-500 font-bold" : "text-white"
            }`}
          >
            🔗 Published URLs
          </Link>
        </nav>
      </aside>

      <main className="flex-1 bg-gradient-to-r from-blue-900 to-blue-500 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default DrawerLayout;
