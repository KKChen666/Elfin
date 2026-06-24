import { AvatarConfig } from '../../types';

interface AvatarPreviewProps {
  avatar: AvatarConfig;
  size?: number;
}

const FACE_SHAPES = [
  (color: string) => <circle cx="50" cy="50" r="40" fill={color} />,
  (color: string) => <ellipse cx="50" cy="50" rx="38" ry="42" fill={color} />,
  (color: string) => <rect x="12" y="10" width="76" height="80" rx="20" fill={color} />,
  (color: string) => <circle cx="50" cy="48" r="38" fill={color} />,
  (color: string) => <ellipse cx="50" cy="52" rx="36" ry="40" fill={color} />,
  (color: string) => <path d="M50 10 C80 10 90 40 90 55 C90 80 70 90 50 90 C30 90 10 80 10 55 C10 40 20 10 50 10Z" fill={color} />
];

const HAIRSTYLES = [
  (color: string) => <path d="M15 45 C15 20 85 20 85 45 L85 35 C85 15 15 15 15 35Z" fill={color} />,
  (color: string) => <><path d="M12 50 C12 20 88 20 88 50 L88 30 C88 10 12 10 12 30Z" fill={color} /><path d="M20 50 L15 70 L25 65Z" fill={color} /><path d="M80 50 L85 70 L75 65Z" fill={color} /></>,
  (color: string) => <path d="M20 45 C20 25 80 25 80 45 L80 30 Q50 5 20 30Z" fill={color} />,
  (color: string) => <><path d="M15 50 C15 20 85 20 85 50" fill={color} /><circle cx="25" cy="35" r="8" fill={color} /><circle cx="75" cy="35" r="8" fill={color} /></>,
  (color: string) => <path d="M18 48 Q18 15 50 15 Q82 15 82 48 L78 35 Q50 8 22 35Z" fill={color} />,
  (color: string) => <><rect x="20" y="15" width="60" height="35" rx="5" fill={color} /><rect x="25" y="50" width="8" height="15" rx="2" fill={color} /><rect x="67" y="50" width="8" height="15" rx="2" fill={color} /></>,
  (color: string) => <path d="M25 45 C25 30 75 30 75 45 L70 30 C50 10 30 30 25 30Z" fill={color} />,
  (color: string) => <><path d="M15 50 C15 18 85 18 85 50" fill={color} /><path d="M30 50 Q30 25 50 20 Q70 25 70 50" fill={color} opacity="0.8" /></>,
  (color: string) => <><circle cx="35" cy="25" r="12" fill={color} /><circle cx="65" cy="25" r="12" fill={color} /><path d="M25 45 C25 30 75 30 75 45" fill={color} /></>,
  (color: string) => <path d="M20 50 C20 20 80 20 80 50 Q50 10 20 50Z" fill={color} />,
  (color: string) => <><path d="M15 55 C15 20 85 20 85 55" fill={color} /><path d="M25 55 L20 75" stroke={color} strokeWidth="3" fill="none" /><path d="M75 55 L80 75" stroke={color} strokeWidth="3" fill="none" /></>,
  (color: string) => <><rect x="18" y="18" width="64" height="20" rx="3" fill={color} /><path d="M22 38 C22 28 78 28 78 38 L78 45 C78 55 22 55 22 45Z" fill={color} /></>
];

const EYE_STYLES = [
  () => <><circle cx="38" cy="45" r="4" fill="#2D2A26" /><circle cx="62" cy="45" r="4" fill="#2D2A26" /><circle cx="39" cy="44" r="1.5" fill="white" /><circle cx="63" cy="44" r="1.5" fill="white" /></>,
  () => <><ellipse cx="38" cy="45" rx="5" ry="4" fill="#2D2A26" /><ellipse cx="62" cy="45" rx="5" ry="4" fill="#2D2A26" /><circle cx="39" cy="44" r="2" fill="white" /><circle cx="63" cy="44" r="2" fill="white" /></>,
  () => <><path d="M33 45 Q38 40 43 45" stroke="#2D2A26" strokeWidth="2.5" fill="none" /><path d="M57 45 Q62 40 67 45" stroke="#2D2A26" strokeWidth="2.5" fill="none" /></>,
  () => <><circle cx="38" cy="45" r="5" fill="white" stroke="#2D2A26" strokeWidth="1.5" /><circle cx="38" cy="45" r="3" fill="#2D2A26" /><circle cx="62" cy="45" r="5" fill="white" stroke="#2D2A26" strokeWidth="1.5" /><circle cx="62" cy="45" r="3" fill="#2D2A26" /></>,
  () => <><path d="M33 43 L43 43 L43 47 L33 47Z" fill="#2D2A26" rx="1" /><path d="M57 43 L67 43 L67 47 L57 47Z" fill="#2D2A26" rx="1" /></>,
  () => <><circle cx="38" cy="45" r="4" fill="#2D2A26" /><circle cx="62" cy="45" r="4" fill="#2D2A26" /><path d="M33 41 L43 41" stroke="#2D2A26" strokeWidth="1.5" /><path d="M57 41 L67 41" stroke="#2D2A26" strokeWidth="1.5" /></>,
  () => <><ellipse cx="38" cy="45" rx="4" ry="5" fill="#2D2A26" /><ellipse cx="62" cy="45" rx="4" ry="5" fill="#2D2A26" /><circle cx="39" cy="43" r="2" fill="white" /><circle cx="63" cy="43" r="2" fill="white" /></>,
  () => <><path d="M33 45 Q38 48 43 45" stroke="#2D2A26" strokeWidth="2" fill="none" /><path d="M57 45 Q62 48 67 45" stroke="#2D2A26" strokeWidth="2" fill="none" /></>
];

