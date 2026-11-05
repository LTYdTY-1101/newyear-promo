import { z } from "zod";

/**
 * ============================================================
 *  年货大促动画 · 参数面板（Schema）
 * ============================================================
 *  这里的每一个字段，都会出现在 Remotion Studio 右侧的
 *  「Props」面板里，可以直接拖动/输入数值，画面实时更新。
 *
 *  下面 defaultProps 是出厂默认值，改这里 = 改默认效果。
 * ============================================================
 */

const num = (label: string, min = -4000, max = 4000) =>
  z.number().min(min).max(max).describe(label);

const str = (label: string) => z.string().describe(label);

/* ------------------------------------------------------------------
 * 视频素材层（size / position / duration 全部可编辑）
 * ------------------------------------------------------------------ */
export const videoLayerSchema = z.object({
  seqDir: str("PNG 序列目录（public 下，如 frames/video1）"),
  seqFrames: num("序列帧数（抽帧总数）", 1, 5000),
  src: str("备用素材（无序列时使用）"),
  startAt: num("开始时间（秒）", 0, 120),
  duration: num("持续时间（秒）", 0.1, 120),
  x: num("位置 X（px）", -2000, 3000),
  y: num("位置 Y（px）", -2000, 3000),
  width: num("宽（px）", 20, 3000),
  height: num("高（px）", 20, 3000),
  radius: num("圆角（px）", 0, 400),
  zoom: num("内容缩放 zoom", 0.2, 4),
  cropX: num("裁剪位移 X（px）", -1500, 1500),
  cropY: num("裁剪位移 Y（px）", -1500, 1500),
  playbackRate: num("播放倍速", 0.1, 4),
  startFrom: num("从素材第几秒开始播", 0, 60),
  fadeIn: num("淡入时长（秒）", 0, 5),
  fadeOut: num("淡出时长（秒）", 0, 5),
  opacity: num("不透明度 0-1", 0, 1),
  loop: z.boolean().describe("序列循环（关 = 播完停最后一帧）"),
});

