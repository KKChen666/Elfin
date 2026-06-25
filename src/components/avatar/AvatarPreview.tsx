import { AvatarConfig } from '../../types';

interface AvatarPreviewProps {
  avatar: AvatarConfig;
  size?: number;
}

// ── 脸型 ──────────────────────────────────────────
const FACE_SHAPES = [
  // 圆脸
  (c: string) => (
    <>
      <circle cx="60" cy="58" r="36" fill={c} />
      <ellipse cx="60" cy="60" rx="36" ry="34" fill={c} />
    </>
  ),
  // 鹅蛋脸
  (c: string) => <ellipse cx="60" cy="58" rx="32" ry="37" fill={c} />,
  // 方圆脸
  (c: string) => <rect x="28" y="26" width="64" height="66" rx="22" fill={c} />,
  // 倒三角
  (c: string) => <path d="M30 40 Q30 22 60 22 Q90 22 90 40 L82 82 Q60 96 38 82Z" fill={c} />,
  // 胖圆脸
  (c: string) => <circle cx="60" cy="58" r="38" fill={c} />,
  // 瓜子脸
  (c: string) => <path d="M60 20 C88 20 94 48 90 62 C86 78 68 92 60 92 C52 92 34 78 30 62 C26 48 32 20 60 20Z" fill={c} />
];

