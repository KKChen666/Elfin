import { AvatarConfig } from '../../types';

interface AvatarPreviewProps {
  avatar: AvatarConfig;
  size?: number;
}

/*
 * 萌系游戏捏脸风格
 * ─────────────────
 * 设计原则：蛋仔派对 + 动物森友会 + 经典SD比例
 * - 大头小身（头占60%+）
 * - 五官集中在脸部下半区（大额头=萌）
 * - 每个五官元素不超过3个SVG节点
 * - 腮红是最核心的萌点
 * - 扁平色块，不用opacity做层次
 */

// ── 脸型 ──────────────────────────────────────────
const HEAD_CX = 90;
const HEAD_CY = 72;
const HEAD_R = 52;

const FACE_SHAPES = [
  // 1 圆脸
  (c: string) => (
    <circle cx={HEAD_CX} cy={HEAD_CY} r={HEAD_R} fill={c} />
  ),
  // 2 鸡蛋脸（上宽下窄）
  (c: string) => (
    <path d={`M${HEAD_CX} ${HEAD_CY - HEAD_R}
      C${HEAD_CX + 58} ${HEAD_CY - HEAD_R} ${HEAD_CX + 56} ${HEAD_CY + 40} ${HEAD_CX} ${HEAD_CY + HEAD_R}
      C${HEAD_CX - 56} ${HEAD_CY + 40} ${HEAD_CX - 58} ${HEAD_CY - HEAD_R} ${HEAD_CX} ${HEAD_CY - HEAD_R}Z`}
      fill={c} />
  ),
  // 3 肉嘟嘟（宽圆）
  (c: string) => (
    <ellipse cx={HEAD_CX} cy={HEAD_CY} rx={HEAD_R + 4} ry={HEAD_R - 2} fill={c} />
  ),
  // 4 馒头脸（扁圆）
  (c: string) => (
    <ellipse cx={HEAD_CX} cy={HEAD_CY} rx={HEAD_R - 2} ry={HEAD_R - 5} fill={c} />
  ),
  // 5 小方脸（超圆角矩形）
  (c: string) => (
    <rect x={HEAD_CX - HEAD_R} y={HEAD_CY - HEAD_R + 2}
      width={HEAD_R * 2} height={HEAD_R * 2 - 2} rx={HEAD_R * 0.45} fill={c} />
  ),
  // 6 瓜子脸（尖下巴）
  (c: string) => (
    <path d={`M${HEAD_CX} ${HEAD_CY - HEAD_R}
      C${HEAD_CX + 54} ${HEAD_CY - HEAD_R} ${HEAD_CX + 50} ${HEAD_CY + 20} ${HEAD_CX} ${HEAD_CY + HEAD_R + 2}
      C${HEAD_CX - 50} ${HEAD_CY + 20} ${HEAD_CX - 54} ${HEAD_CY - HEAD_R} ${HEAD_CX} ${HEAD_CY - HEAD_R}Z`}
      fill={c} />
  )
];

