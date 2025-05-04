import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

interface Props {
  actualUrl: string;
  publishedUrl: string;
  customSlug?: string;
  expiration?: string;
  onPublishSuccess?: () => void;
}

interface SaveResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

interface UrlEntry {
  id: number;
  actual_url: string;
  published_url: string;
  custom_slug: string;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
}

function Modal({ message, onClose }: { message: string; onClose: () => void }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 text-white rounded-lg p-8 max-w-sm w-full shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-400">
          {message.includes("success") ? "Success!" : "Error"}
        </h2>
        <p className="mb-6 text-gray-300">{message}</p>
        <button
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}

function ShortenedResult({
  actualUrl,
  publishedUrl,
  customSlug,
  expiration,
  onPublishSuccess,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<SaveResponse | null>(null);
  const [shortUrl, setShortUrl] = useState("");

  const handleCopy = async () => {
    const urlToCopy = shortUrl || publishedUrl;
    if (!urlToCopy) return;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishStatus(null);

    try {
      if (!actualUrl || !publishedUrl) {
        throw new Error("Both actual and published URLs are required");
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

      // 1. Fetch all existing entries to check for duplicate custom_slug
      const existingResponse = await axios.get(
        `${getApiBaseUrl()}/url-shortener`
      );
      const existingData: UrlEntry[] = existingResponse.data?.data || [];

      if (customSlug) {
        const isDuplicate = existingData.some(
          (entry: UrlEntry) => entry.custom_slug === customSlug
        );

        if (isDuplicate) {
          setPublishStatus({
            success: false,
            message: `The custom slug "${customSlug}" already exists. Please choose a different one.`,
          });
          return;
        }
      }

      // 2. Proceed with POST only if slug is unique or not provided
      const response = await axios.post(`${getApiBaseUrl()}/url-shortener`, {
        actual_url: actualUrl,
        published_url: publishedUrl,
        custom_slug: customSlug || null,
        expiration_date: expiration || null,
      });

      if (response.data.success) {
        const data = response.data.data;

        if (data?.custom_slug) {
          setShortUrl(`${window.location.origin}/${data.custom_slug}`);
        }

        setPublishStatus({
          success: true,
          message: "Your URL was successfully published!",
          data: data,
        });
      } else {
        throw new Error(response.data.message || "Failed to publish URL");
      }
    } catch (error: unknown) {
      let message = "Failed to publish URL";

      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error === "Custom slug already exists"
      ) {
        const existing = error.response.data.existing_entry;
        message = `The custom slug already exists.\n\nSlug: ${existing.custom_slug}\nPublished URL: ${existing.published_url}\nActual URL: ${existing.actual_url}`;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setPublishStatus({
        success: false,
        message,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const closeModal = () => {
    const wasSuccessful = publishStatus?.success;
    setPublishStatus(null);
    if (wasSuccessful) {
      onPublishSuccess?.();
    }
  };

  return (
    <div className="relative h-full bg-gray-900 text-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center text-center space-y-6">
      {publishStatus && (
        <Modal message={publishStatus.message} onClose={closeModal} />
      )}

      {isPublishing && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-lg text-white">Publishing your URL...</p>
          </div>
        </div>
      )}
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
      <div className="space-y-6 w-full">
        <div className="text-sm bg-gray-700 p-4 rounded overflow-y-auto max-h-[200px]">
          <p className="mb-2">
            <strong className="text-gray-200">Actual URL:</strong>{" "}
            <a
              href={actualUrl}
              className="underline text-indigo-400 hover:text-indigo-500 break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {actualUrl}
            </a>
          </p>
          <p className="mb-2">
            <strong className="text-gray-200">Short URL:</strong>{" "}
            <p>
              {publishedUrl}
            </p>
          </p>
          {shortUrl && (
            <p className="mb-2">
              <span className="text-green-400">Success</span>
            </p>
          )}
          {expiration && (
            <p>
              <strong className="text-gray-200">Expires:</strong>{" "}
              <span>{new Date(expiration).toLocaleString()}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {(shortUrl || publishedUrl) && (
            <button
              disabled={copied}
              onClick={handleCopy}
              className={`w-full sm:w-auto bg-green-600 text-white py-3 px-6 rounded-lg shadow-md transition-all 
                ${
                  copied
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-700"
                }`}
            >
              {copied ? "Copied!" : "Copy Short URL"}
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full sm:w-auto bg-indigo-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
          >
            {isPublishing ? "Publishing..." : "Publish URL"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShortenedResult;
