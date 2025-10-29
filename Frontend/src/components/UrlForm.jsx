import axios from "axios";
import React, { useState } from "react";
import {toast} from 'react-hot-toast';
import { createShorturl } from "../apis/shorturlapi";

const UrlForm = () => {
  const [url, setUrl] = useState("https://google.com");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");
    if (!url || !url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await createShorturl(url);
      const received =
        data?.shorturl ||
        data?.shortUrl ||
        (data?.shortCode ? `http://localhost:8000/${data.shortCode}` : null) ||
        null;
      if (!received) {
        throw new Error("Unexpected response from server");
      }
      setShortUrl(received);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          err.message ||
          "Failed to shorten URL"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);     
      toast.success("Copied Successfully!");
    } catch {
      setError("Copy failed. Please copy manually.");
    }
  };

  const handleOpen = () => {
    if (!shortUrl) return;
    window.open(shortUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-2xl p-6 md:p-8 flex flex-col gap-4">
      <h2 className="text-lg md:text-2xl font-semibold text-center">Shorten your URL</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="url" className="sr-only">URL</label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL (e.g. https://example.com)"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="URL to shorten"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Shortening…" : "Shorten"}
        </button>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>}

      {shortUrl && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-md">
          <p className="text-sm text-gray-500 mb-1">Your short URL</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-medium break-words hover:underline"
            >
              {shortUrl}
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={handleOpen}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-2">
        Tip: You can paste URLs with or without <code>http/https</code>.
      </p>
    </form>
  );
};

export default UrlForm;