const MOUTH_STYLES = [
  () => <path d="M40 62 Q50 70 60 62" stroke="#E8734A" strokeWidth="2" fill="none" />,
  () => <path d="M40 62 Q50 68 60 62" stroke="#E8734A" strokeWidth="2.5" fill="#E8734A" opacity="0.3" />,
  () => <circle cx="50" cy="63" r="4" fill="#E8734A" />,
  () => <><path d="M42 62 L58 62" stroke="#E8734A" strokeWidth="2" /><path d="M50 62 L50 66" stroke="#E8734A" strokeWidth="1" /></>,
  () => <path d="M38 60 Q50 72 62 60" stroke="#E8734A" strokeWidth="2" fill="#E8734A" opacity="0.2" />,
  () => <><path d="M42 62 Q50 58 58 62" stroke="#E8734A" strokeWidth="2" fill="none" /><circle cx="50" cy="60" r="1" fill="#E8734A" /></>
];

const CLOTHING_STYLES = [
  (color: string) => <path d="M20 90 L30 75 L50 80 L70 75 L80 90Z" fill={color} />,
  (color: string) => <><path d="M25 90 L30 75 L50 78 L70 75 L75 90Z" fill={color} /><rect x="45" y="75" width="10" height="8" rx="2" fill="white" /></>,
  (color: string) => <path d="M15 90 L25 70 L50 75 L75 70 L85 90Z" fill={color} />,
  (color: string) => <><path d="M20 90 L30 75 L50 80 L70 75 L80 90Z" fill={color} /><path d="M35 75 L40 70 L45 75" stroke="white" strokeWidth="1.5" fill="none" /></>,
  (color: string) => <rect x="25" y="72" width="50" height="18" rx="3" fill={color} />,
  (color: string) => <><path d="M20 90 L30 72 L50 77 L70 72 L80 90Z" fill={color} /><path d="M35 72 L50 77 L65 72" stroke="white" strokeWidth="1" fill="none" /></>,
  (color: string) => <><path d="M25 90 L30 72 L50 76 L70 72 L75 90Z" fill={color} /><circle cx="42" cy="80" r="2" fill="white" /><circle cx="58" cy="80" r="2" fill="white" /></>,
  (color: string) => <path d="M18 90 L28 68 L50 73 L72 68 L82 90Z" fill={color} />,
  (color: string) => <><path d="M22 90 L32 74 L50 78 L68 74 L78 90Z" fill={color} /><rect x="40" y="74" width="20" height="5" rx="1" fill="white" /></>,
  (color: string) => <path d="M20 90 L25 70 Q50 65 75 70 L80 90Z" fill={color} />
];

const ACCESSORIES = [
  () => null,
  () => <circle cx="50" cy="20" r="8" fill="#FFD700" />,
  () => <rect x="30" y="38" width="40" height="3" rx="1.5" fill="#2D2A26" />,
  () => <><circle cx="50" cy="18" r="10" fill="none" stroke="#FFD700" strokeWidth="2" /><circle cx="50" cy="8" r="3" fill="#FFD700" /></>,
  () => <path d="M35 35 L65 35 L62 40 L38 40Z" fill="#E8734A" />,
  () => <><circle cx="25" cy="55" r="3" fill="#FF69B4" /><circle cx="75" cy="55" r="3" fill="#FF69B4" /></>,
  () => <path d="M40 20 L50 10 L60 20" stroke="#FFD700" strokeWidth="2" fill="none" />,
  () => <><circle cx="30" cy="38" r="2" fill="#E8734A" /><circle cx="70" cy="38" r="2" fill="#E8734A" /></>
];

export default function AvatarPreview({ avatar, size = 100 }: AvatarPreviewProps) {
  const { faceShape, hairstyle, eyeStyle, mouthStyle, clothing, accessory, skinColor, hairColor, clothingColor } = avatar;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ borderRadius: '50%', background: '#F0EDE8' }}
    >
      {FACE_SHAPES[faceShape % FACE_SHAPES.length](skinColor)}
      {HAIRSTYLES[hairstyle % HAIRSTYLES.length](hairColor)}
      {EYE_STYLES[eyeStyle % EYE_STYLES.length]()}
      {MOUTH_STYLES[mouthStyle % MOUTH_STYLES.length]()}
      {CLOTHING_STYLES[clothing % CLOTHING_STYLES.length](clothingColor)}
      {ACCESSORIES[accessory % ACCESSORIES.length]?.()}
    </svg>
  );
}
