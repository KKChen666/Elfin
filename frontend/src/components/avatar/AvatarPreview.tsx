import { useId } from 'react';
import { AvatarConfig } from '../../types';

interface AvatarPreviewProps {
  avatar: AvatarConfig;
  size?: number;
}

/* ═══════════════════════════════════════════════════════════
 * Companion 风格 Q版人物渲染器
 * viewBox 200×200 · 圆形裁剪 · 粗描边 · 扁平色
 * 渲染顺序: 发后层 → 身体服装 → 头部 → 发前层 → 眼 → 嘴 → 腮红 → 配饰
 * ═══════════════════════════════════════════════════════════ */

// ── 共用样式常量 ──
const OL = '#5C3D2E'; // 描边色
const SW = 2.5;       // 描边宽度

// ── 头部坐标 ──
const HX = 100; // head center x
const HY = 48;  // head center y
const HR = 28;  // head radius

// ── 眼睛坐标 ──
const ELX = 89;  // 左眼 x
const ERX = 111; // 右眼 x
const EY = 48;   // 眼睛 y

// ── 嘴巴 / 腮红 ──
const MY = 62;
const BLX = 83; // 腮红左
const BRX = 117; // 腮红右
const BY = 56;

// ── 通用色 ──
const SHOE = '#5C4033';

/* ═══════════════════════════════════════════════
 *  脸 型  (5 种)
 * ═══════════════════════════════════════════════ */

const FACES = [
  // 0 ─ 圆脸
  (c: string) => (
    <circle cx={HX} cy={HY} r={HR} fill={c} stroke={OL} strokeWidth={SW} />
  ),

  // 1 ─ 鹅蛋脸（偏长）
  (c: string) => (
    <ellipse cx={HX} cy={HY} rx={24} ry={31} fill={c} stroke={OL} strokeWidth={SW} />
  ),

  // 2 ─ 圆宽脸
  (c: string) => (
    <ellipse cx={HX} cy={HY} rx={31} ry={25} fill={c} stroke={OL} strokeWidth={SW} />
  ),

  // 3 ─ 方圆脸
  (c: string) => (
    <rect x={74} y={22} width={52} height={52} rx={14} fill={c} stroke={OL} strokeWidth={SW} />
  ),

  // 4 ─ 心形脸
  (c: string) => (
    <path
      d={`M${HX},${HY + 28} C${HX - 10},${HY + 28} ${HX - 28},${HY + 12} ${HX - 28},${HY - 4} C${HX - 28},${HY - 20} ${HX - 16},${HY - 28} ${HX},${HY - 16} C${HX + 16},${HY - 28} ${HX + 28},${HY - 20} ${HX + 28},${HY - 4} C${HX + 28},${HY + 12} ${HX + 10},${HY + 28} ${HX},${HY + 28}Z`}
      fill={c}
      stroke={OL}
      strokeWidth={SW}
    />
  ),
];

/* ═══════════════════════════════════════════════
 *  发 型  (10 种 · 前 5 男生 · 后 5 女生)
 *  每种返回 { back, front } 两个图层
 * ═══════════════════════════════════════════════ */

interface HairLayers {
  back: React.ReactNode;
  front: React.ReactNode;
}

