import React, { useMemo } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, random, interpolate, useVideoConfig } from "remotion";
import { usePromo } from "../../PromoContext";
import type { PromoProps } from "../../schema";
import { YuanbaoSVG, CoinSVG, RedPacketSVG } from "./ParticleShapes";

/**
 * 元宝雨粒子系统
 * 数量 / 大小范围 / 速度范围 / 摆动幅度 / 随机种子 / 拖尾微光 —— 全部来自 Props
 * 类型：金元宝 / 福字红包 / 金币，按占比随机
 */

type RainCfg = PromoProps["rain"];

type P = {
  x0: number;
  size: number;
  speed: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  spin: number;
  spinSpeed: number;
  type: "ingot" | "packet" | "coin";
  delay: number;
};

const makeParticles = (r: RainCfg, canvasW: number): P[] => {
  const list: P[] = [];
  const n = Math.max(0, Math.round(r.count));
  for (let i = 0; i < n; i++) {
    const t = random(`type-${i}-${r.seed}`);
    const type: P["type"] =
      t < r.ratioIngot ? "ingot" : t < r.ratioIngot + r.ratioRedPacket ? "packet" : "coin";
    list.push({
      x0: random(`x-${i}-${r.seed}`) * canvasW,
      size: r.sizeMin + random(`s-${i}-${r.seed}`) * (r.sizeMax - r.sizeMin),
      speed: Math.max(0.05, r.speedMin + random(`v-${i}-${r.seed}`) * (r.speedMax - r.speedMin)),
      swayAmp: r.sway * (0.4 + random(`a-${i}-${r.seed}`) * 0.9),
      swayFreq: 0.4 + random(`f-${i}-${r.seed}`) * 0.8,
      phase: random(`p-${i}-${r.seed}`) * Math.PI * 2,
      spin: (random(`r-${i}-${r.seed}`) - 0.5) * 40,
      spinSpeed: (random(`rs-${i}-${r.seed}`) - 0.5) * 2.4,
      type,
      delay: random(`d-${i}-${r.seed}`) * 60, // 入场错峰（帧）
    });
  }
  return list;
};

/** 单个下落粒子的位置（输入该图层的局部帧） */
const particleState = (p: P, f: number, canvasH: number, baseFallFrames: number) => {
  const ff = f - p.delay;
  const fallFrames = baseFallFrames / p.speed;
  const progress = ((ff % fallFrames) + fallFrames) % fallFrames / fallFrames;
  const y = -160 + progress * (canvasH + 320);
  const x = p.x0 + Math.sin(ff * 0.05 * p.swayFreq + p.phase) * p.swayAmp;
  const rot = p.spin + ff * p.spinSpeed;
  return { x, y, rot };
};

const ParticleSprite: React.FC<{ p: P; frame: number; rain: RainCfg; canvasH: number }> = ({
  p,
  frame,
  rain,
  canvasH,
}) => {
  const { x, y, rot } = particleState(p, frame, canvasH, 150);
  const base = 150 * p.size;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg)`,
        willChange: "transform",
      }}
    >
      {rain.trailGlow && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: base * 1.4,
            height: base * 2.6,
            transform: "translate(-50%, -38%)",
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(255,225,140,0.9), rgba(255,190,80,0.35) 45%, rgba(255,170,60,0) 72%)",
            filter: "blur(10px)",
            opacity: rain.glowStrength,
            borderRadius: "50%",
          }}
        />
      )}
      {rain.src ? (
        /* 统一使用自定义粒子图（如 assets/yuanbao-particle.png） */
        <Img
          src={staticFile(rain.src)}
          style={{
            width: p.type === "coin" ? base * 0.8 : base,
            display: "block",
            filter: "drop-shadow(0 10px 22px rgba(255,180,60,0.45))",
          }}
        />
      ) : (
        <>
          {p.type === "ingot" && <YuanbaoSVG size={base} />}
          {p.type === "packet" && <RedPacketSVG size={base} />}
          {p.type === "coin" && <CoinSVG size={base * 0.8} />}
        </>
      )}
    </div>
  );
};

/** 元宝雨图层（Sequence 从 rain.startAt 开始，局部帧 0 = 开始时刻） */
export const YuanbaoRain: React.FC<{ globalFrameOffset: number }> = ({ globalFrameOffset }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { rain, canvas } = usePromo();

  const particles = useMemo(
    () => makeParticles(rain, canvas.width),
    [rain.count, rain.seed, rain.sizeMin, rain.sizeMax, rain.speedMin, rain.speedMax, rain.sway, rain.ratioIngot, rain.ratioRedPacket, canvas.width]
  );

  if (!rain.enabled) return null;

  const durFrames = Math.max(1, Math.round(rain.duration * fps));
  const opacity = interpolate(frame, [0, 12, durFrames - 15, durFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;

  const globalFrame = frame + globalFrameOffset;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {particles.map((p, i) => (
        <ParticleSprite key={i} p={p} frame={globalFrame} rain={rain} canvasH={canvas.height} />
      ))}
    </AbsoluteFill>
  );
};
