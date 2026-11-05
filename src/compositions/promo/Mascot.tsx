import React from "react";
import { Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { usePromo } from "../../PromoContext";

/**
 * 萝卜吉祥物 + 脚下元宝堆（挂在全局 Sequence，帧 = 局部帧 + globalFrameOffset）
 * 入场 / 摆动 / 起跳 / 换素材 / 元宝堆升起 —— 时间、尺寸、位置全部来自 Props
 */
export const Mascot: React.FC<{ globalFrameOffset: number }> = ({ globalFrameOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { luobo, pile, bigYuanbao, canvas, rain, intro, background } = usePromo();

  /* 萝卜素材统一基准：跟随开场萝卜的尺寸/位置（用户调整版） */
  const introH = intro.finalHeightRatio * background.height;
  const lbWidth = luobo.syncWithIntro ? introH * (1066 / 1476) : luobo.width;
  const lbCenterX = luobo.syncWithIntro ? intro.centerX : luobo.centerX;
  const lbFootY = luobo.syncWithIntro ? intro.footY + luobo.footYOffset : luobo.footY;

  const g = frame + globalFrameOffset; // 全局帧

  const appearAt = luobo.startAt * fps;
  const swayFrom = Math.max(rain.startAt, luobo.startAt) * fps;
  const swayTo = bigYuanbao.startAt * fps;

  // ---------- 入场：从下方弹入 ----------
  const enter = spring({ frame: g - appearAt, fps, config: { damping: 13, stiffness: 120 } });
  const enterY = interpolate(enter, [0, 1], [500, 0]);
  const enterOpacity = interpolate(g, [appearAt, appearAt + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- 左右转动接元宝 ----------
  const swayT = ((g - swayFrom) / (luobo.swayPeriod * fps)) * Math.PI * 2;
  const sway = g >= swayFrom && g < swayTo ? Math.sin(swayT) * luobo.swayAngle : 0;

  // ---------- 跳起接大元宝 ----------
  const jumpStart = luobo.jumpAt * fps;
  const jumpEnd = jumpStart + luobo.jumpDuration * fps;
  let jumpY = 0;
  if (g >= jumpStart && g <= jumpEnd) {
    const p = (g - jumpStart) / (jumpEnd - jumpStart);
    jumpY = luobo.jumpHeight * Math.sin(p * Math.PI); // 正值 = 向上
  }

  // ---------- 萝卜1 → 萝卜2 顺滑过渡 ----------
  const morphStart = luobo.morphAt * fps;
  const morphEnd = morphStart + luobo.morphDuration * fps;
  const morph = interpolate(g, [morphStart, morphEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---------- 落回元宝堆 Q 弹 ----------
  const settle = spring({ frame: g - jumpEnd, fps, config: { damping: 9, stiffness: 130, mass: 1.1 } });
  const settleSquash = g < jumpEnd ? 0 : (1 - settle) * 0.12;
  const cheer = g > (jumpEnd + 0.6 * fps) ? Math.sin(g * 0.18) * 3 : 0;

  // ---------- 元宝堆升起 ----------
  const pileStart = pile.startAt * fps;
  const pileH = pile.width * (897 / 1752); // 元宝堆图完整高度（按素材比例）
  const pileOffset = interpolate(
    g,
    [pileStart, pileStart + pile.duration * fps],
    [pileH, pileH - pile.riseHeight],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const commonStyle: React.CSSProperties = {
    position: "absolute",
    left: lbCenterX,
    bottom: canvas.height - lbFootY + jumpY + cheer - enterY - settleY(settle, jumpEnd, g),
    width: lbWidth,
    transform: `translateX(-50%) scaleY(${1 - settleSquash}) scaleX(${1 + settleSquash * 0.7}) rotate(${sway}deg)`,
    transformOrigin: "bottom center",
    filter: "drop-shadow(0 16px 30px rgba(120,10,10,0.45))",
  };

  return (
    <>
      {/* 萝卜（元宝堆在其脚前） */}
      <div style={{ ...commonStyle, opacity: enterOpacity * (1 - morph) }}>
        <Img src={staticFile(luobo.src1)} style={{ width: "100%", display: "block" }} />
      </div>
      <div style={{ ...commonStyle, opacity: enterOpacity * morph }}>
        <Img src={staticFile(luobo.src2)} style={{ width: "100%", display: "block" }} />
      </div>

      {/* 元宝堆（前景，慢慢升起盖住脚） */}
      {pile.enabled && (
        <div
          style={{
            position: "absolute",
            left: pile.centerX,
            bottom: canvas.height - pile.bottomY,
            width: pile.width,
            transform: `translate(-50%, ${pileOffset}px)`,
            opacity: enterOpacity,
            pointerEvents: "none",
          }}
        >
          <Img
            src={staticFile(pile.src)}
            style={{
              width: "100%",
              display: "block",
              filter: "drop-shadow(0 -8px 26px rgba(255,190,80,0.35))",
              scale: pile.scale,
              translate: `0px ${pile.offsetY}px`,
            }}
          />
        </div>
      )}
    </>
  );
};

/** 落地后的整体下压位移（回弹时身体略微下沉） */
function settleY(settle: number, jumpEnd: number, g: number): number {
  if (g < jumpEnd) return 0;
  return (1 - settle) * 26;
}

/** 大元宝：由小到大自上而下落下，被接住后交给萝卜2（自身淡出） */
export const BigYuanbao: React.FC<{ globalFrameOffset?: number }> = ({ globalFrameOffset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = usePromo().bigYuanbao;

  const g = frame + globalFrameOffset;
  const start = b.startAt * fps;
  const end = start + b.duration * fps;

  const p = interpolate(g, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (!b.enabled || p <= 0) return null;

  const ease = p * p; // 加速下落
  const y = interpolate(ease, [0, 1], [b.fromY, b.landY]);
  const scale = interpolate(p, [0, 1], [b.startScale, b.endScale]);
  const spin = interpolate(p, [0, 1], [-14, 0]);

  const fadeStart = b.fadeAt * fps;
  const fade = interpolate(g, [fadeStart, fadeStart + b.fadeDuration * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (fade <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: b.landX,
        top: y,
        width: b.size,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${spin}deg)`,
        opacity: fade,
        filter: "drop-shadow(0 14px 30px rgba(180,110,0,0.5)) drop-shadow(0 0 34px rgba(255,214,120,0.75))",
      }}
    >
      <svg width={b.size} height={b.size * 0.72} viewBox="0 0 200 144">
        <defs>
          <linearGradient id="big-yg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFEDB0" />
            <stop offset="45%" stopColor="#FFC93C" />
            <stop offset="100%" stopColor="#E89B1C" />
          </linearGradient>
        </defs>
        <path d="M12 96 Q100 40 188 96 Q196 130 160 136 Q100 120 40 136 Q4 130 12 96 Z" fill="url(#big-yg)" />
        <ellipse cx="100" cy="76" rx="62" ry="42" fill="url(#big-yg)" />
        <ellipse cx="100" cy="62" rx="58" ry="34" fill="#FFD968" />
        <ellipse cx="78" cy="52" rx="26" ry="14" fill="#FFFDF2" opacity="0.9" />
      </svg>
    </div>
  );
};
