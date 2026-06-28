import { useId } from 'react';
import { AvatarConfig } from '../../types';

interface AvatarPreviewProps {
  avatar: AvatarConfig;
  size?: number;
}

/*
 * 萌系游戏捏脸风格 v2
 * ─────────────────
 * 用 120x120 正方 viewbox，内部圆形裁剪
 * 头身比 ~60:40，底部放小身体和脚
 * 所有元素都在 clipPath 圆内，不会被外部 border-radius 切歪
 */

// ── 脸型 ──────────────────────────────────────────
const FACE_SHAPES = [
  // 1 圆脸
  (c: string) => <circle cx="60" cy="54" r="32" fill={c} />,
  // 2 鸡蛋脸
  (c: string) => <path d="M60 22 C88 22 92 52 60 86 C28 52 32 22 60 22Z" fill={c} />,
  // 3 肉嘟嘟
  (c: string) => <ellipse cx="60" cy="54" rx="35" ry="30" fill={c} />,
  // 4 馒头脸
  (c: string) => <ellipse cx="60" cy="54" rx="30" ry="28" fill={c} />,
  // 5 小方脸
  (c: string) => <rect x="30" y="24" width="60" height="58" rx="18" fill={c} />,
  // 6 瓜子脸
  (c: string) => <path d="M60 22 C90 22 92 50 60 84 C28 50 30 22 60 22Z" fill={c} />
];

// ── 发型 ──────────────────────────────────────────
const HAIRSTYLES = [
  // 1 短发
  (c: string) => <path d="M30 52 C30 24 90 24 90 52 L86 36 Q60 16 34 36Z" fill={c} />,
  // 2 长直发
  (c: string) => (
    <>
      <path d="M28 56 C28 22 92 22 92 56 L92 90 L88 86 L88 54 C88 30 32 30 32 54 L32 86 L28 90Z" fill={c} />
      <path d="M36 24 Q60 16 84 24 L82 30 Q60 20 38 30Z" fill={c} opacity="0.5" />
    </>
  ),
  // 3 齐刘海
  (c: string) => (
    <>
      <path d="M30 54 C30 24 90 24 90 54 L90 38 L30 38Z" fill={c} />
      <path d="M30 54 L32 72 L36 70 L34 54Z" fill={c} />
      <path d="M86 54 L88 72 L84 70 L86 54Z" fill={c} />
    </>
  ),
  // 4 双丸子头
  (c: string) => (
    <>
      <path d="M32 54 C32 28 88 28 88 54Z" fill={c} />
      <circle cx="34" cy="32" r="14" fill={c} />
      <circle cx="86" cy="32" r="14" fill={c} />
    </>
  ),
  // 5 双马尾
  (c: string) => (
    <>
      <path d="M32 52 C32 26 88 26 88 52Z" fill={c} />
      <path d="M32 44 Q18 56 24 90" stroke={c} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M88 44 Q102 56 96 90" stroke={c} strokeWidth="8" strokeLinecap="round" fill="none" />
    </>
  ),
  // 6 丸子头
  (c: string) => (
    <>
      <path d="M32 54 C32 26 88 26 88 54Z" fill={c} />
      <circle cx="60" cy="18" r="12" fill={c} />
    </>
  ),
  // 7 斜刘海
  (c: string) => (
    <path d="M30 56 C30 24 90 24 90 56 L90 40 L68 44 L48 36 L30 48Z" fill={c} />
  ),
  // 8 高马尾
  (c: string) => (
    <>
      <path d="M32 54 C32 28 88 28 88 54Z" fill={c} />
      <path d="M72 24 Q82 10 90 24 Q84 34 76 30Z" fill={c} />
      <path d="M82 18 Q76 4 70 18" fill={c} />
    </>
  ),
  // 9 爆炸头
  (c: string) => (
    <>
      <circle cx="40" cy="36" r="18" fill={c} />
      <circle cx="80" cy="36" r="18" fill={c} />
      <circle cx="60" cy="24" r="20" fill={c} />
      <circle cx="48" cy="28" r="16" fill={c} />
      <circle cx="72" cy="28" r="16" fill={c} />
    </>
  ),
  // 10 呆毛
  (c: string) => (
    <>
      <path d="M30 54 C30 24 90 24 90 54 L86 36 Q60 16 34 36Z" fill={c} />
      <path d="M56 18 Q50 4 60 0 Q56 10 62 16Z" fill={c} />
    </>
  ),
  // 11 波波头
  (c: string) => (
    <path d="M28 58 C28 22 92 22 92 58 C92 74 76 78 60 74 C44 78 28 74 28 58Z" fill={c} />
  ),
  // 12 中分长发
  (c: string) => (
    <>
      <path d="M28 56 C28 22 92 22 92 56 L92 88 L88 84 L88 52 C88 30 64 26 62 52 L60 52 L60 26 C58 26 32 30 32 52 L32 84 L28 88Z" fill={c} />
    </>
  )
];

