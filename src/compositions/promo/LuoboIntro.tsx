import React from "react";
import { Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { usePromo } from "../../PromoContext";

/**
 * 萝卜开场动画（替换视频1/视频2）：
 *  1. popStartAt 起：从脚部原点边放大边弹出（弹簧回弹），
 *     最终高度 = 背景高 × finalHeightRatio，
 *     运动模糊 = 按缩放速度实时计算（越快越模糊 + 纵向拉伸）
 *  2. bowStartAt 起：循环作揖拜年（参考 2.MOV：双手合十、轻轻下压回正的幅度），直到 bowUntil
 *
 *  所有时间 / 尺寸 / 回弹 / 模糊都在 Props 面板可编辑
 */
export const LuoboIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { intro, background } = usePromo();

  if (!intro.enabled) return null;

  const popStartF = intro.popStartAt * fps;
  if (frame < popStartF) return null;
  if (intro.bowUntil * fps < frame) return null;

  // ---------- 弹出（弹簧 + 回弹） ----------
  const springCfg = { damping: intro.damping, stiffness: intro.stiffness, mass: 1 };
  const pop = spring({
    frame: frame - popStartF,
    fps,
    config: springCfg,
    durationInFrames: Math.max(2, Math.round(intro.popDuration * fps)),
  });
  const popPrev = spring({
    frame: frame - 1 - popStartF,
    fps,
    config: springCfg,
    durationInFrames: Math.max(2, Math.round(intro.popDuration * fps)),
  });

  const scale = interpolate(pop, [0, 1], [intro.startScale, 1]);
  const scalePrev = interpolate(popPrev, [0, 1], [intro.startScale, 1]);
  const vel = scale - scalePrev; // 每帧缩放速度（>0 放大中）

  // 运动模糊：速度越快越模糊；伴随纵向拉伸/横向压缩（速度线质感）
  const blur = Math.min(26, Math.abs(vel) * 320 * intro.motionBlur);
  const stretch = 1 + vel * 1.1 * intro.motionBlur;
  const squeeze = 1 - vel * 0.4 * intro.motionBlur;

  // ---------- 循环作揖（参考 2.MOV：轻下压 → 微停 → 回正，幅度柔和） ----------
  let bow = 0;
  if (frame >= intro.bowStartAt * fps && intro.bowPeriod > 0.05) {
    const phase = ((((frame / fps - intro.bowStartAt) % intro.bowPeriod) + intro.bowPeriod) % intro.bowPeriod) / intro.bowPeriod;
    const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
    bow = phase < 0.4 ? ease(phase / 0.4) : phase < 0.6 ? 1 : 1 - ease((phase - 0.6) / 0.4);
  }

  // 待机呼吸（非常轻微）
  const breathe = Math.sin(frame * 0.06) * 0.008;

  const finalHeight = intro.finalHeightRatio * background.height;
  const width = finalHeight * (1066 / 1476); // 保持素材比例 1066×1476

  const opacity = interpolate(frame, [popStartF, popStartF + 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scaleY = scale * stretch * (1 - bow * 0.02 + breathe);
  const scaleX = scale * squeeze * (1 + bow * 0.015);
  const rotate = bow * intro.bowAngle;
  const dipY = bow * intro.bowDip;

  return (
    <div
      style={{
        position: "absolute",
        left: intro.centerX,
        bottom: background.y + background.height - intro.footY,
        width,
        opacity,
        transform: `translateX(-50%) translateY(${dipY}px) scale(${scaleX}, ${scaleY}) rotate(${rotate}deg)`,
        transformOrigin: "bottom center",
        filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px) drop-shadow(0 16px 30px rgba(120,10,10,0.45))` : "drop-shadow(0 16px 30px rgba(120,10,10,0.45))",
        willChange: "transform, filter",
      }}
    >
      <Img src={staticFile(intro.src)} style={{ width: "100%", display: "block" }} />
    </div>
  );
};
