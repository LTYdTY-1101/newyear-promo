import React from "react";
import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { usePromo } from "../../PromoContext";

/**
 * 大促文案：弹性放大入场 + 描边金光，副标题上滑跟进，结束前淡出
 * 文案 / 颜色 / 字号 / 时间 / 位置 —— 全部来自 Props
 */
export const PromoCopy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = usePromo().copy;

  if (!c.enabled) return null;

  const startF = c.startAt * fps;
  const endF = (c.startAt + c.duration) * fps;

  const pop = spring({
    frame: frame - startF,
    fps,
    config: { damping: 11, stiffness: 160, mass: 0.8 },
  });
  const subIn = interpolate(frame, [startF + Math.round(0.4 * fps), startF + Math.round(0.87 * fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [startF, startF + 6, endF - 10, endF], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;

  const breath = 1 + Math.sin((frame - startF) * 0.09) * 0.025;

  return (
    <div
      style={{
        position: "absolute",
        left: c.centerX,
        top: c.centerY,
        transform: "translate(-50%, -50%)",
        textAlign: "center",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: c.mainSize,
          fontWeight: 900,
          fontFamily: "PingFang SC, Hiragino Sans GB, sans-serif",
          color: c.mainColor,
          transform: `scale(${pop * breath})`,
          WebkitTextStroke: `8px ${c.mainStroke}`,
          paintOrder: "stroke fill",
          textShadow: "0 10px 28px rgba(150,20,10,0.55), 0 0 40px rgba(255,210,110,0.5)",
          letterSpacing: 6,
          lineHeight: 1.1,
          whiteSpace: "nowrap",
        }}
      >
        {c.main}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: c.subSize,
          fontWeight: 800,
          fontFamily: "PingFang SC, Hiragino Sans GB, sans-serif",
          color: c.subColor,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 30}px)`,
          textShadow: "0 6px 18px rgba(150,20,10,0.6)",
          letterSpacing: 4,
        }}
      >
        {c.sub}
      </div>
    </div>
  );
};