// ── 发型 ──────────────────────────────────────────
const HAIRSTYLES = [
  // 1 短碎发
  (c: string) => (
    <>
      <path d="M26 52 C26 22 94 22 94 52 L92 38 C90 18 30 18 28 38Z" fill={c} />
      <path d="M30 38 Q35 26 48 22 Q38 28 32 40Z" fill={c} opacity="0.7" />
      <path d="M75 35 Q70 24 55 20 Q68 26 74 38Z" fill={c} opacity="0.7" />
    </>
  ),
  // 2 长直发
  (c: string) => (
    <>
      <path d="M24 55 C24 20 96 20 96 55 L96 85 Q94 88 90 85 L90 55 C90 30 30 30 30 55 L30 85 Q26 88 24 85Z" fill={c} />
      <path d="M35 22 Q60 12 85 22 L82 30 Q60 18 38 30Z" fill={c} opacity="0.5" />
    </>
  ),
  // 3 齐刘海短发
  (c: string) => (
    <>
      <path d="M28 52 C28 22 92 22 92 52 L90 36 C88 16 32 16 30 36Z" fill={c} />
      <rect x="30" y="32" width="60" height="14" rx="4" fill={c} />
      <path d="M28 52 L30 70 Q32 72 34 70 L34 52Z" fill={c} />
      <path d="M86 52 L88 70 Q90 72 92 70 L92 52Z" fill={c} />
    </>
  ),
  // 4 双丸子头
  (c: string) => (
    <>
      <path d="M28 52 C28 26 92 26 92 52" fill={c} />
      <circle cx="30" cy="30" r="14" fill={c} />
      <circle cx="90" cy="30" r="14" fill={c} />
      <circle cx="30" cy="30" r="9" fill={c} opacity="0.6" />
      <circle cx="90" cy="30" r="9" fill={c} opacity="0.6" />
    </>
  ),
  // 5 中分长发
  (c: string) => (
    <>
      <path d="M22 55 C22 18 98 18 98 55 L98 88 Q96 92 92 88 L92 52 C92 28 58 22 60 52 L60 42 C62 22 28 28 28 52 L28 88 Q24 92 22 88Z" fill={c} />
    </>
  ),
  // 6 锅盖头
  (c: string) => (
    <>
      <path d="M26 54 Q26 16 60 16 Q94 16 94 54 L94 48 Q94 14 60 14 Q26 14 26 48Z" fill={c} />
      <rect x="26" y="36" width="68" height="20" rx="4" fill={c} />
    </>
  ),
  // 7 偏分短发
  (c: string) => (
    <>
      <path d="M28 52 C28 22 92 22 92 52 L90 36 C88 16 32 16 30 36Z" fill={c} />
      <path d="M30 36 Q40 18 65 22 Q42 24 34 40Z" fill={c} opacity="0.7" />
    </>
  ),
  // 8 高马尾
  (c: string) => (
    <>
      <path d="M28 52 C28 24 92 24 92 52" fill={c} />
      <ellipse cx="72" cy="14" rx="10" ry="8" fill={c} />
      <path d="M62 18 Q58 28 62 38" stroke={c} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M72 6 L68 -4 Q72 -8 76 -4 L72 6Z" fill={c} />
    </>
  ),
  // 9 波浪卷发
  (c: string) => (
    <>
      <path d="M22 55 C22 20 98 20 98 55" fill={c} />
      <path d="M22 55 Q18 65 22 75 Q26 85 22 92" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M98 55 Q102 65 98 75 Q94 85 98 92" stroke={c} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M30 52 Q26 62 30 70" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M90 52 Q94 62 90 70" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
    </>
  ),
  // 10 呆毛短发
  (c: string) => (
    <>
      <path d="M28 52 C28 24 92 24 92 52 L90 38 C88 20 32 20 30 38Z" fill={c} />
      <path d="M55 22 Q52 8 60 4 Q58 12 62 18Z" fill={c} />
    </>
  ),
  // 11 侧编发
  (c: string) => (
    <>
      <path d="M24 55 C24 20 96 20 96 55 L96 50 C96 24 24 24 24 50Z" fill={c} />
      <path d="M88 50 L92 72 L88 72 L84 52Z" fill={c} />
      <circle cx="90" cy="76" r="5" fill={c} />
      <path d="M90 72 L90 85 Q88 92 84 88" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  // 12 中短卷发
  (c: string) => (
    <>
      <path d="M24 55 C24 20 96 20 96 55 L96 68 Q92 72 88 68 L88 50 C88 28 32 28 32 50 L32 68 Q28 72 24 68Z" fill={c} />
      <path d="M32 60 Q28 66 32 72" stroke={c} strokeWidth="4" fill="none" />
      <path d="M88 60 Q92 66 88 72" stroke={c} strokeWidth="4" fill="none" />
    </>
  )
];

// ── 眼睛 ──────────────────────────────────────────
const EYE_STYLES = [
  // 1 圆眼 - 大而亮
  () => (
    <>
      <circle cx="47" cy="56" r="7" fill="white" />
      <circle cx="73" cy="56" r="7" fill="white" />
      <circle cx="48" cy="57" r="5" fill="#2D2A26" />
      <circle cx="74" cy="57" r="5" fill="#2D2A26" />
      <circle cx="50" cy="55" r="2.2" fill="white" />
      <circle cx="76" cy="55" r="2.2" fill="white" />
      <circle cx="47" cy="58" r="1" fill="white" opacity="0.6" />
      <circle cx="73" cy="58" r="1" fill="white" opacity="0.6" />
    </>
  ),
  // 2 椭圆大眼
  () => (
    <>
      <ellipse cx="47" cy="56" rx="8" ry="7" fill="white" />
      <ellipse cx="73" cy="56" rx="8" ry="7" fill="white" />
      <ellipse cx="48" cy="57" rx="5.5" ry="5" fill="#2D2A26" />
      <ellipse cx="74" cy="57" rx="5.5" ry="5" fill="#2D2A26" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="76" cy="54" r="2.5" fill="white" />
    </>
  ),
  // 3 弯弯笑眼
  () => (
    <>
      <path d="M40 57 Q47 50 54 57" stroke="#2D2A26" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M66 57 Q73 50 80 57" stroke="#2D2A26" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    </>
  ),
  // 4 星星眼
  () => (
    <>
      <circle cx="47" cy="56" r="7.5" fill="white" />
      <circle cx="73" cy="56" r="7.5" fill="white" />
      <circle cx="48" cy="57" r="5" fill="#2D2A26" />
      <circle cx="74" cy="57" r="5" fill="#2D2A26" />
      <path d="M50 54 L51.5 52.5 L53 54 L51.5 55.5Z" fill="white" />
      <path d="M76 54 L77.5 52.5 L79 54 L77.5 55.5Z" fill="white" />
      <circle cx="46" cy="58" r="1.2" fill="white" opacity="0.7" />
      <circle cx="72" cy="58" r="1.2" fill="white" opacity="0.7" />
    </>
  ),
  // 5 方眼
  () => (
    <>
      <rect x="40" y="50" width="14" height="12" rx="3" fill="white" />
      <rect x="66" y="50" width="14" height="12" rx="3" fill="white" />
      <rect x="43" y="52" width="8" height="8" rx="2" fill="#2D2A26" />
      <rect x="69" y="52" width="8" height="8" rx="2" fill="#2D2A26" />
      <circle cx="47" cy="54" r="2" fill="white" />
      <circle cx="73" cy="54" r="2" fill="white" />
    </>
  ),
  // 6 眉毛粗眼
  () => (
    <>
      <path d="M39 48 L55 46" stroke="#2D2A26" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M65 46 L81 48" stroke="#2D2A26" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="47" cy="56" r="5.5" fill="white" />
      <circle cx="73" cy="56" r="5.5" fill="white" />
      <circle cx="48" cy="57" r="4" fill="#2D2A26" />
      <circle cx="74" cy="57" r="4" fill="#2D2A26" />
      <circle cx="50" cy="55" r="1.8" fill="white" />
      <circle cx="76" cy="55" r="1.8" fill="white" />
    </>
  ),
  // 7 半眯眼
  () => (
    <>
      <ellipse cx="47" cy="56" rx="6" ry="4" fill="white" />
      <ellipse cx="73" cy="56" rx="6" ry="4" fill="white" />
      <path d="M41 54 L53 52" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" />
      <path d="M67 52 L79 54" stroke="#2D2A26" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="47" cy="57" rx="4" ry="3" fill="#2D2A26" />
      <ellipse cx="73" cy="57" rx="4" ry="3" fill="#2D2A26" />
      <circle cx="49" cy="56" r="1.5" fill="white" />
      <circle cx="75" cy="56" r="1.5" fill="white" />
    </>
  ),
  // 8 下垂眼
  () => (
    <>
      <circle cx="47" cy="57" r="6" fill="white" />
      <circle cx="73" cy="57" r="6" fill="white" />
      <circle cx="48" cy="58" r="4.5" fill="#2D2A26" />
      <circle cx="74" cy="58" r="4.5" fill="#2D2A26" />
      <circle cx="50" cy="56" r="2" fill="white" />
      <circle cx="76" cy="56" r="2" fill="white" />
      <path d="M41 53 Q47 51 53 54" stroke="#2D2A26" strokeWidth="1.5" fill="none" />
      <path d="M67 54 Q73 51 79 53" stroke="#2D2A26" strokeWidth="1.5" fill="none" />
    </>
  )
];

// ── 嘴巴 ──────────────────────────────────────────
const MOUTH_STYLES = [
  // 1 微笑
  () => <path d="M50 74 Q60 82 70 74" stroke="#D4605A" strokeWidth="2.2" fill="none" strokeLinecap="round" />,
  // 2 大笑
  () => (
    <>
      <path d="M48 74 Q60 86 72 74" fill="#D4605A" opacity="0.9" />
      <path d="M52 78 L68 78" stroke="white" strokeWidth="1" opacity="0.5" />
    </>
  ),
  // 3 圆嘴
  () => <ellipse cx="60" cy="76" rx="4" ry="4.5" fill="#D4605A" />,
  // 4 波浪嘴
  () => <path d="M48 75 Q54 72 60 75 Q66 78 72 75" stroke="#D4605A" strokeWidth="2" fill="none" strokeLinecap="round" />,
  // 5 猫嘴
  () => (
    <>
      <path d="M50 74 Q55 70 60 74" stroke="#D4605A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M60 74 Q65 70 70 74" stroke="#D4605A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="73" r="1" fill="#D4605A" />
    </>
  ),
  // 6 嘟嘴
  () => (
    <>
      <ellipse cx="60" cy="75" rx="5" ry="4" fill="#D4605A" opacity="0.8" />
      <ellipse cx="60" cy="74" rx="3" ry="2" fill="#E8888A" opacity="0.5" />
    </>
  )
];

// ── 服饰 ──────────────────────────────────────────
const CLOTHING_STYLES = [
  // 1 T恤
  (c: string) => (
    <>
      <path d="M32 115 L38 100 L60 104 L82 100 L88 115Z" fill={c} />
      <path d="M48 100 L60 108 L72 100" fill={c} opacity="0.7" />
    </>
  ),
  // 2 衬衫
  (c: string) => (
    <>
      <path d="M30 115 L38 98 L60 102 L82 98 L90 115Z" fill={c} />
      <rect x="56" y="100" width="8" height="10" rx="1.5" fill="white" opacity="0.8" />
      <path d="M52 100 L60 106 L68 100" stroke="white" strokeWidth="1" fill="none" opacity="0.5" />
    </>
  ),
  // 3 卫衣
  (c: string) => (
    <>
      <path d="M28 115 L36 96 L60 100 L84 96 L92 115Z" fill={c} />
      <ellipse cx="60" cy="100" rx="10" ry="5" fill={c} opacity="0.7" />
      <rect x="38" y="106" width="12" height="6" rx="2" fill={c} opacity="0.6" />
      <rect x="70" y="106" width="12" height="6" rx="2" fill={c} opacity="0.6" />
    </>
  ),
  // 4 西装
  (c: string) => (
    <>
      <path d="M30 115 L38 96 L60 100 L82 96 L90 115Z" fill={c} />
      <path d="M52 96 L60 110 L68 96" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="106" r="1.5" fill="white" />
    </>
  ),
  // 5 背心裙
  (c: string) => (
    <>
      <path d="M34 115 L40 98 L60 102 L80 98 L86 115Z" fill={c} />
      <path d="M44 98 L48 92" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <path d="M76 98 L72 92" stroke={c} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  // 6 运动衫
  (c: string) => (
    <>
      <path d="M30 115 L38 98 L60 102 L82 98 L90 115Z" fill={c} />
      <path d="M40 108 L80 108" stroke="white" strokeWidth="2" opacity="0.4" />
      <path d="M46 112 L74 112" stroke="white" strokeWidth="1.5" opacity="0.3" />
    </>
  ),
  // 7 格子衫
  (c: string) => (
    <>
      <path d="M30 115 L38 98 L60 102 L82 98 L90 115Z" fill={c} />
      {[42, 52, 62, 72].map((x, i) => (
        <line key={`v${i}`} x1={x} y1="100" x2={x} y2="115" stroke="white" strokeWidth="0.5" opacity="0.3" />
      ))}
      {[104, 108, 112].map((y, i) => (
        <line key={`h${i}`} x1="36" y1={y} x2="84" y2={y} stroke="white" strokeWidth="0.5" opacity="0.3" />
      ))}
    </>
  ),
  // 8 外套
  (c: string) => (
    <>
      <path d="M26 115 L34 94 L60 98 L86 94 L94 115Z" fill={c} />
      <path d="M34 94 L40 115" stroke={c} strokeWidth="1" opacity="0.5" />
      <path d="M86 94 L80 115" stroke={c} strokeWidth="1" opacity="0.5" />
      <circle cx="52" cy="104" r="1.5" fill="white" opacity="0.6" />
      <circle cx="68" cy="104" r="1.5" fill="white" opacity="0.6" />
    </>
  ),
  // 9 连帽衫
  (c: string) => (
    <>
      <path d="M28 115 L36 96 L60 100 L84 96 L92 115Z" fill={c} />
      <path d="M48 96 Q54 88 60 96 Q66 88 72 96" fill={c} opacity="0.8" />
      <path d="M55 100 L55 110" stroke="white" strokeWidth="1" opacity="0.4" />
      <path d="M65 100 L65 110" stroke="white" strokeWidth="1" opacity="0.4" />
    </>
  ),
  // 10 裙子
  (c: string) => (
    <>
      <path d="M40 100 L60 104 L80 100 L88 115 L32 115Z" fill={c} />
      <path d="M40 100 L60 104 L80 100" stroke={c} strokeWidth="1" opacity="0.6" />
      <ellipse cx="60" cy="100" rx="18" ry="4" fill={c} opacity="0.5" />
    </>
  )
];

// ── 配饰 ──────────────────────────────────────────
const ACCESSORIES = [
  // 1 无
  () => null,
  // 2 皇冠
  () => (
    <>
      <path d="M42 24 L46 14 L52 20 L60 10 L68 20 L74 14 L78 24Z" fill="#FFD700" />
      <circle cx="52" cy="20" r="1.5" fill="#FF4444" />
      <circle cx="60" cy="15" r="2" fill="#4488FF" />
      <circle cx="68" cy="20" r="1.5" fill="#44CC44" />
    </>
  ),
  // 3 眼镜
  () => (
    <>
      <circle cx="47" cy="56" r="10" fill="none" stroke="#2D2A26" strokeWidth="1.8" />
      <circle cx="73" cy="56" r="10" fill="none" stroke="#2D2A26" strokeWidth="1.8" />
      <path d="M57 56 L63 56" stroke="#2D2A26" strokeWidth="1.8" />
      <path d="M37 56 L30 52" stroke="#2D2A26" strokeWidth="1.5" />
      <path d="M83 56 L90 52" stroke="#2D2A26" strokeWidth="1.5" />
    </>
  ),
  // 4 蝴蝶结头饰
  () => (
    <>
      <path d="M80 35 Q92 26 88 38 Q92 50 80 42 Q76 38 80 35Z" fill="#FF69B4" />
      <path d="M80 35 Q68 26 72 38 Q68 50 80 42 Q84 38 80 35Z" fill="#FF69B4" />
      <circle cx="80" cy="38" r="3" fill="#FF1493" />
    </>
  ),
  // 5 帽子
  () => (
    <>
      <ellipse cx="60" cy="28" rx="38" ry="6" fill="#4A90D9" />
      <path d="M38 28 Q38 10 60 8 Q82 10 82 28Z" fill="#4A90D9" />
      <rect x="38" y="26" width="44" height="4" rx="1" fill="#3A7BC8" />
    </>
  ),
  // 6 耳环
  () => (
    <>
      <circle cx="24" cy="60" r="3.5" fill="#FFD700" />
      <circle cx="24" cy="60" r="2" fill="#FF4444" />
      <circle cx="96" cy="60" r="3.5" fill="#FFD700" />
      <circle cx="96" cy="60" r="2" fill="#FF4444" />
    </>
  ),
  // 7 发带
  () => (
    <>
      <path d="M28 36 Q60 24 92 36" stroke="#E8734A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="82" cy="32" r="4" fill="#E8734A" />
    </>
  ),
  // 8 口罩
  () => (
    <>
      <path d="M40 68 Q48 64 60 64 Q72 64 80 68 L78 82 Q60 86 42 82Z" fill="white" stroke="#DDD" strokeWidth="1" />
      <path d="M44 72 L76 72" stroke="#EEE" strokeWidth="0.5" />
      <path d="M44 76 L76 76" stroke="#EEE" strokeWidth="0.5" />
      <path d="M44 80 L76 80" stroke="#EEE" strokeWidth="0.5" />
    </>
  )
];

// ── 腮红 ──────────────────────────────────────────
function CheekBlush() {
  return (
    <>
      <ellipse cx="36" cy="66" rx="6" ry="3.5" fill="#FF8888" opacity="0.25" />
      <ellipse cx="84" cy="66" rx="6" ry="3.5" fill="#FF8888" opacity="0.25" />
    </>
  );
}

export default function AvatarPreview({ avatar, size = 100 }: AvatarPreviewProps) {
  const { faceShape, hairstyle, eyeStyle, mouthStyle, clothing, accessory, skinColor, hairColor, clothingColor } = avatar;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ borderRadius: '50%', background: 'linear-gradient(135deg, #FFF5EE 0%, #FDE8D8 50%, #F5E6D3 100%)' }}
    >
      {/* 头部阴影 */}
      <ellipse cx="62" cy="92" rx="22" ry="4" fill="#000" opacity="0.06" />

      {/* 脸型 */}
      {FACE_SHAPES[faceShape % FACE_SHAPES.length](skinColor)}

      {/* 发型（后层） */}
      {HAIRSTYLES[hairstyle % HAIRSTYLES.length](hairColor)}

      {/* 腮红 */}
      <CheekBlush />

      {/* 眼睛 */}
      {EYE_STYLES[eyeStyle % EYE_STYLES.length]()}

      {/* 嘴巴 */}
      {MOUTH_STYLES[mouthStyle % MOUTH_STYLES.length]()}

      {/* 服饰 */}
      {CLOTHING_STYLES[clothing % CLOTHING_STYLES.length](clothingColor)}

      {/* 配饰 */}
      {ACCESSORIES[accessory % ACCESSORIES.length]?.()}
    </svg>
  );
}
