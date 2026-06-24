import { Relative, getRelationLabel } from '../../types';
import AvatarPreview from './AvatarPreview';
import { getDaysUntilBirthday } from '../../utils/dateUtils';

interface AvatarCardProps {
  relative: Relative;
}

export default function AvatarCard({ relative }: AvatarCardProps) {
  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  return (
    <div className="flex flex-col items-center p-2 hover:scale-105 transition-transform">
      <div className="w-24 h-24 mb-2 relative">
        {relative.avatarImage ? (
          <img 
            src={relative.avatarImage} 
            alt={relative.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#E8734A] shadow-lg"
          />
        ) : (
          <AvatarPreview avatar={relative.avatar} size={96} />
        )}
        {relative.zodiac && (
          <div className="absolute -bottom-1 -right-1 bg-[#E8734A] text-white text-xs px-2 py-1 rounded-full shadow-md">
            {relative.zodiac}
          </div>
        )}
      </div>
      <h3 className="font-bold text-base text-[#2D2A26] truncate w-full text-center">{relative.name}</h3>
      <p className="text-sm text-gray-500">{getRelationLabel(relative.relation)}</p>
      {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
        <p className="text-xs text-[#E8734A] mt-1 font-medium">
          {daysUntilBirthday === 0 ? '🎂 今天生日' : `🎂 ${daysUntilBirthday}天后生日`}
        </p>
      )}
    </div>
  );
}
