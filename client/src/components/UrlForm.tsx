import { useState, useEffect, FormEvent } from "react";
import { isValidUrl, generateSlug } from "../utils/helpers";

interface Props {
  onShorten: (data: {
    finalUrl: string;
    shortUrl: string;
    expiration?: string;
    customSlug?: string;
  }) => void;
  resetKey?: number;
}

function UrlForm({ onShorten, resetKey }: Props) {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [expiration, setExpiration] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUrl("");
    setSlug("");
    setExpiration("");
    setError("");
  }, [resetKey]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!isValidUrl(url)) {
      setError("Invalid URL format.");
      return;
    }

    if (slug && slug.length !== 8) {
      setError("Custom slug must be exactly 8 characters long.");
      return;
    }

    const getApiBaseUrl = () => {
      if (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ) {
        return "http://localhost:8000";
      }
      return window.location.origin;
    };

    const customSlug = slug || generateSlug();
    const base = getApiBaseUrl();
    const shortUrl = `${base}/${customSlug}`;

    onShorten({
      finalUrl: url,
      shortUrl,
      customSlug: slug || undefined,
      expiration: expiration || undefined,
    });

    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="url" className="text-sm">
          Enter your long URL
        </label>
        <input
          id="url"
          type="url"
          placeholder="Enter long URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="p-3 w-full rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm">
          Custom Slug (optional, exactly 8 characters)
        </label>
        <input
          id="slug"
          type="text"
          placeholder="Enter custom slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="p-3 w-full rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="expiration" className="text-sm">
          Expiration Date (optional)
        </label>
        <input
          id="expiration"
          type="datetime-local"
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="p-3 w-full rounded-lg bg-gray-700 text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Shorten URL
      </button>
    </form>
  );
}

export default UrlForm;