const HAIRS: Array<(c: string) => HairLayers> = [
  /* ── 男生 ───────────────────────────────────── */

  // 0  短发刺头
  (c) => ({
    back: (
      <path
        d={`M${HX - HR + 2},${HY + 4} C${HX - HR + 2},${HY - HR - 2} ${HX + HR - 2},${HY - HR - 2} ${HX + HR - 2},${HY + 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - 20},${HY - 4} L${HX - 16},${HY - 22} L${HX - 8},${HY - 12} L${HX - 2},${HY - 26} L${HX + 4},${HY - 14} L${HX + 12},${HY - 24} L${HX + 18},${HY - 10} L${HX + 20},${HY - 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 1  平头 / 圆寸
  (c) => ({
    back: (
      <path
        d={`M${HX - HR + 4},${HY + 2} C${HX - HR + 4},${HY - HR} ${HX + HR - 4},${HY - HR} ${HX + HR - 4},${HY + 2}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - 16},${HY - 6} Q${HX},${HY - 18} ${HX + 16},${HY - 6}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 2  侧分
  (c) => ({
    back: (
      <path
        d={`M${HX - HR + 2},${HY + 4} C${HX - HR + 2},${HY - HR - 4} ${HX + HR - 2},${HY - HR - 4} ${HX + HR - 2},${HY + 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - 22},${HY + 4} L${HX - 18},${HY - HR + 8} Q${HX + 4},${HY - HR - 2} ${HX + 22},${HY - HR + 8} L${HX + 22},${HY - 2} L${HX + 10},${HY - 4} L${HX - 10},${HY - 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 3  凌乱碎发
  (c) => ({
    back: (
      <path
        d={`M${HX - HR},${HY + 6} C${HX - HR - 2},${HY - HR - 4} ${HX + HR + 2},${HY - HR - 4} ${HX + HR},${HY + 6}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - 22},${HY} L${HX - 18},${HY - HR + 4} L${HX - 10},${HY - 12} L${HX - 4},${HY - HR} L${HX + 2},${HY - 10} L${HX + 10},${HY - HR + 2} L${HX + 16},${HY - 8} L${HX + 20},${HY - HR + 6} L${HX + 22},${HY}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 4  锅盖头
  (c) => ({
    back: (
      <path
        d={`M${HX - HR - 2},${HY + 8} C${HX - HR - 2},${HY - HR - 6} ${HX + HR + 2},${HY - HR - 6} ${HX + HR + 2},${HY + 8}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - HR + 4},${HY - 4} L${HX - HR + 4},${HY - HR + 4} Q${HX},${HY - HR - 2} ${HX + HR - 4},${HY - HR + 4} L${HX + HR - 4},${HY - 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  /* ── 女生 ───────────────────────────────────── */

  // 5  长直发
  (c) => ({
    back: (
      <path
        d={`M${HX - HR - 2},${HY + 6} C${HX - HR - 2},${HY - HR - 6} ${HX + HR + 2},${HY - HR - 6} ${HX + HR + 2},${HY + 6} L${HX + HR + 4},${HY + 60} Q${HX + HR},${HY + 68} ${HX + HR - 4},${HY + 60} L${HX + HR - 6},${HY + 4} C${HX + HR - 6},${HY - HR + 2} ${HX - HR + 6},${HY - HR + 2} ${HX - HR + 6},${HY + 4} L${HX - HR + 4},${HY + 60} Q${HX - HR},${HY + 68} ${HX - HR - 4},${HY + 60}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - HR + 4},${HY - 4} L${HX - HR + 4},${HY - HR + 4} Q${HX},${HY - HR - 2} ${HX + HR - 4},${HY - HR + 4} L${HX + HR - 4},${HY - 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 6  双马尾
  (c) => ({
    back: (
      <>
        <path
          d={`M${HX - HR + 4},${HY + 2} C${HX - HR + 4},${HY - HR - 4} ${HX + HR - 4},${HY - HR - 4} ${HX + HR - 4},${HY + 2}Z`}
          fill={c}
          stroke={OL}
          strokeWidth={SW}
        />
        <path
          d={`M${HX - HR + 6},${HY - 4} Q${HX - HR - 10},${HY + 16} ${HX - HR + 4},${HY + 50}`}
          stroke={c}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${HX - HR + 6},${HY - 4} Q${HX - HR - 10},${HY + 16} ${HX - HR + 4},${HY + 50}`}
          stroke={OL}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${HX + HR - 6},${HY - 4} Q${HX + HR + 10},${HY + 16} ${HX + HR - 4},${HY + 50}`}
          stroke={c}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${HX + HR - 6},${HY - 4} Q${HX + HR + 10},${HY + 16} ${HX + HR - 4},${HY + 50}`}
          stroke={OL}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
    front: (
      <path
        d={`M${HX - HR + 6},${HY - 2} L${HX - HR + 8},${HY - HR + 6} Q${HX},${HY - HR - 2} ${HX + HR - 8},${HY - HR + 6} L${HX + HR - 6},${HY - 2} L${HX + HR - 12},${HY - 4} L${HX - HR + 12},${HY - 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 7  双丸子
  (c) => ({
    back: (
      <>
        <path
          d={`M${HX - HR + 4},${HY + 2} C${HX - HR + 4},${HY - HR - 4} ${HX + HR - 4},${HY - HR - 4} ${HX + HR - 4},${HY + 2}Z`}
          fill={c}
          stroke={OL}
          strokeWidth={SW}
        />
        <circle cx={HX - HR + 6} cy={HY - HR + 2} r={14} fill={c} stroke={OL} strokeWidth={SW} />
        <circle cx={HX + HR - 6} cy={HY - HR + 2} r={14} fill={c} stroke={OL} strokeWidth={SW} />
      </>
    ),
    front: (
      <path
        d={`M${HX - 18},${HY - 4} L${HX - 14},${HY - HR + 6} Q${HX},${HY - HR - 2} ${HX + 14},${HY - HR + 6} L${HX + 18},${HY - 4} L${HX + 10},${HY - 6} L${HX - 10},${HY - 6}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 8  波浪长卷
  (c) => ({
    back: (
      <path
        d={`M${HX - HR - 2},${HY + 6} C${HX - HR - 2},${HY - HR - 6} ${HX + HR + 2},${HY - HR - 6} ${HX + HR + 2},${HY + 6} L${HX + HR + 4},${HY + 50} Q${HX + HR + 2},${HY + 58} ${HX + HR - 2},${HY + 50} L${HX + HR - 6},${HY + 4} C${HX + HR - 6},${HY - HR + 2} ${HX - HR + 6},${HY - HR + 2} ${HX - HR + 6},${HY + 4} L${HX - HR + 2},${HY + 50} Q${HX - HR - 2},${HY + 58} ${HX - HR - 4},${HY + 50}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
    front: (
      <path
        d={`M${HX - 20},${HY - 2} Q${HX - 14},${HY - HR - 4} ${HX - 6},${HY - HR + 4} Q${HX},${HY - HR - 6} ${HX + 6},${HY - HR + 4} Q${HX + 14},${HY - HR - 4} ${HX + 20},${HY - 2} L${HX + 14},${HY - 6} L${HX - 14},${HY - 6}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),

  // 9  侧马尾
  (c) => ({
    back: (
      <>
        <path
          d={`M${HX - HR + 2},${HY + 4} C${HX - HR + 2},${HY - HR - 4} ${HX + HR - 2},${HY - HR - 4} ${HX + HR - 2},${HY + 4}Z`}
          fill={c}
          stroke={OL}
          strokeWidth={SW}
        />
        <path
          d={`M${HX + HR - 4},${HY - 4} Q${HX + HR + 14},${HY + 10} ${HX + HR + 10},${HY + 50}`}
          stroke={c}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M${HX + HR - 4},${HY - 4} Q${HX + HR + 14},${HY + 10} ${HX + HR + 10},${HY + 50}`}
          stroke={OL}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
      </>
    ),
    front: (
      <path
        d={`M${HX - HR + 4},${HY} L${HX - HR + 6},${HY - HR + 6} Q${HX},${HY - HR - 2} ${HX + HR - 4},${HY - HR + 6} L${HX + HR - 2},${HY} L${HX + HR - 8},${HY - 4} L${HX - HR + 12},${HY - 4}Z`}
        fill={c}
        stroke={OL}
        strokeWidth={SW}
      />
    ),
  }),
];

/* ═══════════════════════════════════════════════
 *  眼 睛  (6 种)
 * ═══════════════════════════════════════════════ */

const EYES = [
  // 0  大圆眼（经典）
  () => (
    <>
      <ellipse cx={ELX} cy={EY} rx={8} ry={9} fill="white" stroke={OL} strokeWidth={1.5} />
      <ellipse cx={ERX} cy={EY} rx={8} ry={9} fill="white" stroke={OL} strokeWidth={1.5} />
      <ellipse cx={ELX + 1} cy={EY + 1} rx={5} ry={6} fill="#3D2B1F" />
      <ellipse cx={ERX + 1} cy={EY + 1} rx={5} ry={6} fill="#3D2B1F" />
      <circle cx={ELX + 3} cy={EY - 2} r={2.5} fill="white" />
      <circle cx={ERX + 3} cy={EY - 2} r={2.5} fill="white" />
      <circle cx={ELX - 1} cy={EY + 3} r={1.2} fill="white" opacity={0.5} />
      <circle cx={ERX - 1} cy={EY + 3} r={1.2} fill="white" opacity={0.5} />
    </>
  ),

  // 1  开心 ^_^
  () => (
    <>
      <path
        d={`M${ELX - 8} ${EY + 2} Q${ELX} ${EY - 8} ${ELX + 8} ${EY + 2}`}
        stroke={OL}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${ERX - 8} ${EY + 2} Q${ERX} ${EY - 8} ${ERX + 8} ${EY + 2}`}
        stroke={OL}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  // 2  闪亮星星眼
  () => (
    <>
      <ellipse cx={ELX} cy={EY} rx={8} ry={9} fill="white" stroke={OL} strokeWidth={1.5} />
      <ellipse cx={ERX} cy={EY} rx={8} ry={9} fill="white" stroke={OL} strokeWidth={1.5} />
      <circle cx={ELX + 1} cy={EY + 1} r={6} fill="#3D2B1F" />
      <circle cx={ERX + 1} cy={EY + 1} r={6} fill="#3D2B1F" />
      <path
        d={`M${ELX} ${EY - 3} L${ELX + 1.5} ${EY - 0.5} L${ELX + 4} ${EY - 0.5} L${ELX + 2} ${EY + 1.5} L${ELX + 3} ${EY + 4} L${ELX} ${EY + 2.5} L${ELX - 3} ${EY + 4} L${ELX - 2} ${EY + 1.5} L${ELX - 4} ${EY - 0.5} L${ELX - 1.5} ${EY - 0.5}Z`}
        fill="white"
      />
      <path
        d={`M${ERX} ${EY - 3} L${ERX + 1.5} ${EY - 0.5} L${ERX + 4} ${EY - 0.5} L${ERX + 2} ${EY + 1.5} L${ERX + 3} ${EY + 4} L${ERX} ${EY + 2.5} L${ERX - 3} ${EY + 4} L${ERX - 2} ${EY + 1.5} L${ERX - 4} ${EY - 0.5} L${ERX - 1.5} ${EY - 0.5}Z`}
        fill="white"
      />
    </>
  ),

  // 3  豆豆小眼
  () => (
    <>
      <circle cx={ELX} cy={EY} r={4} fill="#3D2B1F" stroke={OL} strokeWidth={1.5} />
      <circle cx={ERX} cy={EY} r={4} fill="#3D2B1F" stroke={OL} strokeWidth={1.5} />
      <circle cx={ELX + 1.5} cy={EY - 1.5} r={1.5} fill="white" />
      <circle cx={ERX + 1.5} cy={EY - 1.5} r={1.5} fill="white" />
    </>
  ),

  // 4  半闭慵懒眼
  () => (
    <>
      <path
        d={`M${ELX - 8} ${EY} Q${ELX} ${EY + 6} ${ELX + 8} ${EY}`}
        stroke={OL}
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${ERX - 8} ${EY} Q${ERX} ${EY + 6} ${ERX + 8} ${EY}`}
        stroke={OL}
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  // 5  圆眼 + 睫毛
  () => (
    <>
      <ellipse cx={ELX} cy={EY} rx={7} ry={8} fill="white" stroke={OL} strokeWidth={1.5} />
      <ellipse cx={ERX} cy={EY} rx={7} ry={8} fill="white" stroke={OL} strokeWidth={1.5} />
      <ellipse cx={ELX + 1} cy={EY + 1} rx={4.5} ry={5.5} fill="#3D2B1F" />
      <ellipse cx={ERX + 1} cy={EY + 1} rx={4.5} ry={5.5} fill="#3D2B1F" />
      <circle cx={ELX + 3} cy={EY} r={2} fill="white" />
      <circle cx={ERX + 3} cy={EY} r={2} fill="white" />
      {/* 左眼睫毛 */}
      <path d={`M${ELX - 6} ${EY - 6} L${ELX - 4} ${EY - 10}`} stroke={OL} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${ELX} ${EY - 8} L${ELX} ${EY - 12}`} stroke={OL} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${ELX + 6} ${EY - 6} L${ELX + 4} ${EY - 10}`} stroke={OL} strokeWidth={1.5} strokeLinecap="round" />
      {/* 右眼睫毛 */}
      <path d={`M${ERX - 6} ${EY - 6} L${ERX - 4} ${EY - 10}`} stroke={OL} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${ERX} ${EY - 8} L${ERX} ${EY - 12}`} stroke={OL} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${ERX + 6} ${EY - 6} L${ERX + 4} ${EY - 10}`} stroke={OL} strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
];

/* ═══════════════════════════════════════════════
 *  嘴 巴  (5 种)
 * ═══════════════════════════════════════════════ */

const MOUTHS = [
  // 0  微笑
  () => (
    <path
      d={`M${HX - 6} ${MY} Q${HX} ${MY + 6} ${HX + 6} ${MY}`}
      stroke={OL}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
  ),

  // 1  大笑
  () => (
    <>
      <path
        d={`M${HX - 7} ${MY - 1} Q${HX} ${MY + 8} ${HX + 7} ${MY - 1}Z`}
        fill="#D4605A"
        stroke={OL}
        strokeWidth={1.5}
      />
      <path d={`M${HX - 4} ${MY + 2} L${HX + 4} ${MY + 2}`} stroke="white" strokeWidth={1} opacity={0.6} />
    </>
  ),

  // 2  猫嘴 ω
  () => (
    <>
      <path
        d={`M${HX - 6} ${MY} Q${HX - 3} ${MY + 4} ${HX} ${MY}`}
        stroke={OL}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${HX} ${MY} Q${HX + 3} ${MY + 4} ${HX + 6} ${MY}`}
        stroke={OL}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),

  // 3  小圆嘴 o
  () => (
    <ellipse cx={HX} cy={MY + 1} rx={3.5} ry={4} fill="#D4605A" stroke={OL} strokeWidth={1.5} />
  ),

  // 4  波浪嘴
  () => (
    <path
      d={`M${HX - 7} ${MY} Q${HX - 4} ${MY + 3} ${HX} ${MY} Q${HX + 4} ${MY - 3} ${HX + 7} ${MY}`}
      stroke={OL}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
    />
  ),
];

/* ═══════════════════════════════════════════════
 *  服 装  (8 种 · 前 4 男生 · 后 4 女生)
 *  每个绘制完整身体: 脖子 + 躯干 + 手臂 + 手 + 腿 + 脚
 * ═══════════════════════════════════════════════ */

// ── 通用手臂路径 ──
const LA = `M76,88 Q62,100 60,112 L68,116 Q72,100 84,90 Z`;
const RA = `M124,88 Q138,100 140,112 L132,116 Q128,100 116,90 Z`;
const LS = `M76,88 Q66,94 62,100 L72,100 Q76,94 84,90 Z`;
const RS = `M124,88 Q134,94 138,100 L128,100 Q124,94 116,90 Z`;

// ── 脖子 ──
const Neck = ({ sc }: { sc: string }) => (
  <rect x={94} y={74} width={12} height={8} rx={3} fill={sc} stroke={OL} strokeWidth={SW} />
);

// ── 腿部 ──
const Legs = ({ sc, pants }: { sc: string; pants?: string }) => {
  const pc = pants || sc;
  return (
    <>
      <rect x={86} y={128} width={12} height={32} rx={6} fill={pc} stroke={OL} strokeWidth={SW} />
      <rect x={102} y={128} width={12} height={32} rx={6} fill={pc} stroke={OL} strokeWidth={SW} />
    </>
  );
};

// ── 鞋子 ──
const Shoes = ({ color = SHOE }: { color?: string }) => (
  <>
    <ellipse cx={89} cy={162} rx={9} ry={4} fill={color} stroke={OL} strokeWidth={SW} />
    <ellipse cx={111} cy={162} rx={9} ry={4} fill={color} stroke={OL} strokeWidth={SW} />
  </>
);

// ── 短袖 ──
const ShortSleeves = ({ cc }: { cc: string }) => (
  <>
    <path d={LS} fill={cc} stroke={OL} strokeWidth={SW} />
    <path d={RS} fill={cc} stroke={OL} strokeWidth={SW} />
  </>
);

// ── 手 ──
const Hands = ({ sc }: { sc: string }) => (
  <>
    <circle cx={62} cy={116} r={5} fill={sc} stroke={OL} strokeWidth={SW} />
    <circle cx={138} cy={116} r={5} fill={sc} stroke={OL} strokeWidth={SW} />
  </>
);

const CLOTHINGS: Array<(cc: string, sc: string) => React.ReactNode> = [
  /* ── 男生 ───────────────────────────────────── */

  // 0  T 恤
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M76,86 Q76,84 100,84 Q124,84 124,86 L126,128 Q126,130 100,130 Q74,130 74,128 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={LA} fill={sc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={sc} stroke={OL} strokeWidth={SW} />
      <ShortSleeves cc={cc} />
      <Hands sc={sc} />
      <path d={`M90,84 Q100,92 110,84`} stroke="white" strokeWidth={1.5} fill="none" opacity={0.5} />
      <Legs sc={sc} pants="#4A6FA5" />
      <Shoes />
    </g>
  ),

  // 1  卫衣
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M74,84 Q74,82 100,82 Q126,82 126,84 L128,128 Q128,132 100,132 Q72,132 72,128 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={`M86,82 Q86,74 100,74 Q114,74 114,82`} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={LA} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={cc} stroke={OL} strokeWidth={SW} />
      <Hands sc={sc} />
      <rect x={88} y={112} width={24} height={10} rx={3} fill="none" stroke="white" strokeWidth={1} opacity={0.4} />
      <Legs sc={sc} pants="#4A6FA5" />
      <Shoes />
    </g>
  ),

  // 2  夹克
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <rect x={88} y={84} width={24} height={46} rx={2} fill="white" stroke={OL} strokeWidth={1} />
      <path
        d={`M76,86 Q76,84 88,84 L88,130 Q88,132 82,132 Q76,132 74,128 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path
        d={`M112,84 Q124,84 124,86 L126,128 Q126,132 118,132 Q112,132 112,130 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={LA} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={cc} stroke={OL} strokeWidth={SW} />
      <Hands sc={sc} />
      <path d={`M86,84 L90,92 L96,86`} fill={cc} stroke={OL} strokeWidth={1.5} />
      <path d={`M114,84 L110,92 L104,86`} fill={cc} stroke={OL} strokeWidth={1.5} />
      <Legs sc={sc} pants="#3D3D5C" />
      <Shoes />
    </g>
  ),

  // 3  校服
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M76,86 Q76,84 100,84 Q124,84 124,86 L126,128 Q126,130 100,130 Q74,130 74,128 Z`}
        fill="white"
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={`M86,84 L92,94 L100,88 L108,94 L114,84`} fill="white" stroke={OL} strokeWidth={1.5} />
      <path d={`M98,88 L100,112 L102,88 Z`} fill="#D44A4A" stroke={OL} strokeWidth={1} />
      <path d={LA} fill="white" stroke={OL} strokeWidth={SW} />
      <path d={RA} fill="white" stroke={OL} strokeWidth={SW} />
      <Hands sc={sc} />
      <Legs sc={sc} pants="#3D3D5C" />
      <Shoes color="#2D2D2D" />
    </g>
  ),

  /* ── 女生 ───────────────────────────────────── */

  // 4  T 恤 + 裙子
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M78,86 Q78,84 100,84 Q122,84 122,86 L122,116 Q122,118 100,118 Q78,118 78,116 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={`M76,116 L66,148 Q100,156 134,148 L124,116 Z`} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={LA} fill={sc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={sc} stroke={OL} strokeWidth={SW} />
      <ShortSleeves cc={cc} />
      <Hands sc={sc} />
      <rect x={88} y={146} width={10} height={16} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <rect x={102} y={146} width={10} height={16} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <Shoes />
    </g>
  ),

  // 5  连衣裙
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M78,86 Q78,84 100,84 Q122,84 122,86 L134,148 Q100,156 66,148 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={`M78,116 Q100,120 122,116`} stroke="white" strokeWidth={1} fill="none" opacity={0.3} />
      <path d={LA} fill={sc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={sc} stroke={OL} strokeWidth={SW} />
      <ShortSleeves cc={cc} />
      <Hands sc={sc} />
      <rect x={88} y={146} width={10} height={16} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <rect x={102} y={146} width={10} height={16} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <Shoes color="#E88070" />
    </g>
  ),

  // 6  女生卫衣
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M74,84 Q74,82 100,82 Q126,82 126,84 L128,128 Q128,132 100,132 Q72,132 72,128 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={`M86,82 Q86,74 100,74 Q114,74 114,82`} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={LA} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={cc} stroke={OL} strokeWidth={SW} />
      <Hands sc={sc} />
      <rect x={88} y={112} width={24} height={10} rx={3} fill="none" stroke="white" strokeWidth={1} opacity={0.4} />
      <path d={`M80,128 L72,148 Q100,154 128,148 L120,128 Z`} fill={cc} stroke={OL} strokeWidth={SW} />
      <rect x={88} y={146} width={10} height={16} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <rect x={102} y={146} width={10} height={16} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <Shoes />
    </g>
  ),

  // 7  女生校服
  (cc, sc) => (
    <g>
      <Neck sc={sc} />
      <path
        d={`M76,86 Q76,84 100,84 Q124,84 124,86 L126,128 Q126,130 100,130 Q74,130 74,128 Z`}
        fill={cc}
        stroke={OL}
        strokeWidth={SW}
      />
      <path d={`M86,84 L92,94 L100,88 L108,94 L114,84`} fill="white" stroke={OL} strokeWidth={1.5} />
      <path d={`M96,90 L100,94 L104,90 L100,88 Z`} fill="#D44A4A" stroke={OL} strokeWidth={1} />
      <path d={`M74,128 L66,156 Q100,162 134,156 L126,128 Z`} fill={cc} stroke={OL} strokeWidth={SW} />
      <line x1={82} y1={130} x2={78} y2={154} stroke="white" strokeWidth={1} opacity={0.3} />
      <line x1={92} y1={130} x2={88} y2={156} stroke="white" strokeWidth={1} opacity={0.3} />
      <line x1={100} y1={130} x2={100} y2={158} stroke="white" strokeWidth={1} opacity={0.3} />
      <line x1={108} y1={130} x2={112} y2={156} stroke="white" strokeWidth={1} opacity={0.3} />
      <line x1={118} y1={130} x2={122} y2={154} stroke="white" strokeWidth={1} opacity={0.3} />
      <path d={LA} fill={cc} stroke={OL} strokeWidth={SW} />
      <path d={RA} fill={cc} stroke={OL} strokeWidth={SW} />
      <Hands sc={sc} />
      <rect x={88} y={154} width={10} height={10} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <rect x={102} y={154} width={10} height={10} rx={5} fill={sc} stroke={OL} strokeWidth={SW} />
      <Shoes color="#2D2D2D" />
    </g>
  ),
];

/* ═══════════════════════════════════════════════
 *  配 饰  (6 种)
 * ═══════════════════════════════════════════════ */

const ACCESSORIES: Array<() => React.ReactNode> = [
  // 0  无
  () => null,

  // 1  贝雷帽
  () => (
    <>
      <ellipse cx={HX + 10} cy={HY - HR + 6} rx={22} ry={10} fill="#D44A4A" stroke={OL} strokeWidth={SW} />
      <circle cx={HX + 26} cy={HY - HR - 2} r={4} fill="#D44A4A" stroke={OL} strokeWidth={1.5} />
    </>
  ),

  // 2  蝴蝶结发饰
  () => (
    <>
      <ellipse cx={HX - 16} cy={HY - HR + 8} rx={10} ry={7} fill="#FF6B8A" stroke={OL} strokeWidth={SW} />
      <ellipse cx={HX + 16} cy={HY - HR + 8} rx={10} ry={7} fill="#FF6B8A" stroke={OL} strokeWidth={SW} />
      <circle cx={HX} cy={HY - HR + 8} r={4} fill="#E8556D" stroke={OL} strokeWidth={1.5} />
    </>
  ),

  // 3  耳机
  () => (
    <g>
      <path
        d={`M${HX - HR + 2},${HY} Q${HX - HR + 2},${HY - HR - 8} ${HX},${HY - HR - 8} Q${HX + HR - 2},${HY - HR - 8} ${HX + HR - 2},${HY}`}
        stroke="#3D3D3D"
        strokeWidth={3.5}
        fill="none"
      />
      <rect x={HX - HR - 4} y={HY - 6} width={8} height={14} rx={3} fill="#3D3D3D" stroke="#3D3D3D" />
      <rect x={HX + HR - 4} y={HY - 6} width={8} height={14} rx={3} fill="#3D3D3D" stroke="#3D3D3D" />
    </g>
  ),

  // 4  圆框眼镜
  () => (
    <g stroke="#5C4033" strokeWidth={1.8} fill="none">
      <circle cx={ELX} cy={EY} r={10} />
      <circle cx={ERX} cy={EY} r={10} />
      <path d={`M${ELX + 10},${EY} Q${HX},${EY - 3} ${ERX - 10},${EY}`} />
      <line x1={ELX - 10} y1={EY - 2} x2={ELX - 16} y2={EY - 5} strokeLinecap="round" />
      <line x1={ERX + 10} y1={EY - 2} x2={ERX + 16} y2={EY - 5} strokeLinecap="round" />
    </g>
  ),

  // 5  围巾
  () => (
    <>
      <rect x={78} y={74} width={44} height={10} rx={4} fill="#202123" stroke={OL} strokeWidth={SW} />
      <path d={`M114,78 L120,96 Q122,102 118,100 L112,82`} fill="#202123" stroke={OL} strokeWidth={SW} />
    </>
  ),
];

/* ═══════════════════════════════════════════════
 *  腮 红
 * ═══════════════════════════════════════════════ */

function Blush() {
  return (
    <>
      <ellipse cx={BLX} cy={BY} rx={7} ry={4} fill="#F4A0A0" opacity={0.5} />
      <ellipse cx={BRX} cy={BY} rx={7} ry={4} fill="#F4A0A0" opacity={0.5} />
    </>
  );
}

/* ═══════════════════════════════════════════════
 *  主 组 件
 * ═══════════════════════════════════════════════ */

export default function AvatarPreview({ avatar, size = 100 }: AvatarPreviewProps) {
  const clipId = useId();
  const {
    faceShape,
    hairstyle,
    eyeStyle,
    mouthStyle,
    clothing,
    accessory,
    skinColor,
    hairColor,
    clothingColor,
  } = avatar;

  const hair = HAIRS[hairstyle % HAIRS.length](hairColor);

  return (
    <svg viewBox="0 0 200 200" width={size} height={size}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="100" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="200" height="200" fill="#F5F5F7" />

        {/* 1. 头发后层（在身体后面） */}
        {hair.back}

        {/* 2. 身体 + 服装（含脖子、躯干、手臂、手、腿、鞋） */}
        {CLOTHINGS[clothing % CLOTHINGS.length](clothingColor, skinColor)}

        {/* 3. 头部（脸型） */}
        {FACES[faceShape % FACES.length](skinColor)}

        {/* 4. 头发前层（刘海） */}
        {hair.front}

        {/* 5. 眼睛 */}
        {EYES[eyeStyle % EYES.length]()}

        {/* 6. 嘴巴 */}
        {MOUTHS[mouthStyle % MOUTHS.length]()}

        {/* 7. 腮红 */}
        <Blush />

        {/* 8. 配饰 */}
        {ACCESSORIES[accessory % ACCESSORIES.length]?.()}
      </g>
    </svg>
  );
}