/* ------------------------------------------------------------------ */
export const promoPropsSchema = z.object({
  canvas: z
    .object({
      width: num("画布宽（px）", 200, 4096),
      height: num("画布高（px）", 200, 4096),
      fps: num("帧率 fps", 1, 60),
    })
    .describe("画布"),

  background: z
    .object({
      src: str("背景图路径"),
      x: num("位置 X（px）", -2000, 3000),
      y: num("位置 Y（px）", -2000, 3000),
      width: num("宽（px）", 20, 4096),
      height: num("高（px）", 20, 4096),
      opacity: num("不透明度 0-1", 0, 1),
      blur: num("模糊（px）", 0, 40),
    })
    .describe("背景板"),

  video1: videoLayerSchema.describe("视频1（已由开场萝卜动画替换，备用）"),
  video2: videoLayerSchema.describe("视频2（已由作揖循环动画替换，备用）"),
  video3: videoLayerSchema.describe("结尾 · 视频3"),

  intro: z
    .object({
      enabled: z.boolean().describe("启用萝卜开场动画（替换视频1/2）"),
      src: str("萝卜素材1 路径"),
      centerX: num("中心 X（px）"),
      footY: num("脚底 Y（px）"),
      popStartAt: num("弹出开始（秒）", 0, 120),
      popDuration: num("弹出耗时（秒）", 0.05, 5),
      finalHeightRatio: num("最终高度 ÷ 背景高（0-1）", 0.05, 1),
      startScale: num("起始缩放", 0.01, 1),
      damping: num("回弹阻尼（越小回弹越大）", 3, 40),
      stiffness: num("回弹刚度", 30, 400),
      motionBlur: num("运动模糊强度 0-1", 0, 1),
      bowStartAt: num("作揖开始（秒）", 0, 120),
      bowUntil: num("作揖结束（秒）", 0, 120),
      bowPeriod: num("作揖一次周期（秒）", 0.3, 6),
      bowAngle: num("作揖摆角（度）", 0, 45),
      bowDip: num("作揖下压（px）", 0, 300),
    })
    .describe("萝卜开场动画（弹出 + 循环作揖）"),

  copy: z
    .object({
      enabled: z.boolean().describe("显示文案"),
      main: str("主标题文案"),
      mainColor: str("主标题颜色"),
      mainStroke: str("主标题描边颜色"),
      mainSize: num("主标题字号", 10, 300),
      sub: str("副标题文案"),
      subColor: str("副标题颜色"),
      subSize: num("副标题字号", 10, 200),
      startAt: num("开始时间（秒）", 0, 120),
      duration: num("持续时间（秒）", 0.2, 120),
      centerX: num("中心 X（px）", -1000, 3000),
      centerY: num("中心 Y（px）", -1000, 3000),
    })
    .describe("文案"),

  couplet: z
    .object({
      enabled: z.boolean().describe("显示对联"),
      autoMatch: z.boolean().describe("自动匹配萝卜（挂两侧、随萝卜尺寸变化）"),
      sizeRatio: num("自动模式：对联高 ÷ 萝卜高", 0.05, 1),
      edgePad: num("自动模式：距屏幕边缘（px）", 0, 500),
      headOffset: num("自动模式：顶部相对萝卜头顶下移（px）", -2000, 2000),
      leftSrc: str("左联路径"),
      rightSrc: str("右联路径"),
      width: num("手动模式：宽（px）", 20, 1000),
      height: num("手动模式：高（px）", 20, 2000),
      leftX: num("手动模式：左联中心 X（px）", -1000, 3000),
      rightX: num("手动模式：右联中心 X（px）", -1000, 3000),
      topY: num("手动模式：顶部 Y（px）", -1000, 3000),
      startAt: num("开始展开（秒）", 0, 120),
      duration: num("持续（秒）", 0.2, 120),
      unrollDuration: num("展开耗时（秒）", 0.1, 5),
      swaySpeed: num("摆动速度", 0, 6),
      swayAmplitude: num("摆动幅度（度）", 0, 30),
    })
    .describe("对联"),

  rain: z
    .object({
      enabled: z.boolean().describe("显示元宝雨"),
      src: str("粒子图片路径（设置后全部粒子用此图）"),
      startAt: num("开始时间（秒）", 0, 120),
      duration: num("持续时间（秒）", 0.5, 120),
      count: num("粒子数量", 1, 200),
      sizeMin: num("最小尺寸倍率", 0.05, 3),
      sizeMax: num("最大尺寸倍率", 0.05, 3),
      speedMin: num("最慢下落倍率", 0.1, 3),
      speedMax: num("最快下落倍率", 0.1, 5),
      sway: num("左右摆动幅度（px）", 0, 400),
      seed: num("随机种子（换一套分布）", 0, 999),
      trailGlow: z.boolean().describe("拖尾微光"),
      glowStrength: num("微光强度 0-1", 0, 1),
      ratioIngot: num("金元宝占比", 0, 1),
      ratioRedPacket: num("福字红包占比", 0, 1),
      ratioCoin: num("金币占比", 0, 1),
    })
    .describe("元宝雨"),

  luobo: z
    .object({
      syncWithIntro: z.boolean().describe("跟随开场萝卜的尺寸/位置（以用户调整版为准）"),
      footYOffset: num("跟随模式下：脚底相对开场位置的偏移（px）", -2000, 2000),
      src1: str("萝卜素材1 路径"),
      src2: str("萝卜素材2 路径"),
      width: num("宽度（px）", 20, 2000),
      centerX: num("中心 X（px）", -1000, 3000),
      footY: num("脚底 Y（px）", 0, 4000),
      startAt: num("入场时间（秒）", 0, 120),
      duration: num("持续时间（秒）", 0.3, 120),
      swayPeriod: num("左右摆动一次耗时（秒）", 0.2, 8),
      swayAngle: num("最大摆角（度）", 0, 60),
      jumpAt: num("起跳时间（秒）", 0, 120),
      jumpHeight: num("跳起高度（px）", 0, 1200),
      jumpDuration: num("滞空时长（秒）", 0.1, 5),
      morphAt: num("切换素材2 时间（秒）", 0, 120),
      morphDuration: num("过渡时长（秒）", 0.02, 3),
    })
    .describe("萝卜吉祥物"),

  pile: z
    .object({
      enabled: z.boolean().describe("显示元宝堆"),
      src: str("元宝堆图片路径"),
      width: num("宽度（px）", 20, 3000),
      centerX: num("中心 X（px）", -1000, 3000),
      bottomY: num("底边 Y（px）", 0, 4000),
      startAt: num("开始堆叠（秒）", 0, 120),
      duration: num("堆叠耗时（秒）", 0.1, 30),
      riseHeight: num("最终升起高度（px）", 0, 1500),
      scale: num("堆图放大倍数", 0.3, 3),
      offsetY: num("堆图垂直偏移（px）", -2000, 2000),
    })
    .describe("元宝堆"),

  bigYuanbao: z
    .object({
      enabled: z.boolean().describe("显示大元宝"),
      startAt: num("开始下落（秒）", 0, 120),
      duration: num("下落耗时（秒）", 0.1, 10),
      startScale: num("起始缩放", 0.01, 3),
      endScale: num("落定缩放", 0.01, 3),
      size: num("宽度（px）", 20, 1200),
      fromY: num("起点 Y（px）", -2000, 4000),
      landX: num("落点 X（px）", -1000, 3000),
      landY: num("落点 Y（px）", -2000, 4000),
      fadeAt: num("交接淡出时间（秒）", 0, 120),
      fadeDuration: num("淡出时长（秒）", 0.01, 2),
    })
    .describe("大元宝"),

  lighting: z
    .object({
      topGlow: num("顶部柔光强度 0-1", 0, 1),
      bottomGlow: num("底部补光强度 0-1", 0, 1),
      dustCount: num("微光粒子数量", 0, 200),
      dustOpacity: num("微光粒子不透明度 0-1", 0, 1),
    })
    .describe("柔和打光"),

  sound: z
    .object({
      enabled: z.boolean().describe("总开关"),
      volume: num("音量 0-1", 0, 1),
      open: str("开场音效路径"),
      unroll: str("对联展开音效路径"),
      coins: str("金币雨音效路径"),
      catch: str("接住音效路径"),
      openAt: num("开场音效时间（秒）", 0, 120),
      unrollAt: num("展开音效时间（秒）", 0, 120),
      coinsAt: num("金币音效时间（秒）", 0, 120),
      catchAt: num("接住音效时间（秒）", 0, 120),
    })
    .describe("音效"),
});

