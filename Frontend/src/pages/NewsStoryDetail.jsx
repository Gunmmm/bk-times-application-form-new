import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Phone, MapPin, Eye, Calendar, Share2, ArrowLeft } from 'lucide-react';

export default function NewsStoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/news/${id}`)
      .then(res => res.json())
      .then(data => {
        setStory(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!story) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <p className="text-gray-500 font-bold uppercase text-xl mb-4 tracking-tight">STORY NOT FOUND</p>
      <button onClick={() => navigate('/news-stories')} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl uppercase tracking-widest text-xs">Return to Feed</button>
    </div>
  );

  const emojiMap = {
    'Matrimonial': '❤️',
    'Vehicles': '🚗',
    'Property': '🏠',
    'PROMOTED': '📢'
  };

  const currentEmoji = emojiMap[story.category] || '📰';

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header showNav={false} />
      
      <main className="max-w-3xl mx-auto px-4 py-10">
        <button 
          onClick={() => navigate('/news-stories')}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-10 group transition"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Feed</span>
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4 border-b border-gray-50 pb-4">
            <span className="bg-blue-600 text-white text-[9px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
              {story.category || 'NEWS'}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              <Eye className="w-4 h-4 text-blue-300" /> 1,234 VIEWS
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-blue-300" /> PUBLISHED: {new Date(story.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
            {currentEmoji} {story.title}
          </h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> MAHARASHTRA DIVISION · VERIFIED AD REPORT
          </p>
        </div>

        {story.image && (
          <div className="mb-12">
            <img src={story.image} alt="Report Attached Photo" className="w-full rounded-xl border-b-8 border-blue-600 shadow-lg" />
            <p className="text-[9px] text-gray-400 mt-4 text-center font-bold uppercase tracking-widest opacity-60">© Ricotta News Portal: Official Publication Content</p>
          </div>
        )}

        <div className="bg-gray-50 p-10 rounded-xl border border-gray-100 mb-12 shadow-sm">
          <p className="text-lg font-bold text-gray-700 leading-relaxed tracking-tight border-l-4 border-blue-600 pl-8 overflow-hidden line-clamp-none">
            {story.content}
          </p>
        </div>

        {/* Action / Contact Card - BLUE BLUE */}
        <div className="bg-blue-50 border border-blue-100 p-10 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 mb-16 relative overflow-hidden">
          <div className="z-10 text-center md:text-left">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Advertiser Contact Details</p>
            <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">REPORTED BY: <span className="text-blue-700">{story.author || 'RNN VERIFIED'}</span></p>
            <p className="text-3xl font-bold tracking-tighter flex items-center justify-center md:justify-start gap-3 text-blue-800">
              <Phone className="w-6 h-6 text-blue-500" /> +91-700XXXXXXX
            </p>
            <p className="text-[10px] text-blue-400 mt-3 font-bold uppercase tracking-widest">Click below to reveal full number and initiate contact</p>
          </div>

          <button className="z-10 bg-blue-600 text-white font-bold px-12 py-5 rounded-xl shadow-lg hover:bg-blue-700 transition active:scale-95 text-xs uppercase tracking-widest">
            Contact Advertiser Now
          </button>
        </div>

        {/* Share Section - CLEAN */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-gray-100">
           <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition font-bold text-[9px] uppercase tracking-widest">
             <Share2 className="w-4 h-4" /> COPY STORY LINK
           </button>
           <div className="h-1 w-1 bg-gray-200 rounded-full hidden sm:block"></div>
           <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">STORY ID: {story._id}</p>
        </div>
      </main>

      <footer className="bg-gray-50 py-16 px-4 text-center mt-20 border-t border-gray-100">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.5em] px-10">RICOTTA NEWSPAPER NETWORK (RNN) - OFFICIAL PORTAL</p>
      </footer>
    </div>
  );
}