// ── 发型 ──────────────────────────────────────────
// 简洁的色块剪影，1-3个path构成
const HAIRSTYLES = [
  // 1 短发
  (c: string) => (
    <path d={`M${HEAD_CX - HEAD_R + 4} ${HEAD_CY + 2}
      C${HEAD_CX - HEAD_R + 4} ${HEAD_CY - 48} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY - 48} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY + 2}
      L${HEAD_CX + HEAD_R - 8} ${HEAD_CY - 30}
      Q${HEAD_CX} ${HEAD_CY - 54} ${HEAD_CX - HEAD_R + 8} ${HEAD_CY - 30}Z`}
      fill={c} />
  ),
  // 2 长直发
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 10}
        C${HEAD_CX - HEAD_R - 2} ${HEAD_CY - 52} ${HEAD_CX + HEAD_R + 2} ${HEAD_CY - 52} ${HEAD_CX + HEAD_R + 2} ${HEAD_CY + 10}
        L${HEAD_CX + HEAD_R + 2} ${HEAD_CY + 58}
        L${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 52}
        L${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 8}
        C${HEAD_CX + HEAD_R - 6} ${HEAD_CY - 38} ${HEAD_CX - HEAD_R + 6} ${HEAD_CY - 38} ${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 8}
        L${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 52}
        L${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 58}Z`}
        fill={c} />
    </>
  ),
  // 3 齐刘海
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 2} ${HEAD_CY + 4}
        C${HEAD_CX - HEAD_R + 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R - 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R - 2} ${HEAD_CY + 4}
        L${HEAD_CX + HEAD_R - 2} ${HEAD_CY - 18}
        L${HEAD_CX - HEAD_R + 2} ${HEAD_CY - 18}Z`}
        fill={c} />
      <path d={`M${HEAD_CX - HEAD_R + 2} ${HEAD_CY + 4}
        L${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 30}
        L${HEAD_CX - HEAD_R + 14} ${HEAD_CY + 26}
        L${HEAD_CX - HEAD_R + 10} ${HEAD_CY + 4}Z`}
        fill={c} />
      <path d={`M${HEAD_CX + HEAD_R - 2} ${HEAD_CY + 4}
        L${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 30}
        L${HEAD_CX + HEAD_R - 14} ${HEAD_CY + 26}
        L${HEAD_CX + HEAD_R - 10} ${HEAD_CY + 4}Z`}
        fill={c} />
    </>
  ),
  // 4 双丸子头
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 2}
        C${HEAD_CX - HEAD_R + 6} ${HEAD_CY - 40} ${HEAD_CX + HEAD_R - 6} ${HEAD_CY - 40} ${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 2}Z`}
        fill={c} />
      <circle cx={HEAD_CX - HEAD_R + 8} cy={HEAD_CY - 38} r={16} fill={c} />
      <circle cx={HEAD_CX + HEAD_R - 8} cy={HEAD_CY - 38} r={16} fill={c} />
    </>
  ),
  // 5 双马尾
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 4} ${HEAD_CY}
        C${HEAD_CX - HEAD_R + 4} ${HEAD_CY - 46} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY - 46} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY}Z`}
        fill={c} />
      <path d={`M${HEAD_CX - HEAD_R + 6} ${HEAD_CY - 8}
        Q${HEAD_CX - HEAD_R - 16} ${HEAD_CY + 20} ${HEAD_CX - HEAD_R + 2} ${HEAD_CY + 52}`}
        stroke={c} strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d={`M${HEAD_CX + HEAD_R - 6} ${HEAD_CY - 8}
        Q${HEAD_CX + HEAD_R + 16} ${HEAD_CY + 20} ${HEAD_CX + HEAD_R - 2} ${HEAD_CY + 52}`}
        stroke={c} strokeWidth={10} strokeLinecap="round" fill="none" />
    </>
  ),
  // 6 丸子头（单个发髻）
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 4} ${HEAD_CY + 2}
        C${HEAD_CX - HEAD_R + 4} ${HEAD_CY - 46} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY - 46} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY + 2}Z`}
        fill={c} />
      <circle cx={HEAD_CX} cy={HEAD_CY - HEAD_R - 4} r={14} fill={c} />
    </>
  ),
  // 7 斜刘海
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 2} ${HEAD_CY + 6}
        C${HEAD_CX - HEAD_R + 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R - 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R - 2} ${HEAD_CY + 6}
        L${HEAD_CX + HEAD_R - 2} ${HEAD_CY - 10}
        L${HEAD_CX - 10} ${HEAD_CY - 6}
        L${HEAD_CX - HEAD_R + 12} ${HEAD_CY - 26}
        L${HEAD_CX - HEAD_R + 2} ${HEAD_CY - 14}Z`}
        fill={c} />
    </>
  ),
  // 8 高马尾
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 2}
        C${HEAD_CX - HEAD_R + 6} ${HEAD_CY - 44} ${HEAD_CX + HEAD_R - 6} ${HEAD_CY - 44} ${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 2}Z`}
        fill={c} />
      <path d={`M${HEAD_CX + 8} ${HEAD_CY - 42}
        Q${HEAD_CX + 20} ${HEAD_CY - 56} ${HEAD_CX + 30} ${HEAD_CY - 42}
        Q${HEAD_CX + 24} ${HEAD_CY - 28} ${HEAD_CX + 14} ${HEAD_CY - 32}`}
        fill={c} />
      <path d={`M${HEAD_CX + 16} ${HEAD_CY - 44}
        Q${HEAD_CX + 8} ${HEAD_CY - 60} ${HEAD_CX + 4} ${HEAD_CY - 44}`}
        fill={c} />
    </>
  ),
  // 9 爆炸头
  (c: string) => (
    <>
      <circle cx={HEAD_CX - 30} cy={HEAD_CY - 22} r={22} fill={c} />
      <circle cx={HEAD_CX + 30} cy={HEAD_CY - 22} r={22} fill={c} />
      <circle cx={HEAD_CX} cy={HEAD_CY - 36} r={24} fill={c} />
      <circle cx={HEAD_CX - 16} cy={HEAD_CY - 32} r={20} fill={c} />
      <circle cx={HEAD_CX + 16} cy={HEAD_CY - 32} r={20} fill={c} />
    </>
  ),
  // 10 呆毛短发
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 4} ${HEAD_CY + 2}
        C${HEAD_CX - HEAD_R + 4} ${HEAD_CY - 48} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY - 48} ${HEAD_CX + HEAD_R - 4} ${HEAD_CY + 2}
        L${HEAD_CX + HEAD_R - 8} ${HEAD_CY - 30}
        Q${HEAD_CX} ${HEAD_CY - 54} ${HEAD_CX - HEAD_R + 8} ${HEAD_CY - 30}Z`}
        fill={c} />
      <path d={`M${HEAD_CX - 4} ${HEAD_CY - 48}
        Q${HEAD_CX - 12} ${HEAD_CY - 68} ${HEAD_CX + 2} ${HEAD_CY - 72}
        Q${HEAD_CX + 6} ${HEAD_CY - 62} ${HEAD_CX + 6} ${HEAD_CY - 46}`}
        fill={c} />
    </>
  ),
  // 11 波波头
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 14}
        C${HEAD_CX - HEAD_R - 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R + 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R + 2} ${HEAD_CY + 14}
        C${HEAD_CX + HEAD_R + 2} ${HEAD_CY + 32} ${HEAD_CX + 10} ${HEAD_CY + 36} ${HEAD_CX} ${HEAD_CY + 32}
        C${HEAD_CX - 10} ${HEAD_CY + 36} ${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 32} ${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 14}Z`}
        fill={c} />
    </>
  ),
  // 12 中分长发
  (c: string) => (
    <>
      <path d={`M${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 12}
        C${HEAD_CX - HEAD_R - 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R + 2} ${HEAD_CY - 50} ${HEAD_CX + HEAD_R + 2} ${HEAD_CY + 12}
        L${HEAD_CX + HEAD_R + 2} ${HEAD_CY + 56}
        L${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 50}
        L${HEAD_CX + HEAD_R - 6} ${HEAD_CY + 8}
        C${HEAD_CX + HEAD_R - 6} ${HEAD_CY - 36} ${HEAD_CX + 8} ${HEAD_CY - 40} ${HEAD_CX + 4} ${HEAD_CY - 16}
        C${HEAD_CX} ${HEAD_CY - 40} ${HEAD_CX - HEAD_R + 6} ${HEAD_CY - 36} ${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 8}
        L${HEAD_CX - HEAD_R + 6} ${HEAD_CY + 50}
        L${HEAD_CX - HEAD_R - 2} ${HEAD_CY + 56}Z`}
        fill={c} />
    </>
  )
];

// ── 眼睛 ──────────────────────────────────────────
// 极简：白底 + 瞳孔 + 高光，最多3层
const EYE_L_X = 68;
const EYE_R_X = 112;
const EYE_Y = 84;

const EYE_STYLES = [
  // 1 大圆眼（经典萌系）
  () => (
    <>
      <circle cx={EYE_L_X} cy={EYE_Y} r={9} fill="#2D2A26" />
      <circle cx={EYE_R_X} cy={EYE_Y} r={9} fill="#2D2A26" />
      <circle cx={EYE_L_X + 3} cy={EYE_Y - 3} r={3.5} fill="white" />
      <circle cx={EYE_R_X + 3} cy={EYE_Y - 3} r={3.5} fill="white" />
    </>
  ),
  // 2 弯弯笑眼（^_^）
  () => (
    <>
      <path d={`M${EYE_L_X - 8} ${EYE_Y + 2} Q${EYE_L_X} ${EYE_Y - 8} ${EYE_L_X + 8} ${EYE_Y + 2}`}
        stroke="#2D2A26" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={`M${EYE_R_X - 8} ${EYE_Y + 2} Q${EYE_R_X} ${EYE_Y - 8} ${EYE_R_X + 8} ${EYE_Y + 2}`}
        stroke="#2D2A26" strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  ),
  // 3 豆豆眼（动物森友会风）
  () => (
    <>
      <circle cx={EYE_L_X} cy={EYE_Y} r={4.5} fill="#2D2A26" />
      <circle cx={EYE_R_X} cy={EYE_Y} r={4.5} fill="#2D2A26" />
    </>
  ),
  // 4 星星眼
  () => (
    <>
      <circle cx={EYE_L_X} cy={EYE_Y} r={9} fill="#2D2A26" />
      <circle cx={EYE_R_X} cy={EYE_Y} r={9} fill="#2D2A26" />
      <path d={`M${EYE_L_X} ${EYE_Y - 4} L${EYE_L_X + 2} ${EYE_Y - 1} L${EYE_L_X + 5} ${EYE_Y - 1} L${EYE_L_X + 3} ${EYE_Y + 1.5} L${EYE_L_X + 4} ${EYE_Y + 4.5} L${EYE_L_X} ${EYE_Y + 3} L${EYE_L_X - 4} ${EYE_Y + 4.5} L${EYE_L_X - 3} ${EYE_Y + 1.5} L${EYE_L_X - 5} ${EYE_Y - 1} L${EYE_L_X - 2} ${EYE_Y - 1}Z`}
        fill="white" />
      <path d={`M${EYE_R_X} ${EYE_Y - 4} L${EYE_R_X + 2} ${EYE_Y - 1} L${EYE_R_X + 5} ${EYE_Y - 1} L${EYE_R_X + 3} ${EYE_Y + 1.5} L${EYE_R_X + 4} ${EYE_Y + 4.5} L${EYE_R_X} ${EYE_Y + 3} L${EYE_R_X - 4} ${EYE_Y + 4.5} L${EYE_R_X - 3} ${EYE_Y + 1.5} L${EYE_R_X - 5} ${EYE_Y - 1} L${EYE_R_X - 2} ${EYE_Y - 1}Z`}
        fill="white" />
    </>
  ),
  // 5 下垂眼（无辜感）
  () => (
    <>
      <ellipse cx={EYE_L_X} cy={EYE_Y + 1} rx={7} ry={8} fill="#2D2A26" />
      <ellipse cx={EYE_R_X} cy={EYE_Y + 1} rx={7} ry={8} fill="#2D2A26" />
      <circle cx={EYE_L_X + 2} cy={EYE_Y - 1} r={3} fill="white" />
      <circle cx={EYE_R_X + 2} cy={EYE_Y - 1} r={3} fill="white" />
    </>
  ),
  // 6 半眯眼（慵懒）
  () => (
    <>
      <path d={`M${EYE_L_X - 8} ${EYE_Y} Q${EYE_L_X} ${EYE_Y + 5} ${EYE_L_X + 8} ${EYE_Y}`}
        stroke="#2D2A26" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d={`M${EYE_R_X - 8} ${EYE_Y} Q${EYE_R_X} ${EYE_Y + 5} ${EYE_R_X + 8} ${EYE_Y}`}
        stroke="#2D2A26" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </>
  ),
  // 7 大椭圆眼
  () => (
    <>
      <ellipse cx={EYE_L_X} cy={EYE_Y} rx={8} ry={10} fill="#2D2A26" />
      <ellipse cx={EYE_R_X} cy={EYE_Y} rx={8} ry={10} fill="#2D2A26" />
      <circle cx={EYE_L_X + 2} cy={EYE_Y - 3} r={4} fill="white" />
      <circle cx={EYE_R_X + 2} cy={EYE_Y - 3} r={4} fill="white" />
    </>
  ),
  // 8 泪汪汪
  () => (
    <>
      <circle cx={EYE_L_X} cy={EYE_Y} r={9} fill="#2D2A26" />
      <circle cx={EYE_R_X} cy={EYE_Y} r={9} fill="#2D2A26" />
      <circle cx={EYE_L_X + 2} cy={EYE_Y - 3} r={4} fill="white" />
      <circle cx={EYE_R_X + 2} cy={EYE_Y - 3} r={4} fill="white" />
      <circle cx={EYE_L_X - 2} cy={EYE_Y + 2} r={2} fill="white" opacity="0.6" />
      <circle cx={EYE_R_X - 2} cy={EYE_Y + 2} r={2} fill="white" opacity="0.6" />
    </>
  )
];

// ── 嘴巴 ──────────────────────────────────────────
// 极小，位于脸部下方
const MOUTH_Y = 104;

const MOUTH_STYLES = [
  // 1 微笑
  () => (
    <path d={`M82 ${MOUTH_Y} Q90 ${MOUTH_Y + 7} 98 ${MOUTH_Y}`}
      stroke="#D4605A" strokeWidth={2.2} fill="none" strokeLinecap="round" />
  ),
  // 2 大笑（张嘴）
  () => (
    <path d={`M83 ${MOUTH_Y - 1} Q90 ${MOUTH_Y + 10} 97 ${MOUTH_Y - 1}Z`}
      fill="#D4605A" />
  ),
  // 3 ω嘴（猫嘴，超萌）
  () => (
    <>
      <path d={`M83 ${MOUTH_Y} Q86.5 ${MOUTH_Y + 5} 90 ${MOUTH_Y}`}
        stroke="#D4605A" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M90 ${MOUTH_Y} Q93.5 ${MOUTH_Y + 5} 97 ${MOUTH_Y}`}
        stroke="#D4605A" strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  ),
  // 4 小圆嘴（惊讶）
  () => (
    <ellipse cx={90} cy={MOUTH_Y + 2} rx={4} ry={4.5} fill="#D4605A" />
  ),
  // 5 吐舌
  () => (
    <>
      <path d={`M83 ${MOUTH_Y} Q90 ${MOUTH_Y + 7} 97 ${MOUTH_Y}`}
        stroke="#D4605A" strokeWidth={2} fill="none" strokeLinecap="round" />
      <ellipse cx={90} cy={MOUTH_Y + 5} rx={4} ry={3} fill="#FF8888" />
    </>
  ),
  // 6 一字嘴（淡定）
  () => (
    <path d={`M85 ${MOUTH_Y + 2} L95 ${MOUTH_Y + 2}`}
      stroke="#D4605A" strokeWidth={2.2} strokeLinecap="round" />
  )
];

