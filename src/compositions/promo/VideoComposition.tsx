import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig, interpolate, useCurrentFrame } from "remotion";
import { PromoProvider, usePromo } from "../../PromoContext";
import type { PromoProps, VideoLayerProps } from "../../schema";
import { VideoBox } from "./VideoBox";
import { Couplets } from "./Couplets";
import { PromoCopy } from "./PromoCopy";
import { YuanbaoRain } from "./YuanbaoRain";
import { Atmosphere, GlowFlash } from "./Atmosphere";
import { Mascot, BigYuanbao } from "./Mascot";
import { LuoboIntro } from "./LuoboIntro";

/**
 * ============================================================
 *  年货大促动画 · 主合成
 *  所有图层的位置 / 大小 / 时长都来自 Props（Studio 面板可改）
 * ============================================================
 */
export const PromoComposition: React.FC<PromoProps> = (props) => (
  <PromoProvider value={props}>
    <Scene />
  </PromoProvider>
);

const Scene: React.FC = () => {
  const p = usePromo();
  const { fps, durationInFrames } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);

  const total = durationInFrames;

  const catchFrame = s(p.bigYuanbao.startAt + p.bigYuanbao.duration);

  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF3E4", overflow: "hidden" }}>
      {/* ---------- 背景（画板） ---------- */}
      <Img
        src={staticFile(p.background.src)}
        style={{
          position: "absolute",
          left: p.background.x,
          top: p.background.y,
          width: p.background.width,
          height: p.background.height,
          objectFit: "cover",
          opacity: p.background.opacity,
          filter: p.background.blur > 0 ? `blur(${p.background.blur}px)` : undefined,
        }}
      />

      {/* ---------- 柔和打光 + 微光粒子 ---------- */}
      <Atmosphere />

      {/* ---------- 开场萝卜动画（替换视频1/2：1s 弹出放大 → 2-4s 循环作揖） ---------- */}
      <Sequence from={0} durationInFrames={s(p.intro.bowUntil) + 1}>
        <LuoboIntro />
      </Sequence>

      {/* ---------- 对联 + 文案（全局时间轴） ---------- */}
      <Sequence from={0} durationInFrames={total}>
        <Couplets />
        <PromoCopy />
      </Sequence>

      {/* ---------- 元宝雨 ---------- */}
      {p.rain.enabled && (
        <Sequence from={s(p.rain.startAt)} durationInFrames={s(p.rain.duration)}>
          <YuanbaoRain globalFrameOffset={s(p.rain.startAt)} />
        </Sequence>
      )}

      {/* ---------- 萝卜 + 元宝堆 ---------- */}
      <Sequence from={s(p.luobo.startAt)} durationInFrames={s(p.luobo.duration)}>
        <Mascot globalFrameOffset={s(p.luobo.startAt)} />
      </Sequence>

      {/* ---------- 大元宝落下 ---------- */}
      {p.bigYuanbao.enabled && (
        <Sequence
          from={s(p.bigYuanbao.startAt)}
          durationInFrames={s(p.bigYuanbao.duration + p.bigYuanbao.fadeDuration + 0.2)}
        >
          <BigYuanbao globalFrameOffset={s(p.bigYuanbao.startAt)} />
        </Sequence>
      )}

      {/* ---------- 接住瞬间柔光高光 ---------- */}
      <Sequence from={0} durationInFrames={total}>
        <GlowFlash
          cx={p.bigYuanbao.landX}
          cy={p.bigYuanbao.landY}
          at={catchFrame}
          duration={16}
          size={620}
        />
      </Sequence>

      {/* ---------- 视频3 ---------- */}
      <VideoSequence cfg={p.video3} />

      {/* ---------- 音效 ---------- */}
      {p.sound.enabled && (
        <>
          <Sequence from={s(p.sound.openAt)}>
            <Audio src={staticFile(p.sound.open)} volume={p.sound.volume} />
          </Sequence>
          <Sequence from={s(p.sound.unrollAt)}>
            <Audio src={staticFile(p.sound.unroll)} volume={p.sound.volume} />
          </Sequence>
          <Sequence from={s(p.sound.coinsAt)}>
            <Audio src={staticFile(p.sound.coins)} volume={p.sound.volume} />
          </Sequence>
          <Sequence from={s(p.sound.catchAt)}>
            <Audio src={staticFile(p.sound.catch)} volume={p.sound.volume} />
          </Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};

/** 单个视频层的包装：位置/大小/时长全由配置决定 */
const VideoSequence: React.FC<{ cfg: VideoLayerProps }> = ({ cfg }) => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  if (cfg.duration <= 0) return null;
  return (
    <Sequence from={s(cfg.startAt)} durationInFrames={s(cfg.duration)}>
      <VideoBox cfg={cfg} />
    </Sequence>
  );
};

/* ------------------------------------------------------------------ */
/** 尾部淡出包装器（备用） */
export const FadeOutAt: React.FC<{ duration: number; fadeFrames: number; children: React.ReactNode }> = ({
  duration,
  fadeFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [duration - fadeFrames, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
