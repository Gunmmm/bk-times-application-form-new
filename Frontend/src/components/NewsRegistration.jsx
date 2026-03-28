import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function NewsRegistration({ onComplete }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    author: 'Admin',
    image: ''
  });

  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!resp.ok) throw new Error('Submission failed');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onComplete();
      }, 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-12 text-center rounded-[1.5rem] shadow-2xl border border-gray-100">
        <div className="text-5xl mb-4 text-green-500">✅</div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">News Published!</h2>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1 italic">Interconnected Content Live</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 pb-12 w-full max-w-sm rounded-[1.5rem] shadow-2xl border border-gray-100 font-sans">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          📰
        </div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">Post New News</h2>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Global/Local News Desk</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Article Title*</label>
          <input
            required
            type="text"
            placeholder="Headline of the story"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Category*</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm font-medium appearance-none"
          >
            {['General', 'Politics', 'Sports', 'Crime', 'Local', 'Techno'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Content (Story)*</label>
          <textarea
            required
            rows="5"
            placeholder="Write the full news story here..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm font-medium resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Cover Image URL</label>
          <input
            type="url"
            placeholder="https://..."
            value={form.image}
            onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95 disabled:bg-gray-300 text-sm uppercase tracking-widest mt-2"
        >
          {loading ? 'Publishing...' : 'Publish Update'}
        </button>
      </form>
    </div>
  );
}
