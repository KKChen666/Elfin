import { Relative, getRelationLabel } from '../../types';
import AvatarPreview from './AvatarPreview';
import { getDaysUntilBirthday } from '../../utils/dateUtils';

interface AvatarCardProps {
  relative: Relative;
}

export default function AvatarCard({ relative }: AvatarCardProps) {
  const daysUntilBirthday = getDaysUntilBirthday(relative.birthday, relative.isLunar);

  return (
    <div className="flex flex-col items-center p-3 text-center">
      <div className="relative mb-3 h-24 w-24">
        <div className="h-full w-full overflow-hidden rounded-[30px] border border-black/5 bg-[#f5f5f7]">
          {relative.avatarImage ? (
            <img src={relative.avatarImage} alt={relative.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <AvatarPreview avatar={relative.avatar} size={96} />
            </div>
          )}
        </div>
        {relative.zodiac && (
          <div className="absolute -bottom-1 -right-1 rounded-full border border-white bg-[#1d1d1f] px-2 py-1 text-[10px] font-medium text-white">
            {relative.zodiac}
          </div>
        )}
      </div>
      <h3 className="w-full truncate text-[15px] font-semibold text-[#1d1d1f]">{relative.name}</h3>
      <p className="mt-0.5 text-xs text-[#7a7a7a]">{getRelationLabel(relative.relation)}</p>
      {daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
        <div
          className={`mt-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            daysUntilBirthday <= 3
              ? 'bg-[#fff0f0] text-[#ff3b30]'
              : daysUntilBirthday <= 7
                ? 'bg-[#fff6e5] text-[#b36b00]'
                : 'bg-[#eef8f1] text-[#248a3d]'
          }`}
        >
          {daysUntilBirthday === 0 ? '今天生日' : `${daysUntilBirthday} 天后`}
        </div>
      )}
    </div>
  );
}
