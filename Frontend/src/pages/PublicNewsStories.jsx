import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Newspaper, ChevronRight, Share2, Eye, Tag, Clock, ArrowLeft } from 'lucide-react';

export default function PublicNewsStories() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    fetch('/api/public/news')
      .then(res => res.json())
      .then(data => {
        setNews(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const matrimonial = news.filter(n => n.title.toLowerCase().includes('matrimonial') || n.category === 'PROMOTED');
  const vehicles = news.filter(n => n.title.toLowerCase().includes('vehicle') || n.title.toLowerCase().includes('swift'));
  const property = news.filter(n => n.title.toLowerCase().includes('property') || n.title.toLowerCase().includes('rent') || n.title.toLowerCase().includes('sale'));
  const others = news.filter(n => !matrimonial.includes(n) && !vehicles.includes(n) && !property.includes(n));

  const CategorySection = ({ title, stories }) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-100">
        <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800">
          {title} <span className="text-blue-600 block sm:inline">({stories.length} Entries)</span>
        </h2>
        <div className="h-1 flex-1 mx-6 bg-gray-50 rounded-full"></div>
      </div>
      
      {stories.length === 0 ? (
        <p className="text-gray-400 text-sm py-4 pl-4 border-l-2 border-gray-100">No records available for this section.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map(s => (
            <div 
              key={s._id} 
              onClick={() => setSelectedStory(s)}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${s.category === 'PROMOTED' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {s.category || 'NEWS'}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <Clock className="w-3 h-3 text-blue-400" /> {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-800 leading-tight mb-3 tracking-tight">{s.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6">{s.content.substring(0, 100)}...</p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">DETAILS</div>
                </div>
                <div className="flex items-center text-blue-600 font-bold text-[10px] uppercase tracking-widest">
                  READ STORY <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNav={false} />
      
      {/* Formal Header with Back Button */}
      <div className="bg-white border-b border-gray-100 py-12 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-100 transition shadow-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">OFFICIAL NEWS FEED</h1>
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.4em] mt-0.5">RICOTTA REPORTER NETWORK</p>
            </div>
          </div>
          <div className="h-12 w-[1px] bg-gray-100 hidden md:block"></div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-6 py-2 rounded-full border border-gray-100 shadow-inner">RNN LIVE ARCHIVE</p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <CategorySection title="Matrimonial Stories" stories={matrimonial} />
            <CategorySection title="Vehicles Stories" stories={vehicles} />
            <CategorySection title="Property Stories" stories={property} />
            <CategorySection title="News Feed" stories={others} />
          </>
        )}
      </main>

      {/* Formal Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedStory(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-bold transition z-10 shadow-sm"
            >✕</button>

            <div className="max-h-[85vh] overflow-y-auto">
              {selectedStory.image && (
                <img src={selectedStory.image} alt="Official Photo" className="w-full h-80 object-cover border-b-2 border-blue-600" />
              )}
              <div className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">{selectedStory.category || 'VERIFIED AD'}</span>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" /> {new Date(selectedStory.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">"{selectedStory.title}"</h2>
                
                <div className="bg-gray-50 border-l-4 border-blue-600 p-8 rounded-xl mb-10">
                  <p className="text-lg font-bold text-gray-700 leading-relaxed tracking-tight">
                    {selectedStory.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                   <button onClick={() => navigate(`/news-story/${selectedStory._id}`)} className="bg-blue-600 text-white font-bold px-10 py-3.5 rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 text-xs uppercase tracking-widest">
                    View Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-12 text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.6em]">RICOTTA NEWSPAPER NETWORK (RNN)</p>
      </footer>
    </div>
  );
}
