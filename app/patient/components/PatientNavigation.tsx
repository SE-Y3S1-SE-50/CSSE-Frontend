"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellDot, Check, Plus } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type UserResponse = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdTimestamp: string;
  entityType?: string;
  entityId?: string;
}

interface CustomerNavigationProps {
  user?: UserResponse;
  setActiveTab?: (tab: string) => void;
}

const PatientNavigation = ({ user, setActiveTab }: CustomerNavigationProps) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);




  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      Loading...
    </div>
  );

  return (
    <div className="fixed w-[100vw] top-0 z-[9999]">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-8 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📦</span>
              <h1 className="text-3xl font-bold text-white">Sparrow</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            

            

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.firstName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button 
                    onClick={() => {
                      setActiveTab && setActiveTab('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full cursor-pointer px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    Profile Settings
                  </button>
                  
                  <div className="border-t border-gray-700 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full cursor-pointer px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default PatientNavigation;