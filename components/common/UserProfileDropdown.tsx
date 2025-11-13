import React from 'react';
import { Profile as User } from '../../types';
import { ProfileIcon, LogoutIcon } from '../../constants';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

interface UserProfileDropdownProps {
  user: User;
  onLogout: () => void;
  onProfileClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user, onLogout, onProfileClick, theme, toggleTheme }) => {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost flex items-center gap-3 p-1.5 h-auto">
        <div className="avatar">
          <div className="w-9 rounded-full">
            <img alt="User Avatar" src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`} />
          </div>
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="font-semibold text-sm leading-tight">{user.name}</span>
          <span className="text-xs opacity-70 -mt-1">{user.role}</span>
        </div>
      </div>
      <div tabIndex={0} className="dropdown-content z-[50] p-4 shadow-2xl bg-base-200 rounded-box w-72 mt-3">
        <div className="text-center border-b border-base-300 pb-3 mb-2">
           <div className="avatar online mx-auto mb-2">
              <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img alt="User Avatar" src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`} />
              </div>
            </div>
            <p className="font-bold text-lg">{user.name}</p>
            <p className="text-xs text-base-content/70">{user.email}</p>
        </div>
        
        <ul className="menu menu-sm p-0">
          <li>
            <a onClick={onProfileClick}>
              <ProfileIcon className="w-4 h-4" />
              Profile Settings
            </a>
          </li>
          <li>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="flex items-center gap-2">
                {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                Theme
              </span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={theme === 'dark'} 
                onChange={toggleTheme} 
                aria-label="Toggle theme"
              />
            </label>
          </li>
          <li><hr className="my-1 border-base-300" /></li>
          <li>
            <a onClick={onLogout} className="text-error hover:bg-error/10">
              <LogoutIcon className="w-4 h-4" />
              Logout
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileDropdown;