import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UrlForm from "../components/UrlForm";
import ShortenedResult from "../components/ShortenedUrl";

function HomePage() {
  const [shortenedData, setShortenedData] = useState<{
    finalUrl: string;
    shortUrl: string;
    customSlug?: string;
    expiration?: string;
  } | null>(null);
  const [resetKey, setResetKey] = useState(Date.now());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleShorten = ({
    finalUrl,
    shortUrl,
    customSlug,
    expiration,
  }: {
    finalUrl: string;
    shortUrl: string;
    customSlug?: string;
    expiration?: string;
  }) => {
    setShortenedData({
      finalUrl,
      shortUrl,
      customSlug,
      expiration
    });
  };

  const handlePublishSuccess = () => {
    setResetKey(Date.now());
    setShortenedData(null);
  };

  return (
    <div
      key={resetKey}
      className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-500 flex flex-col items-center justify-center text-white px-4 py-8 relative"
    
    >
      {/* Toggle Button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="absolute top-4 left-4 bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 transform transition-transform duration-300 ease-in-out"
      >
        ☰
      </button>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg transform transition-all duration-300 ease-in-out z-50 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-white transform transition-transform duration-200"
          >
            ✖
          </button>
        </div>
        <div className="p-4">
          <button
            onClick={() => {
              navigate("/published");
              setDrawerOpen(false);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transform transition-all duration-200 ease-in-out"
          >
            View Published URLs
          </button>
        </div>
      </div>

      {/* Page Content */}
      <h1 className="text-4xl font-semibold mb-8 text-center text-white transform transition-transform duration-300 ease-in-out">
        URL Shortener
      </h1>

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 p-6 bg-gray-800 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out">
          <UrlForm onShorten={handleShorten} resetKey={resetKey} />
        </div>

        <div className="w-full md:w-1/2">
          {shortenedData ? (
            <ShortenedResult
              publishedUrl={shortenedData.shortUrl}
              actualUrl={shortenedData.finalUrl}
              customSlug={shortenedData.customSlug}
              expiration={shortenedData.expiration}
              onPublishSuccess={handlePublishSuccess}
            />
          ) : (
            <div className="h-full bg-gray-800 text-white p-6 rounded-lg shadow-lg flex items-center justify-center transform transition-all duration-300 ease-in-out">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-300">
                  Your shortened URL will appear here
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Enter a URL and click "Shorten" to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;