import React from 'react';
import { User } from 'lucide-react';

interface ProfilePictureProps {
  user: {
    fullName: string;
    profileImage?: string;
    profileColor?: string;
    profileInitials?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({ 
  user, 
  size = 'md', 
  className = '',
  showFallback = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  if (user.profileImage && user.profileImage.startsWith('http')) {
    return (
      <img
        src={user.profileImage}
        alt={user.fullName}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-lg ${className}`}
        onError={(e) => {
          if (showFallback) {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-lg border-2 border-white ${user.profileColor || 'bg-gradient-to-br from-purple-500 to-indigo-500'} ${className}`}>
      {user.profileInitials || user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};

export default ProfilePicture;