// ── 腮红 ──────────────────────────────────────────
const BLUSH_Y = 96;
const BLUSH_L = 56;
const BLUSH_R = 124;

function CheekBlush() {
  return (
    <>
      <ellipse cx={BLUSH_L} cy={BLUSH_Y} rx={10} ry={6} fill="#FF8A80" />
      <ellipse cx={BLUSH_R} cy={BLUSH_Y} rx={10} ry={6} fill="#FF8A80" />
    </>
  );
}

// ── 身体 + 服饰 ──────────────────────────────────
const BODY_TOP = 122;

const CLOTHING_STYLES = [
  // 1 T恤
  (c: string) => (
    <>
      {/* 脖子 */}
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      {/* 身体 */}
      <path d={`M58 ${BODY_TOP + 8} Q58 ${BODY_TOP - 2} 90 ${BODY_TOP - 2} Q122 ${BODY_TOP - 2} 122 ${BODY_TOP + 8} L126 ${BODY_TOP + 60} Q126 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q54 ${BODY_TOP + 68} 54 ${BODY_TOP + 60}Z`}
        fill={c} />
      {/* 袖子 */}
      <ellipse cx={54} cy={BODY_TOP + 14} rx={10} ry={8} fill={c} />
      <ellipse cx={126} cy={BODY_TOP + 14} rx={10} ry={8} fill={c} />
      {/* 手 */}
      <circle cx={46} cy={BODY_TOP + 18} r={6} fill="#F5CBA7" />
      <circle cx={134} cy={BODY_TOP + 18} r={6} fill="#F5CBA7" />
      {/* 领口 */}
      <path d={`M78 ${BODY_TOP + 4} Q90 ${BODY_TOP + 14} 102 ${BODY_TOP + 4}`}
        stroke="white" strokeWidth={1.5} fill="none" opacity="0.6" />
    </>
  ),
  // 2 衬衫
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M56 ${BODY_TOP + 10} Q56 ${BODY_TOP - 4} 90 ${BODY_TOP - 4} Q124 ${BODY_TOP - 4} 124 ${BODY_TOP + 10} L128 ${BODY_TOP + 62} Q128 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q52 ${BODY_TOP + 68} 52 ${BODY_TOP + 62}Z`}
        fill={c} />
      <ellipse cx={52} cy={BODY_TOP + 16} rx={10} ry={8} fill={c} />
      <ellipse cx={128} cy={BODY_TOP + 16} rx={10} ry={8} fill={c} />
      <circle cx={44} cy={BODY_TOP + 20} r={6} fill="#F5CBA7" />
      <circle cx={136} cy={BODY_TOP + 20} r={6} fill="#F5CBA7" />
      {/* 纽扣 */}
      <circle cx={90} cy={BODY_TOP + 18} r={1.5} fill="white" opacity="0.7" />
      <circle cx={90} cy={BODY_TOP + 30} r={1.5} fill="white" opacity="0.7" />
      <circle cx={90} cy={BODY_TOP + 42} r={1.5} fill="white" opacity="0.7" />
    </>
  ),
  // 3 卫衣
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M54 ${BODY_TOP + 12} Q54 ${BODY_TOP - 6} 90 ${BODY_TOP - 6} Q126 ${BODY_TOP - 6} 126 ${BODY_TOP + 12} L130 ${BODY_TOP + 60} Q130 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q50 ${BODY_TOP + 68} 50 ${BODY_TOP + 60}Z`}
        fill={c} />
      <ellipse cx={50} cy={BODY_TOP + 18} rx={12} ry={9} fill={c} />
      <ellipse cx={130} cy={BODY_TOP + 18} rx={12} ry={9} fill={c} />
      <circle cx={40} cy={BODY_TOP + 22} r={6} fill="#F5CBA7" />
      <circle cx={140} cy={BODY_TOP + 22} r={6} fill="#F5CBA7" />
      {/* 口袋 */}
      <rect x={72} y={BODY_TOP + 38} width={36} height={14} rx={4} fill={c} stroke="white" strokeWidth="1" opacity="0.4" />
    </>
  ),
  // 4 西装
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M54 ${BODY_TOP + 10} Q54 ${BODY_TOP - 4} 90 ${BODY_TOP - 4} Q126 ${BODY_TOP - 4} 126 ${BODY_TOP + 10} L130 ${BODY_TOP + 62} Q130 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q50 ${BODY_TOP + 68} 50 ${BODY_TOP + 62}Z`}
        fill={c} />
      <ellipse cx={50} cy={BODY_TOP + 16} rx={10} ry={8} fill={c} />
      <ellipse cx={130} cy={BODY_TOP + 16} rx={10} ry={8} fill={c} />
      <circle cx={42} cy={BODY_TOP + 20} r={6} fill="#F5CBA7" />
      <circle cx={138} cy={BODY_TOP + 20} r={6} fill="#F5CBA7" />
      {/* V领 */}
      <path d={`M76 ${BODY_TOP + 2} L90 ${BODY_TOP + 22} L104 ${BODY_TOP + 2}`}
        stroke="white" strokeWidth={1.5} fill="none" />
      <path d={`M80 ${BODY_TOP + 2} L90 ${BODY_TOP + 18} L100 ${BODY_TOP + 2}`}
        fill="white" opacity="0.15" />
    </>
  ),
  // 5 连衣裙
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M62 ${BODY_TOP + 8} Q62 ${BODY_TOP - 4} 90 ${BODY_TOP - 4} Q118 ${BODY_TOP - 4} 118 ${BODY_TOP + 8} L132 ${BODY_TOP + 68} Q132 ${BODY_TOP + 72} 90 ${BODY_TOP + 72} Q48 ${BODY_TOP + 72} 48 ${BODY_TOP + 68}Z`}
        fill={c} />
      <ellipse cx={54} cy={BODY_TOP + 14} rx={8} ry={7} fill={c} />
      <ellipse cx={126} cy={BODY_TOP + 14} rx={8} ry={7} fill={c} />
      <circle cx={48} cy={BODY_TOP + 18} r={5} fill="#F5CBA7" />
      <circle cx={132} cy={BODY_TOP + 18} r={5} fill="#F5CBA7" />
      {/* 蝴蝶结 */}
      <path d={`M84 ${BODY_TOP + 4} L90 ${BODY_TOP + 8} L96 ${BODY_TOP + 4} L90 ${BODY_TOP + 2}Z`}
        fill="white" opacity="0.5" />
    </>
  ),
  // 6 运动衫
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M52 ${BODY_TOP + 14} Q52 ${BODY_TOP - 6} 90 ${BODY_TOP - 6} Q128 ${BODY_TOP - 6} 128 ${BODY_TOP + 14} L132 ${BODY_TOP + 60} Q132 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q48 ${BODY_TOP + 68} 48 ${BODY_TOP + 60}Z`}
        fill={c} />
      <ellipse cx={48} cy={BODY_TOP + 20} rx={12} ry={9} fill={c} />
      <ellipse cx={132} cy={BODY_TOP + 20} rx={12} ry={9} fill={c} />
      <circle cx={38} cy={BODY_TOP + 24} r={6} fill="#F5CBA7" />
      <circle cx={142} cy={BODY_TOP + 24} r={6} fill="#F5CBA7" />
      {/* 条纹 */}
      <line x1={70} y1={BODY_TOP + 38} x2={110} y2={BODY_TOP + 38}
        stroke="white" strokeWidth="2" opacity="0.4" />
    </>
  ),
  // 7 格子衫
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M56 ${BODY_TOP + 10} Q56 ${BODY_TOP - 4} 90 ${BODY_TOP - 4} Q124 ${BODY_TOP - 4} 124 ${BODY_TOP + 10} L128 ${BODY_TOP + 62} Q128 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q52 ${BODY_TOP + 68} 52 ${BODY_TOP + 62}Z`}
        fill={c} />
      <ellipse cx={52} cy={BODY_TOP + 16} rx={10} ry={8} fill={c} />
      <ellipse cx={128} cy={BODY_TOP + 16} rx={10} ry={8} fill={c} />
      <circle cx={44} cy={BODY_TOP + 20} r={6} fill="#F5CBA7" />
      <circle cx={136} cy={BODY_TOP + 20} r={6} fill="#F5CBA7" />
      {/* 格纹 */}
      <line x1={72} y1={BODY_TOP + 10} x2={72} y2={BODY_TOP + 64} stroke="white" strokeWidth="0.8" />
      <line x1={90} y1={BODY_TOP + 10} x2={90} y2={BODY_TOP + 64} stroke="white" strokeWidth="0.8" />
      <line x1={108} y1={BODY_TOP + 10} x2={108} y2={BODY_TOP + 64} stroke="white" strokeWidth="0.8" />
      <line x1={56} y1={BODY_TOP + 28} x2={124} y2={BODY_TOP + 28} stroke="white" strokeWidth="0.8" />
      <line x1={54} y1={BODY_TOP + 44} x2={126} y2={BODY_TOP + 44} stroke="white" strokeWidth="0.8" />
    </>
  ),
  // 8 毛衣
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M54 ${BODY_TOP + 12} Q54 ${BODY_TOP - 6} 90 ${BODY_TOP - 6} Q126 ${BODY_TOP - 6} 126 ${BODY_TOP + 12} L128 ${BODY_TOP + 62} Q128 ${BODY_TOP + 68} 90 ${BODY_TOP + 68} Q52 ${BODY_TOP + 68} 52 ${BODY_TOP + 62}Z`}
        fill={c} />
      <ellipse cx={50} cy={BODY_TOP + 18} rx={11} ry={9} fill={c} />
      <ellipse cx={130} cy={BODY_TOP + 18} rx={11} ry={9} fill={c} />
      <circle cx={41} cy={BODY_TOP + 22} r={6} fill="#F5CBA7" />
      <circle cx={139} cy={BODY_TOP + 22} r={6} fill="#F5CBA7" />
      {/* 麻花纹 */}
      <path d={`M86 ${BODY_TOP + 12} Q88 ${BODY_TOP + 20} 86 ${BODY_TOP + 28} Q84 ${BODY_TOP + 36} 86 ${BODY_TOP + 44}`}
        stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d={`M94 ${BODY_TOP + 12} Q92 ${BODY_TOP + 20} 94 ${BODY_TOP + 28} Q96 ${BODY_TOP + 36} 94 ${BODY_TOP + 44}`}
        stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
    </>
  ),
  // 9 和服
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      <path d={`M58 ${BODY_TOP + 8} Q58 ${BODY_TOP - 4} 90 ${BODY_TOP - 4} Q122 ${BODY_TOP - 4} 122 ${BODY_TOP + 8} L136 ${BODY_TOP + 68} Q136 ${BODY_TOP + 72} 90 ${BODY_TOP + 72} Q44 ${BODY_TOP + 72} 44 ${BODY_TOP + 68}Z`}
        fill={c} />
      <ellipse cx={52} cy={BODY_TOP + 14} rx={9} ry={7} fill={c} />
      <ellipse cx={128} cy={BODY_TOP + 14} rx={9} ry={7} fill={c} />
      <circle cx={45} cy={BODY_TOP + 18} r={5} fill="#F5CBA7" />
      <circle cx={135} cy={BODY_TOP + 18} r={5} fill="#F5CBA7" />
      {/* 交领 */}
      <path d={`M82 ${BODY_TOP + 2} L90 ${BODY_TOP + 32}`}
        stroke="white" strokeWidth="2" opacity="0.5" />
      <path d={`M98 ${BODY_TOP + 2} L90 ${BODY_TOP + 32}`}
        stroke="white" strokeWidth="2" opacity="0.5" />
      {/* 腰带 */}
      <rect x={56} y={BODY_TOP + 34} width={68} height={8} rx={2} fill="white" opacity="0.3" />
    </>
  ),
  // 10 背带裤
  (c: string) => (
    <>
      <rect x={82} y={BODY_TOP - 4} width={16} height={10} rx={4} fill="#F5CBA7" />
      {/* 内搭 */}
      <path d={`M58 ${BODY_TOP + 6} Q58 ${BODY_TOP - 2} 90 ${BODY_TOP - 2} Q122 ${BODY_TOP - 2} 122 ${BODY_TOP + 6} L126 ${BODY_TOP + 60} Q126 ${BODY_TOP + 66} 90 ${BODY_TOP + 66} Q54 ${BODY_TOP + 66} 54 ${BODY_TOP + 60}Z`}
        fill="#FFE8D0" />
      {/* 背带 */}
      <rect x={70} y={BODY_TOP + 4} width={6} height={44} rx={2} fill={c} />
      <rect x={104} y={BODY_TOP + 4} width={6} height={44} rx={2} fill={c} />
      {/* 裤身 */}
      <path d={`M56 ${BODY_TOP + 34} L124 ${BODY_TOP + 34} L128 ${BODY_TOP + 66} Q128 ${BODY_TOP + 70} 90 ${BODY_TOP + 70} Q52 ${BODY_TOP + 70} 52 ${BODY_TOP + 66}Z`}
        fill={c} />
      <ellipse cx={54} cy={BODY_TOP + 12} rx={8} ry={7} fill="#FFE8D0" />
      <ellipse cx={126} cy={BODY_TOP + 12} rx={8} ry={7} fill="#FFE8D0" />
      <circle cx={48} cy={BODY_TOP + 16} r={5} fill="#F5CBA7" />
      <circle cx={132} cy={BODY_TOP + 16} r={5} fill="#F5CBA7" />
      {/* 口袋 */}
      <rect x={68} y={BODY_TOP + 46} width={16} height={12} rx={3} fill={c} stroke="white" strokeWidth="0.8" opacity="0.4" />
      <rect x={96} y={BODY_TOP + 46} width={16} height={12} rx={3} fill={c} stroke="white" strokeWidth="0.8" opacity="0.4" />
    </>
  )
];

// ── 配饰 ──────────────────────────────────────────
const ACCESSORIES = [
  // 1 无
  () => null,
  // 2 皇冠
  () => (
    <path d={`M66 28 L72 14 L80 24 L90 8 L100 24 L108 14 L114 28Z`}
      fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
  ),
  // 3 圆框眼镜
  () => (
    <>
      <circle cx={EYE_L_X} cy={EYE_Y} r={13} fill="none" stroke="#6B5B4D" strokeWidth="2" />
      <circle cx={EYE_R_X} cy={EYE_Y} r={13} fill="none" stroke="#6B5B4D" strokeWidth="2" />
      <line x1={EYE_L_X + 13} y1={EYE_Y} x2={EYE_R_X - 13} y2={EYE_Y}
        stroke="#6B5B4D" strokeWidth="2" />
      <line x1={EYE_L_X - 13} y1={EYE_Y - 2} x2={EYE_L_X - 18} y2={EYE_Y - 6}
        stroke="#6B5B4D" strokeWidth="2" strokeLinecap="round" />
      <line x1={EYE_R_X + 13} y1={EYE_Y - 2} x2={EYE_R_X + 18} y2={EYE_Y - 6}
        stroke="#6B5B4D" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // 4 蝴蝶结（头顶）
  () => (
    <>
      <ellipse cx={HEAD_CX - 18} cy={HEAD_CY - HEAD_R + 6} rx={14} ry={10} fill="#FF69B4" />
      <ellipse cx={HEAD_CX + 18} cy={HEAD_CY - HEAD_R + 6} rx={14} ry={10} fill="#FF69B4" />
      <circle cx={HEAD_CX} cy={HEAD_CY - HEAD_R + 6} r={5} fill="#FF1493" />
    </>
  ),
  // 5 渔夫帽
  () => (
    <>
      <ellipse cx={HEAD_CX} cy={HEAD_CY - HEAD_R + 12} rx={HEAD_R + 6} ry={8} fill="#4A90D9" />
      <path d={`M${HEAD_CX - 28} ${HEAD_CY - HEAD_R + 12}
        Q${HEAD_CX - 28} ${HEAD_CY - HEAD_R - 20} ${HEAD_CX} ${HEAD_CY - HEAD_R - 20}
        Q${HEAD_CX + 28} ${HEAD_CY - HEAD_R - 20} ${HEAD_CX + 28} ${HEAD_CY - HEAD_R + 12}Z`}
        fill="#4A90D9" />
    </>
  ),
  // 6 发箍
  () => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 6} ${HEAD_CY - 18}
        Q${HEAD_CX} ${HEAD_CY - HEAD_R - 6} ${HEAD_CX + HEAD_R - 6} ${HEAD_CY - 18}`}
        stroke="#E8734A" strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  ),
  // 7 耳机
  () => (
    <>
      <path d={`M${HEAD_CX - HEAD_R + 2} ${HEAD_CY - 6}
        Q${HEAD_CX - HEAD_R + 2} ${HEAD_CY - HEAD_R - 12} ${HEAD_CX} ${HEAD_CY - HEAD_R - 12}
        Q${HEAD_CX + HEAD_R - 2} ${HEAD_CY - HEAD_R - 12} ${HEAD_CX + HEAD_R - 2} ${HEAD_CY - 6}`}
        stroke="#3D3D3D" strokeWidth={4} fill="none" />
      <rect x={HEAD_CX - HEAD_R - 4} y={HEAD_CY - 12} width={10} height={16} rx={4} fill="#3D3D3D" />
      <rect x={HEAD_CX + HEAD_R - 6} y={HEAD_CY - 12} width={10} height={16} rx={4} fill="#3D3D3D" />
    </>
  ),
  // 8 星星贴纸
  () => (
    <>
      <path d={`M118 72 L120 66 L122 72 L128 72 L123 76 L125 82 L120 78 L115 82 L117 76 L112 72Z`}
        fill="#FFD700" />
      <path d={`M52 58 L53.5 54 L55 58 L59 58 L56 60.5 L57 64 L53.5 62 L50 64 L51 60.5 L48 58Z`}
        fill="#FFD700" />
    </>
  )
];

// ── 脚 ──────────────────────────────────────────
function Feet({ color }: { color: string }) {
  return (
    <>
      <ellipse cx={78} cy={BODY_TOP + 70} rx={12} ry={6} fill={color} />
      <ellipse cx={102} cy={BODY_TOP + 70} rx={12} ry={6} fill={color} />
    </>
  );
}

export default function AvatarPreview({ avatar, size = 100 }: AvatarPreviewProps) {
  const { faceShape, hairstyle, eyeStyle, mouthStyle, clothing, accessory, skinColor, hairColor, clothingColor } = avatar;

  return (
    <svg
      viewBox="0 0 180 200"
      width={size}
      height={size * (200 / 180)}
      style={{ borderRadius: '50%', background: '#FFF8F2' }}
    >
      {/* 服饰（身体层） */}
      {CLOTHING_STYLES[clothing % CLOTHING_STYLES.length](clothingColor)}

      {/* 脚 */}
      <Feet color={clothingColor} />

      {/* 脸型 */}
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
    </svg>
  );
}
