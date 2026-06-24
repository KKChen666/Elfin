import { Relative, getRelationLabel } from '../../types';
import AvatarPreview from './AvatarPreview';
import { getDaysUntilBirthday } from '../../utils/dateUtils';

interface AvatarCardProps {
  relative: Relative;
}

export default function AvatarCard({ relative }: AvatarCardProps) {
  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow aspect-square flex flex-col items-center justify-center">
      <div className="w-16 h-16 mb-2">
        {relative.avatarImage ? (
          <img 
            src={relative.avatarImage} 
            alt={relative.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#E8734A]"
          />
        ) : (
          <AvatarPreview avatar={relative.avatar} size={64} />
        )}
      </div>
      <h3 className="font-semibold text-sm text-[#2D2A26] truncate w-full text-center">{relative.name}</h3>
      <p className="text-xs text-gray-500">{getRelationLabel(relative.relation)}</p>
      {relative.zodiac && (
        <p className="text-xs text-[#E8734A] mt-0.5">{relative.zodiac}</p>
      )}
      {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
        <p className="text-xs text-[#E8734A] mt-1">
          {daysUntilBirthday === 0 ? '今天生日' : `${daysUntilBirthday}天后生日`}
        </p>
      )}
    </div>
  );
}
