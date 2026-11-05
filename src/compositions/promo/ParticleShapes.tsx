import React from "react";

/**
 * 粒子素材：金元宝 / 金币 / 福字红包 —— 纯 SVG，柔光渐变 + 柔和阴影
 * 可直接换成图片：把 <Img src={staticFile(...)}> 替换进来即可
 */

const GOLD_GRADIENT = (
  <defs>
    <linearGradient id="yg-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#FFE9A8" />
      <stop offset="45%" stopColor="#FFC93C" />
      <stop offset="100%" stopColor="#E89B1C" />
    </linearGradient>
    <radialGradient id="yg-shine" cx="0.35" cy="0.25" r="0.6">
      <stop offset="0%" stopColor="#FFFDF2" stopOpacity="0.95" />
      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** 金元宝（顶部椭圆 + 船形底座） */
export const YuanbaoSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 200 144" style={{ display: "block", filter: "drop-shadow(0 6px 10px rgba(160,90,0,0.35))" }}>
    {GOLD_GRADIENT}
    {/* 底座 */}
    <path d="M12 96 Q100 40 188 96 Q196 130 160 136 Q100 120 40 136 Q4 130 12 96 Z" fill="url(#yg-body)" />
    {/* 中间凸起 */}
    <ellipse cx="100" cy="76" rx="62" ry="42" fill="url(#yg-body)" />
    <ellipse cx="100" cy="62" rx="58" ry="34" fill="#FFD968" />
    {/* 高光 */}
    <ellipse cx="78" cy="52" rx="26" ry="14" fill="url(#yg-shine)" />
  </svg>
);

/** 金币 */
export const CoinSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: "block", filter: "drop-shadow(0 4px 8px rgba(160,90,0,0.35))" }}>
    {GOLD_GRADIENT}
    <circle cx="60" cy="60" r="54" fill="url(#yg-body)" />
    <circle cx="60" cy="60" r="44" fill="#FFD968" />
    <rect x="46" y="46" width="28" height="28" rx="5" fill="#E89B1C" />
    <ellipse cx="44" cy="38" rx="18" ry="10" fill="url(#yg-shine)" />
  </svg>
);

/** 福字红包 */
export const RedPacketSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.72} height={size} viewBox="0 0 144 200" style={{ display: "block", filter: "drop-shadow(0 6px 10px rgba(140,10,10,0.35))" }}>
    <defs>
      <linearGradient id="rp-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#F0483E" />
        <stop offset="100%" stopColor="#C2160F" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="128" height="184" rx="18" fill="url(#rp-body)" />
    <path d="M8 26 Q72 66 136 26 L136 8 Q72 40 8 8 Z" fill="#A50E08" />
    <circle cx="72" cy="112" r="42" fill="#FFD54A" />
    <text x="72" y="132" textAnchor="middle" fontSize="52" fontWeight="900" fill="#C2160F" fontFamily="PingFang SC, sans-serif">福</text>
  </svg>
);
