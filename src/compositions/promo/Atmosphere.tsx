import React from "react";
import { AbsoluteFill, useCurrentFrame, random, interpolate } from "remotion";
import { usePromo } from "../../PromoContext";

/**
 * 柔和打光氛围层：顶部暖金柔光 + 底部补光 + 空气微光粒子（OC 渲染质感）
 * 强度 / 粒子数量 —— 来自 Props
 */
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { lighting, canvas } = usePromo();

  const dust = Array.from({ length: Math.round(lighting.dustCount) }, (_, i) => {
    const x0 = random(`dx-${i}`) * canvas.width;
    const y0 = random(`dy-${i}`) * canvas.height;
    const speed = 0.2 + random(`ds-${i}`) * 0.5;
    const size = 3 + random(`dz-${i}`) * 7;
    const phase = random(`dp-${i}`) * Math.PI * 2;
    const x = x0 + Math.sin(frame * 0.02 + phase) * 26;
    const y = y0 - ((frame * speed) % (canvas.height + 100));
    const tw = 0.55 + 0.45 * Math.sin(frame * 0.12 + phase * 3);
    return {
      x,
      y: ((y % (canvas.height + 100)) + canvas.height + 100) % (canvas.height + 100),
      size,
      tw,
    };
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* 顶部暖金柔光 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 130% 55% at 50% -8%, rgba(255,214,130,0.75), rgba(255,190,90,0.25) 45%, rgba(255,170,60,0) 75%)",
          opacity: lighting.topGlow,
          mixBlendMode: "screen",
        }}
      />
      {/* 底部暖色补光 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 120% 40% at 50% 108%, rgba(255,120,60,0.35), rgba(255,120,60,0) 70%)",
          opacity: lighting.bottomGlow,
          mixBlendMode: "screen",
        }}
      />
      {/* 微光粒子 */}
      {dust.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,244,200,0.95), rgba(255,220,130,0) 70%)",
            opacity: lighting.dustOpacity * d.tw,
            filter: "blur(1px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** 柔光光晕（接住元宝时的高光闪烁） */
export const GlowFlash: React.FC<{ cx: number; cy: number; at: number; duration?: number; size?: number }> = ({
  cx,
  cy,
  at,
  duration = 18,
  size = 500,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (p <= 0 || p >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        width: size,
        height: size,
        transform: `translate(-50%,-50%) scale(${0.5 + p * 0.8})`,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,240,190,0.95), rgba(255,200,90,0.4) 40%, rgba(255,190,80,0) 70%)",
        opacity: (1 - p) * 0.95,
        filter: "blur(6px)",
        pointerEvents: "none",
      }}
    />
  );
};