// ── 眼睛 ──────────────────────────────────────────
const EYE_STYLES = [
  // 1 大圆眼
  () => (
    <>
      <circle cx="48" cy="56" r="7" fill="#2D2A26" />
      <circle cx="72" cy="56" r="7" fill="#2D2A26" />
      <circle cx="50" cy="54" r="2.8" fill="white" />
      <circle cx="74" cy="54" r="2.8" fill="white" />
    </>
  ),
  // 2 笑眼 ^_^
  () => (
    <>
      <path d="M42 58 Q48 50 54 58" stroke="#2D2A26" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M66 58 Q72 50 78 58" stroke="#2D2A26" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),
  // 3 豆豆眼
  () => (
    <>
      <circle cx="48" cy="56" r="3.5" fill="#2D2A26" />
      <circle cx="72" cy="56" r="3.5" fill="#2D2A26" />
    </>
  ),
  // 4 星星眼
  () => (
    <>
      <circle cx="48" cy="56" r="7" fill="#2D2A26" />
      <circle cx="72" cy="56" r="7" fill="#2D2A26" />
      <path d="M48 52 L49.5 54 L52 54 L50 55.5 L51 58 L48 56.5 L45 58 L46 55.5 L44 54 L46.5 54Z" fill="white" />
      <path d="M72 52 L73.5 54 L76 54 L74 55.5 L75 58 L72 56.5 L69 58 L70 55.5 L68 54 L70.5 54Z" fill="white" />
    </>
  ),
  // 5 下垂眼
  () => (
    <>
      <ellipse cx="48" cy="57" rx="6" ry="7" fill="#2D2A26" />
      <ellipse cx="72" cy="57" rx="6" ry="7" fill="#2D2A26" />
      <circle cx="50" cy="55" r="2.5" fill="white" />
      <circle cx="74" cy="55" r="2.5" fill="white" />
    </>
  ),
  // 6 半眯眼
  () => (
    <>
      <path d="M42 56 Q48 60 54 56" stroke="#2D2A26" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M66 56 Q72 60 78 56" stroke="#2D2A26" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  // 7 大椭圆眼
  () => (
    <>
      <ellipse cx="48" cy="56" rx="6.5" ry="8" fill="#2D2A26" />
      <ellipse cx="72" cy="56" rx="6.5" ry="8" fill="#2D2A26" />
      <circle cx="50" cy="53" r="3.2" fill="white" />
      <circle cx="74" cy="53" r="3.2" fill="white" />
    </>
  ),
  // 8 泪汪汪
  () => (
    <>
      <circle cx="48" cy="56" r="7" fill="#2D2A26" />
      <circle cx="72" cy="56" r="7" fill="#2D2A26" />
      <circle cx="50" cy="53" r="3" fill="white" />
      <circle cx="74" cy="53" r="3" fill="white" />
      <circle cx="46" cy="58" r="1.5" fill="white" opacity="0.6" />
      <circle cx="70" cy="58" r="1.5" fill="white" opacity="0.6" />
    </>
  )
];

// ── 嘴巴 ──────────────────────────────────────────
const MOUTH_STYLES = [
  // 1 微笑
  () => <path d="M52 70 Q60 77 68 70" stroke="#D4605A" strokeWidth="2" fill="none" strokeLinecap="round" />,
  // 2 大笑
  () => <path d="M53 70 Q60 80 67 70Z" fill="#D4605A" />,
  // 3 ω猫嘴
  () => (
    <>
      <path d="M53 70 Q56.5 74 60 70" stroke="#D4605A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M60 70 Q63.5 74 67 70" stroke="#D4605A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
  // 4 小圆嘴
  () => <ellipse cx="60" cy="72" rx="3.5" ry="4" fill="#D4605A" />,
  // 5 吐舌
  () => (
    <>
      <path d="M53 70 Q60 77 67 70" stroke="#D4605A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="75" rx="3.5" ry="2.5" fill="#FF8888" />
    </>
  ),
  // 6 一字嘴
  () => <path d="M55 72 L65 72" stroke="#D4605A" strokeWidth="2" strokeLinecap="round" />
];

// ── 腮红 ──────────────────────────────────────────
function CheekBlush() {
  return (
    <>
      <ellipse cx="38" cy="66" rx="7" ry="4" fill="#FF8A80" />
      <ellipse cx="82" cy="66" rx="7" ry="4" fill="#FF8A80" />
    </>
  );
}

// ── 服饰 ──────────────────────────────────────────
const BODY_TOP = 86;

const CLOTHING_STYLES = [
  // 1 T恤
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M40 ${BODY_TOP + 6} Q40 ${BODY_TOP - 1} 60 ${BODY_TOP - 1} Q80 ${BODY_TOP - 1} 80 ${BODY_TOP + 6} L82 ${BODY_TOP + 36} Q82 ${BODY_TOP + 40} 60 ${BODY_TOP + 40} Q38 ${BODY_TOP + 40} 38 ${BODY_TOP + 36}Z`} fill={c} />
      <ellipse cx="38" cy={BODY_TOP + 10} rx="7" ry="5.5" fill={c} />
      <ellipse cx="82" cy={BODY_TOP + 10} rx="7" ry="5.5" fill={c} />
      <circle cx="32" cy={BODY_TOP + 14} r="4.5" fill="#F5CBA7" />
      <circle cx="88" cy={BODY_TOP + 14} r="4.5" fill="#F5CBA7" />
      <path d={`M50 ${BODY_TOP + 3} Q60 ${BODY_TOP + 10} 70 ${BODY_TOP + 3}`} stroke="white" strokeWidth="1.2" fill="none" opacity="0.5" />
    </>
  ),
  // 2 衬衫
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M38 ${BODY_TOP + 7} Q38 ${BODY_TOP - 2} 60 ${BODY_TOP - 2} Q82 ${BODY_TOP - 2} 82 ${BODY_TOP + 7} L84 ${BODY_TOP + 38} Q84 ${BODY_TOP + 42} 60 ${BODY_TOP + 42} Q36 ${BODY_TOP + 42} 36 ${BODY_TOP + 38}Z`} fill={c} />
      <ellipse cx="36" cy={BODY_TOP + 12} rx="7" ry="5.5" fill={c} />
      <ellipse cx="84" cy={BODY_TOP + 12} rx="7" ry="5.5" fill={c} />
      <circle cx="30" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <circle cx="90" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <circle cx="60" cy={BODY_TOP + 14} r="1.2" fill="white" opacity="0.6" />
      <circle cx="60" cy={BODY_TOP + 22} r="1.2" fill="white" opacity="0.6" />
    </>
  ),
  // 3 卫衣
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M36 ${BODY_TOP + 8} Q36 ${BODY_TOP - 4} 60 ${BODY_TOP - 4} Q84 ${BODY_TOP - 4} 84 ${BODY_TOP + 8} L86 ${BODY_TOP + 36} Q86 ${BODY_TOP + 40} 60 ${BODY_TOP + 40} Q34 ${BODY_TOP + 40} 34 ${BODY_TOP + 36}Z`} fill={c} />
      <ellipse cx="34" cy={BODY_TOP + 12} rx="8" ry="6" fill={c} />
      <ellipse cx="86" cy={BODY_TOP + 12} rx="8" ry="6" fill={c} />
      <circle cx="28" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <circle cx="92" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <rect x="48" y={BODY_TOP + 24} width="24" height="9" rx="3" fill={c} stroke="white" strokeWidth="0.7" opacity="0.35" />
    </>
  ),
  // 4 西装
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M36 ${BODY_TOP + 7} Q36 ${BODY_TOP - 2} 60 ${BODY_TOP - 2} Q84 ${BODY_TOP - 2} 84 ${BODY_TOP + 7} L86 ${BODY_TOP + 38} Q86 ${BODY_TOP + 42} 60 ${BODY_TOP + 42} Q34 ${BODY_TOP + 42} 34 ${BODY_TOP + 38}Z`} fill={c} />
      <ellipse cx="34" cy={BODY_TOP + 12} rx="7" ry="5.5" fill={c} />
      <ellipse cx="86" cy={BODY_TOP + 12} rx="7" ry="5.5" fill={c} />
      <circle cx="28" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <circle cx="92" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <path d={`M50 ${BODY_TOP + 2} L60 ${BODY_TOP + 16} L70 ${BODY_TOP + 2}`} stroke="white" strokeWidth="1.2" fill="none" />
    </>
  ),
  // 5 连衣裙
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M42 ${BODY_TOP + 5} Q42 ${BODY_TOP - 2} 60 ${BODY_TOP - 2} Q78 ${BODY_TOP - 2} 78 ${BODY_TOP + 5} L84 ${BODY_TOP + 44} Q84 ${BODY_TOP + 48} 60 ${BODY_TOP + 48} Q36 ${BODY_TOP + 48} 36 ${BODY_TOP + 44}Z`} fill={c} />
      <ellipse cx="38" cy={BODY_TOP + 10} rx="5.5" ry="4.5" fill={c} />
      <ellipse cx="82" cy={BODY_TOP + 10} rx="5.5" ry="4.5" fill={c} />
      <circle cx="34" cy={BODY_TOP + 14} r="4" fill="#F5CBA7" />
      <circle cx="86" cy={BODY_TOP + 14} r="4" fill="#F5CBA7" />
      <path d="M55.5 86 L60 89 L64.5 86 L60 85Z" fill="white" opacity="0.4" />
    </>
  ),
  // 6 运动衫
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M35 ${BODY_TOP + 9} Q35 ${BODY_TOP - 4} 60 ${BODY_TOP - 4} Q85 ${BODY_TOP - 4} 85 ${BODY_TOP + 9} L87 ${BODY_TOP + 36} Q87 ${BODY_TOP + 40} 60 ${BODY_TOP + 40} Q33 ${BODY_TOP + 40} 33 ${BODY_TOP + 36}Z`} fill={c} />
      <ellipse cx="33" cy={BODY_TOP + 14} rx="8" ry="6" fill={c} />
      <ellipse cx="87" cy={BODY_TOP + 14} rx="8" ry="6" fill={c} />
      <circle cx="27" cy={BODY_TOP + 18} r="4.5" fill="#F5CBA7" />
      <circle cx="93" cy={BODY_TOP + 18} r="4.5" fill="#F5CBA7" />
      <line x1="48" y1={BODY_TOP + 28} x2="72" y2={BODY_TOP + 28} stroke="white" strokeWidth="1.5" opacity="0.35" />
    </>
  ),
  // 7 格子衫
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M38 ${BODY_TOP + 7} Q38 ${BODY_TOP - 2} 60 ${BODY_TOP - 2} Q82 ${BODY_TOP - 2} 82 ${BODY_TOP + 7} L84 ${BODY_TOP + 38} Q84 ${BODY_TOP + 42} 60 ${BODY_TOP + 42} Q36 ${BODY_TOP + 42} 36 ${BODY_TOP + 38}Z`} fill={c} />
      <ellipse cx="36" cy={BODY_TOP + 12} rx="7" ry="5.5" fill={c} />
      <ellipse cx="84" cy={BODY_TOP + 12} rx="7" ry="5.5" fill={c} />
      <circle cx="30" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      <circle cx="90" cy={BODY_TOP + 16} r="4.5" fill="#F5CBA7" />
      {[46, 56, 66, 76].map((x, i) => <line key={`v${i}`} x1={x} y1={BODY_TOP + 5} x2={x} y2={BODY_TOP + 40} stroke="white" strokeWidth="0.6" opacity="0.25" />)}
      {[BODY_TOP + 18, BODY_TOP + 28].map((y, i) => <line key={`h${i}`} x1="38" y1={y} x2="82" y2={y} stroke="white" strokeWidth="0.6" opacity="0.25" />)}
    </>
  ),
  // 8 毛衣
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M35 ${BODY_TOP + 9} Q35 ${BODY_TOP - 4} 60 ${BODY_TOP - 4} Q85 ${BODY_TOP - 4} 85 ${BODY_TOP + 9} L86 ${BODY_TOP + 38} Q86 ${BODY_TOP + 42} 60 ${BODY_TOP + 42} Q34 ${BODY_TOP + 42} 34 ${BODY_TOP + 38}Z`} fill={c} />
      <ellipse cx="34" cy={BODY_TOP + 14} rx="7.5" ry="6" fill={c} />
      <ellipse cx="86" cy={BODY_TOP + 14} rx="7.5" ry="6" fill={c} />
      <circle cx="28" cy={BODY_TOP + 18} r="4.5" fill="#F5CBA7" />
      <circle cx="92" cy={BODY_TOP + 18} r="4.5" fill="#F5CBA7" />
      <path d={`M57 ${BODY_TOP + 8} Q58 ${BODY_TOP + 15} 57 ${BODY_TOP + 22} Q56 ${BODY_TOP + 29} 57 ${BODY_TOP + 36}`} stroke="white" strokeWidth="1.2" fill="none" opacity="0.25" />
      <path d={`M63 ${BODY_TOP + 8} Q62 ${BODY_TOP + 15} 63 ${BODY_TOP + 22} Q64 ${BODY_TOP + 29} 63 ${BODY_TOP + 36}`} stroke="white" strokeWidth="1.2" fill="none" opacity="0.25" />
    </>
  ),
  // 9 和服
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M40 ${BODY_TOP + 5} Q40 ${BODY_TOP - 2} 60 ${BODY_TOP - 2} Q80 ${BODY_TOP - 2} 80 ${BODY_TOP + 5} L86 ${BODY_TOP + 44} Q86 ${BODY_TOP + 48} 60 ${BODY_TOP + 48} Q34 ${BODY_TOP + 48} 34 ${BODY_TOP + 44}Z`} fill={c} />
      <ellipse cx="36" cy={BODY_TOP + 10} rx="6" ry="4.5" fill={c} />
      <ellipse cx="84" cy={BODY_TOP + 10} rx="6" ry="4.5" fill={c} />
      <circle cx="32" cy={BODY_TOP + 14} r="4" fill="#F5CBA7" />
      <circle cx="88" cy={BODY_TOP + 14} r="4" fill="#F5CBA7" />
      <line x1="54" y1={BODY_TOP + 2} x2="60" y2={BODY_TOP + 22} stroke="white" strokeWidth="1.5" opacity="0.4" />
      <line x1="66" y1={BODY_TOP + 2} x2="60" y2={BODY_TOP + 22} stroke="white" strokeWidth="1.5" opacity="0.4" />
      <rect x="38" y={BODY_TOP + 24} width="44" height="5" rx="1.5" fill="white" opacity="0.25" />
    </>
  ),
  // 10 背带裤
  (c: string) => (
    <>
      <rect x="54" y={BODY_TOP - 3} width="12" height="8" rx="3" fill="#F5CBA7" />
      <path d={`M40 ${BODY_TOP + 4} Q40 ${BODY_TOP - 1} 60 ${BODY_TOP - 1} Q80 ${BODY_TOP - 1} 80 ${BODY_TOP + 4} L82 ${BODY_TOP + 36} Q82 ${BODY_TOP + 40} 60 ${BODY_TOP + 40} Q38 ${BODY_TOP + 40} 38 ${BODY_TOP + 36}Z`} fill="#FFE8D0" />
      <rect x="48" y={BODY_TOP + 2} width="5" height="28" rx="1.5" fill={c} />
      <rect x="67" y={BODY_TOP + 2} width="5" height="28" rx="1.5" fill={c} />
      <path d={`M38 ${BODY_TOP + 24} L82 ${BODY_TOP + 24} L84 ${BODY_TOP + 40} Q84 ${BODY_TOP + 44} 60 ${BODY_TOP + 44} Q36 ${BODY_TOP + 44} 36 ${BODY_TOP + 40}Z`} fill={c} />
      <ellipse cx="38" cy={BODY_TOP + 8} rx="6" ry="4.5" fill="#FFE8D0" />
      <ellipse cx="82" cy={BODY_TOP + 8} rx="6" ry="4.5" fill="#FFE8D0" />
      <circle cx="34" cy={BODY_TOP + 12} r="4" fill="#F5CBA7" />
      <circle cx="86" cy={BODY_TOP + 12} r="4" fill="#F5CBA7" />
      <rect x="46" y={BODY_TOP + 30} width="10" height="8" rx="2" fill={c} stroke="white" strokeWidth="0.6" opacity="0.3" />
      <rect x="64" y={BODY_TOP + 30} width="10" height="8" rx="2" fill={c} stroke="white" strokeWidth="0.6" opacity="0.3" />
    </>
  )
];

// ── 配饰 ──────────────────────────────────────────
const ACCESSORIES = [
  () => null,
  // 皇冠
  () => <path d="M44 26 L48 16 L54 22 L60 10 L66 22 L72 16 L76 26Z" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />,
  // 眼镜
  () => (
    <>
      <circle cx="48" cy="56" r="10" fill="none" stroke="#6B5B4D" strokeWidth="1.6" />
      <circle cx="72" cy="56" r="10" fill="none" stroke="#6B5B4D" strokeWidth="1.6" />
      <line x1="58" y1="56" x2="62" y2="56" stroke="#6B5B4D" strokeWidth="1.6" />
      <line x1="38" y1="54" x2="33" y2="51" stroke="#6B5B4D" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="82" y1="54" x2="87" y2="51" stroke="#6B5B4D" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  // 蝴蝶结
  () => (
    <>
      <ellipse cx="48" cy="28" rx="10" ry="7" fill="#FF69B4" />
      <ellipse cx="72" cy="28" rx="10" ry="7" fill="#FF69B4" />
      <circle cx="60" cy="28" r="3.5" fill="#FF1493" />
    </>
  ),
  // 渔夫帽
  () => (
    <>
      <ellipse cx="60" cy="30" rx="36" ry="5.5" fill="#4A90D9" />
      <path d="M38 30 Q38 12 60 10 Q82 12 82 30Z" fill="#4A90D9" />
    </>
  ),
  // 发箍
  () => <path d="M32 42 Q60 22 88 42" stroke="#E8734A" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
  // 耳机
  () => (
    <>
      <path d="M30 50 Q30 26 60 24 Q90 26 90 50" stroke="#3D3D3D" strokeWidth="3.5" fill="none" />
      <rect x="26" y="50" width="8" height="12" rx="3" fill="#3D3D3D" />
      <rect x="86" y="50" width="8" height="12" rx="3" fill="#3D3D3D" />
    </>
  ),
  // 星星
  () => (
    <>
      <path d="M82 52 L83.5 48 L85 52 L89 52 L85.5 54.5 L87 58 L83.5 56 L80 58 L81.5 54.5 L78 52Z" fill="#FFD700" />
      <path d="M36 42 L37 39 L38 42 L41 42 L38.5 43.5 L39.5 46 L37 44.5 L34.5 46 L35.5 43.5 L33 42Z" fill="#FFD700" />
    </>
  )
];

export default function AvatarPreview({ avatar, size = 100 }: AvatarPreviewProps) {
  const clipId = useId();
  const { faceShape, hairstyle, eyeStyle, mouthStyle, clothing, accessory, skinColor, hairColor, clothingColor } = avatar;

  return (
    <svg viewBox="0 0 120 120" width={size} height={size}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="60" cy="60" r="60" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* 温暖渐变背景 */}
        <rect width="120" height="120" fill="#FFF8F2" />
        <circle cx="60" cy="55" r="70" fill="#FDE8D8" opacity="0.3" />

        {/* 身体 */}
        {CLOTHING_STYLES[clothing % CLOTHING_STYLES.length](clothingColor)}

        {/* 小脚 */}
        <ellipse cx="50" cy={BODY_TOP + 44} rx="9" ry="4.5" fill={clothingColor} />
        <ellipse cx="70" cy={BODY_TOP + 44} rx="9" ry="4.5" fill={clothingColor} />

        {/* 脸 */}
        {FACE_SHAPES[faceShape % FACE_SHAPES.length](skinColor)}

        {/* 发型 */}
        {HAIRSTYLES[hairstyle % HAIRSTYLES.length](hairColor)}

        {/* 腮红 */}
        <CheekBlush />

        {/* 眼睛 */}
        {EYE_STYLES[eyeStyle % EYE_STYLES.length]()}

        {/* 嘴巴 */}
        {MOUTH_STYLES[mouthStyle % MOUTH_STYLES.length]()}

        {/* 配饰 */}
        {ACCESSORIES[accessory % ACCESSORIES.length]?.()}
      </g>
    </svg>
  );
}
