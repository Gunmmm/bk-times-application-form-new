import React, { useEffect, useState } from 'react';
import DetailPageWrapper from '../components/DetailPageWrapper';
import { useAuth } from '../hooks/useAuth';
import ReaderRegistration from '../components/ReaderRegistration';

export default function StatsReaders() {
  const { token } = useAuth();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [editingReader, setEditingReader] = useState(null);

  const fetchReaders = () => {
    if (!token) return;
    fetch('/api/readers', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setReaders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReaders();
  }, [token]);

  const filtered = readers.filter((r) => {
    const name = r.personal?.fullName || r.fullName || '';
    const email = r.personal?.email || r.email || '';
    const term = search.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
  });

  return (
    <DetailPageWrapper
      title="Total Registered Subscribers"
      subtitle={`${readers.length} subscriber${readers.length !== 1 ? 's' : ''} registered`}
    >
      {/* Search */}
      <div className="mb-4 mt-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading subscribers...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">No subscribers found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((reader, i) => {
            const fullName = reader.personal?.fullName || reader.fullName || 'N/A';
            const email    = reader.personal?.email    || reader.email    || '—';
            const phone    = reader.personal?.phone    || reader.phone    || '—';
            const planStr  = reader.personal?.plan     || reader.plan     || '—';
            const village  = reader.personal?.village  || '';
            const district = reader.personal?.district || '';
            const location = [village, district].filter(Boolean).join(', ') || '—';

            let yearsToAdd = 1;
            if (planStr.includes('2 Year')) yearsToAdd = 2;
            if (planStr.includes('3 Year')) yearsToAdd = 3;
            const joinDate   = reader.createdAt ? new Date(reader.createdAt) : null;
            const expiryDate = joinDate ? new Date(joinDate) : null;
            if (expiryDate) expiryDate.setFullYear(expiryDate.getFullYear() + yearsToAdd);

            const isExpired = expiryDate ? new Date() > expiryDate : false;
            const isOpen    = openId === reader._id;

            return (
              <div
                key={reader._id}
                className={`bg-white rounded-xl border ${isExpired ? 'border-red-200' : 'border-gray-200'} shadow-sm overflow-hidden transition-all`}
              >
                {/* Collapsed Row — always visible, click to toggle */}
                <button
                  onClick={() => setOpenId(isOpen ? null : reader._id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-6 flex-shrink-0">{i + 1}</span>
                    <span className="font-semibold text-gray-800 text-sm">{fullName}</span>
                    <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-lg font-light">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Expanded Details */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Email</span>
                      <p className="text-gray-700">{email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Phone</span>
                      <p className="text-gray-700">{phone}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Plan</span>
                      <p className="text-blue-600 font-medium">{planStr}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Location</span>
                      <p className="text-gray-700">{location}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Join Date</span>
                      <p className="text-gray-700">{joinDate ? joinDate.toLocaleDateString('en-IN') : '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-medium">Expiry Date</span>
                      <p className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                        {expiryDate ? expiryDate.toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2 mt-2 flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                      {!isExpired && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingReader(reader); }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button className="text-green-600 hover:text-green-800 text-xs font-medium bg-green-50 px-3 py-1 rounded">SMS</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="mt-4 text-sm text-gray-500 font-medium">
            Showing {filtered.length} of {readers.length} subscribers
          </div>
        </div>
      )}
      {editingReader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-[380px] my-auto">
            <button
              onClick={() => setEditingReader(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 font-bold text-xl transition-all"
            >
              Close ✕
            </button>
            <div className="max-h-[85vh] overflow-y-auto rounded-[1rem] shadow-2xl">
              <ReaderRegistration 
                onComplete={() => { setEditingReader(null); fetchReaders(); }} 
                initialData={editingReader} 
              />
            </div>
          </div>
        </div>
      )}
    </DetailPageWrapper>
  );
}
