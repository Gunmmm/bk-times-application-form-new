import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ReaderRegistration from '../components/ReaderRegistration';

export default function RegisterReader() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNav={true} />
      <div className="flex-1 overflow-y-auto pt-6 pb-20">
        <ReaderRegistration onComplete={() => navigate('/dashboard')} />
      </div>
    </div>
  );
}
