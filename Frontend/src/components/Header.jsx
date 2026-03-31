import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn } from 'lucide-react';

/**
 * Shared Header for all pages.
 * Top bar: BK Times logo composite (logo.png + icon2.png pen icon).
 * Bottom strip: Nav bar with user info + action links.
 * Props:
 *   - showNav: bool (default true) - show/hide the bottom nav strip
 */
export default function Header({ showNav = true }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">

      {/* ── TOP LOGO BAR ── */}
      <div className="w-full bg-white flex flex-col items-center justify-center p-3 sm:p-5">
        <p className="text-[10px] font-black text-navy uppercase tracking-[0.2em] opacity-40">Official News Network Portal</p>
      </div>

      {/* ── BOTTOM NAV STRIP ── */}
      {showNav && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2">
          {/* Left: identity */}
          <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest text-center sm:text-left flex items-center gap-2">
            <span>{user?.role === 'admin' ? '👑 Master Admin Panel' : 
                   (user?.role === 'zone' || user?.role === 'zone_coordinator') ? '🗺️ Regional Coordinator Panel' :
                   user?.role === 'district' ? '🏛️ District Coordinator Panel' :
                   user?.role === 'taluka' ? '🏛️ Taluka Coordinator Panel' :
                   user?.role === 'village' ? '🏘️ Village Coordinator Panel' : 
                   user?.role ? `👤 ${user?.role.toUpperCase()} Panel` : 'Guest Panel'}</span>
          </span>

          {/* Right: actions */}
          <div className="flex items-center justify-center gap-4 sm:gap-3 flex-wrap">
            <button
              onClick={logout}
              className="text-[11px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
