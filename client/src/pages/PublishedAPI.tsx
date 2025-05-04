import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface PublishedUrl {
  id: number;
  actual_url: string;
  published_url: string;
  custom_slug?: string;
  expiration_date?: string;
}

// Utility function to get base API URL
const getApiBaseUrl = () => {
    // For development, use hardcoded localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return window.location.origin;
  };

function PublishedAPI() {
  const [publishedUrls, setPublishedUrls] = useState<PublishedUrl[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPublishedUrls = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${getApiBaseUrl()}/url-shortener`);
        setPublishedUrls(response.data.data || []);
      } catch (error) {
        console.error("Error fetching published URLs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedUrls();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this URL?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${getApiBaseUrl()}/url-shortener/${id}`);
      setPublishedUrls((prev) => prev.filter((url) => url.id !== id));
    } catch (error) {
      console.error("Error deleting URL:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 flex flex-col items-center justify-start text-white px-4 py-8 relative">
      {/* Toggle Drawer Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 transition duration-300"
      >
        ☰
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-50 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ✖
          </button>
        </div>
        <div className="p-4 space-y-4">
          <button
            onClick={() => {
              navigate("/");
              setDrawerOpen(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-semibold mb-8 text-center">Published URLs</h1>

      {loading ? (
        <div className="text-gray-300">Loading...</div>
      ) : (
        <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedUrls.length > 0 ? (
            publishedUrls.map((url) => (
              <div
                key={url.id}
                className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-3 transition-all duration-300"
              >
                <p>
                  <strong>Short URL:</strong>{" "}
                  <a
                    href={url.published_url}
                    className="text-indigo-300 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {url.published_url}
                  </a>
                </p>

                <div className="text-sm bg-gray-700 p-2 rounded overflow-x-auto">
                  <strong>Actual URL:</strong>{" "}
                  <span className="break-words">{url.actual_url}</span>
                </div>

                <p className="text-sm">
                  <strong>{url.custom_slug ? "Custom Slug" : "Random Generated Slug"}:</strong>{" "}
                  {url.custom_slug ?? (
                    <span className="italic text-gray-300">[Auto-generated]</span>
                  )}
                </p>

                {url.expiration_date && (
                  <p className="text-sm">
                    <strong>Expiration:</strong>{" "}
                    {new Date(url.expiration_date).toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => handleDelete(url.id)}
                  className="mt-3 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded transition"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center min-h-[600px] text-center text-gray-300">
              No published URLs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PublishedAPI;