import { Relative, getRelationLabel } from '../../types';
import AvatarPreview from './AvatarPreview';
import { getDaysUntilBirthday } from '../../utils/dateUtils';

interface AvatarCardProps {
  relative: Relative;
}

export default function AvatarCard({ relative }: AvatarCardProps) {
  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  return (
    <div className="flex flex-col items-center p-2 hover:scale-[1.02] transition-transform">
      <div className="w-20 h-20 md:w-24 md:h-24 mb-2 relative">
        {relative.avatarImage ? (
          <img
            src={relative.avatarImage}
            alt={relative.name}
            className="w-full h-full rounded-full object-cover border-2 border-[#E8734A]"
          />
        ) : (
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#FFD1A9]"
            style={{ boxShadow: '0 3px 10px rgba(232,115,74,0.12)' }}>
            <AvatarPreview avatar={relative.avatar} size={80} />
          </div>
        )}
        {relative.zodiac && (
          <div className="absolute -bottom-1 -right-1 bg-[#E8734A] text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {relative.zodiac}
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm text-[#2D2A26] truncate w-full text-center">{relative.name}</h3>
      <p className="text-xs text-gray-400">{getRelationLabel(relative.relation)}</p>
      {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
        <p className="text-[10px] text-[#E8734A] mt-0.5 font-medium">
          {daysUntilBirthday === 0 ? '🎂 今天生日' : `🎂 ${daysUntilBirthday}天后生日`}
        </p>
      )}
    </div>
  );
}
