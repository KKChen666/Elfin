import { Relative, getRelationLabel } from '../../types';
import AvatarPreview from './AvatarPreview';
import { getDaysUntilBirthday } from '../../utils/dateUtils';

interface AvatarCardProps {
  relative: Relative;
}

export default function AvatarCard({ relative }: AvatarCardProps) {
  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="w-20 h-20 md:w-24 md:h-24 mb-2 relative">
        {relative.avatarImage ? (
          <div className="w-full h-full rounded-full overflow-hidden border-[2.5px] border-[#FFD1A9]"
            style={{ boxShadow: '0 3px 10px rgba(232,115,74,0.12)' }}>
            <img
              src={relative.avatarImage}
              alt={relative.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-full overflow-hidden border-[2.5px] border-[#FFD1A9]"
            style={{ boxShadow: '0 3px 10px rgba(232,115,74,0.12)' }}>
            <AvatarPreview avatar={relative.avatar} size={80} />
          </div>
        )}
        {relative.zodiac && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-br from-[#E8734A] to-[#F09060] text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ boxShadow: '0 2px 4px rgba(232,115,74,0.3)' }}>
            {relative.zodiac}
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm text-[#3D2E22] truncate w-full text-center">{relative.name}</h3>
      <p className="text-[11px] text-[#C0A898] font-medium">{getRelationLabel(relative.relation)}</p>
      {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
        <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          daysUntilBirthday <= 3
            ? 'bg-[#FFE0D0] text-[#E8734A]'
            : daysUntilBirthday <= 7
              ? 'bg-[#FFF0D0] text-[#D4A017]'
              : 'bg-[#D5F5E3] text-[#27AE60]'
        }`}>
          {daysUntilBirthday === 0 ? '🎂 今天生日!' : `🎂 ${daysUntilBirthday}天`}
        </div>
      )}
    </div>
  );
}
