import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

interface FetchStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  count?: number;
}

export const AdminDataFetcher: React.FC = () => {
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>({ status: 'idle', message: '' });
  const [showPanel, setShowPanel] = useState(false);

  const handleFetchRealData = async () => {
    setFetchStatus({ status: 'loading', message: 'Fetching real politician data...' });
    try {
      const response = await fetch('/api/fetch-real-data');
      const data = await response.json();

      if (data.success) {
        setFetchStatus({
          status: 'success',
          message: `✓ Successfully loaded ${data.count} politicians with real photos!`,
          count: data.count
        });
        // Reload politicians
        window.location.reload();
      } else {
        setFetchStatus({ status: 'error', message: `Error: ${data.error}` });
      }
    } catch (error) {
      setFetchStatus({ status: 'error', message: `Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all"
        title="Admin Data Fetcher"
      >
        <Download size={20} />
      </button>

      {/* Admin Panel */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-xl p-4 w-80 border border-blue-200">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-1 text-gray-800 flex items-center gap-2">
              <span>🇮🇳</span> Real Politician Data
            </h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Automatically fetch real Indian politician data with accurate Wikipedia photos, party affiliations, and state information.
            </p>

            <button
              onClick={handleFetchRealData}
              disabled={fetchStatus.status === 'loading'}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              {fetchStatus.status === 'loading' ? 'Loading...' : 'Fetch Real Data'}
            </button>
          </div>

          {/* Status Message */}
          {fetchStatus.message && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                fetchStatus.status === 'success'
                  ? 'bg-green-50 text-green-800'
                  : fetchStatus.status === 'error'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
              }`}
            >
              {fetchStatus.status === 'success' ? (
                <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
              ) : fetchStatus.status === 'error' ? (
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              ) : null}
              <span>{fetchStatus.message}</span>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-700 bg-white p-3 rounded-lg border border-blue-100">
            <strong className="block mb-1 text-blue-900">✓ Database Features:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-gray-700">
              <li>6 Real Indian Politicians</li>
              <li>Wikipedia Official Photos</li>
              <li>Party & State Data</li>
              <li>Auto-Sync to Backend</li>
              <li>Instant UI Update</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