export type PromoProps = z.infer<typeof promoPropsSchema>;
export type VideoLayerProps = z.infer<typeof videoLayerSchema>;

/* ------------------------------------------------------------------
 * 出厂默认值
 * ------------------------------------------------------------------ */
export const defaultProps: PromoProps = {
  canvas: { width: 1080, height: 2340, fps: 30 },

  background: {
    src: "assets/background.png",
    x: 0,
    y: 0,
    width: 1080,
    height: 2340,
    opacity: 1,
    blur: 0,
  },

  /* 时间轴：0-2.5 视频1 / 2-4 视频2 / 4-10.5 元宝雨 / 7.1-8.4 大元宝 / 10-12 视频3 */
  video1: {
    seqDir: "frames/video1",
    seqFrames: 78,
    src: "assets/video-1.mov",
    startAt: 0,
    duration: 2.5,
    x: 90,
    y: 430,
    width: 900,
    height: 540,
    radius: 36,
    zoom: 1,
    cropX: 0,
    cropY: 0,
    playbackRate: 1,
    startFrom: 0,
    fadeIn: 0.3,
    fadeOut: 0,
    opacity: 1,
    loop: false,
  },
  video2: {
    seqDir: "frames/video2",
    seqFrames: 63,
    src: "assets/video-2.mov",
    startAt: 2,
    duration: 2,
    x: 160,
    y: 400,
    width: 760,
    height: 760,
    radius: 36,
    zoom: 1,
    cropX: 0,
    cropY: 0,
    playbackRate: 1,
    startFrom: 0,
    fadeIn: 0.5,
    fadeOut: 0.4,
    opacity: 1,
    loop: false,
  },
  video3: {
    seqDir: "frames/video3",
    seqFrames: 63,
    src: "assets/video-3.mov",
    startAt: 10,
    duration: 2,
    x: 160,
    y: 430,
    width: 760,
    height: 760,
    radius: 36,
    zoom: 1,
    cropX: 0,
    cropY: 0,
    playbackRate: 1,
    startFrom: 0,
    fadeIn: 0.7,
    fadeOut: 0,
    opacity: 1,
    loop: false,
  },

  /* 开场：1s 从底部上方 300px 处弹出放大（原点脚部、带回弹+运动模糊），2-4s 循环作揖 */
  intro: {
    enabled: true,
    src: "assets/luobo-1.png",
    centerX: 540,
    footY: 2074,
    popStartAt: 1.0,
    popDuration: 0.9,
    finalHeightRatio: 0.4,
    startScale: 0.08,
    damping: 9,
    stiffness: 110,
    motionBlur: 0.7,
    bowStartAt: 2.0,
    bowUntil: 4.0,
    bowPeriod: 1.5,
    bowAngle: 3,
    bowDip: 12,
  },

  copy: {
    enabled: true,
    main: "年货大促",
    mainColor: "#FFD54A",
    mainStroke: "#B31312",
    mainSize: 110,
    sub: "全场低至 5 折",
    subColor: "#FFFFFF",
    subSize: 62,
    startAt: 0.15,
    duration: 2.6,
    centerX: 540,
    centerY: 250,
  },

  /* 位置匹配开场萝卜：萝卜高 1170、脚底 2040，对联挂在其头部两侧 */
  /* autoMatch：对联尺寸随萝卜自动匹配（挂屏幕两侧），手动模式用 leftX/rightX/topY */
  couplet: {
    enabled: true,
    autoMatch: true,
    sizeRatio: 0.28,
    edgePad: 30,
    headOffset: 60,
    leftSrc: "assets/couplet-left.png",
    rightSrc: "assets/couplet-right.png",
    width: 160,
    height: 380,
    leftX: 95,
    rightX: 985,
    topY: 900,
    startAt: 3.0,
    duration: 1.7,
    unrollDuration: 0.8,
    swaySpeed: 1.6,
    swayAmplitude: 4,
  },

  rain: {
    enabled: true,
    src: "assets/yuanbao-particle.png",
    startAt: 4.0,
    duration: 6.5,
    count: 26,
    sizeMin: 0.35,
    sizeMax: 1.1,
    speedMin: 0.55,
    speedMax: 1.0,
    sway: 90,
    seed: 7,
    trailGlow: true,
    glowStrength: 0.55,
    ratioIngot: 0.4,
    ratioRedPacket: 0.3,
    ratioCoin: 0.3,
  },

  luobo: {
    syncWithIntro: true,
    footYOffset: 206,
    src1: "assets/luobo-1.png",
    src2: "assets/luobo-2.png",
    width: 460,
    centerX: 540,
    footY: 2280,
    startAt: 4.0,
    duration: 8.0,
    swayPeriod: 1.4,
    swayAngle: 14,
    jumpAt: 7.35,
    jumpHeight: 340,
    jumpDuration: 0.85,
    morphAt: 7.6,
    morphDuration: 0.2,
  },

  pile: {
    enabled: true,
    src: "assets/yuanbao-pile.png",
    width: 950,
    centerX: 540,
    bottomY: 2340,
    startAt: 4.4,
    duration: 2.4,
    riseHeight: 240,
    scale: 1.3,
    offsetY: -212,
  },

  bigYuanbao: {
    enabled: true,
    startAt: 7.1,
    duration: 0.5,
    startScale: 0.15,
    endScale: 1,
    size: 300,
    fromY: -260,
    landX: 540,
    landY: 1830,
    fadeAt: 7.75,
    fadeDuration: 0.1,
  },

  lighting: { topGlow: 0.5, bottomGlow: 0.35, dustCount: 18, dustOpacity: 0.45 },

  sound: {
    enabled: false,
    volume: 0.8,
    open: "sound/open.mp3",
    unroll: "sound/unroll.mp3",
    coins: "sound/coins.mp3",
    catch: "sound/catch.mp3",
    openAt: 0,
    unrollAt: 3.0,
    coinsAt: 4.0,
    catchAt: 7.55,
  },
};

/** 总时长 = 所有图层里最晚结束的那个 */
export const getTotalSeconds = (p: PromoProps): number => {
  const ends = [
    p.intro.enabled ? p.intro.bowUntil : 0,
    p.video1.startAt + p.video1.duration,
    p.video2.startAt + p.video2.duration,
    p.video3.startAt + p.video3.duration,
    p.copy.startAt + p.copy.duration,
    p.couplet.startAt + p.couplet.duration,
    p.rain.startAt + p.rain.duration,
    p.luobo.startAt + p.luobo.duration,
    p.pile.startAt + p.pile.duration,
    p.bigYuanbao.startAt + p.bigYuanbao.duration + p.bigYuanbao.fadeDuration,
  ];
  return Math.max(1, ...ends);
};

export const getTotalFrames = (p: PromoProps): number =>
  Math.max(1, Math.round(getTotalSeconds(p) * p.canvas.fps));
