/**
 * 兼容入口：真正的参数定义在 src/schema.ts
 * （Studio 右侧 Props 面板里能改的字段，与这里 defaultProps 一一对应）
 */
export {
  defaultProps as DEFAULT_PROPS,
  defaultProps,
  getTotalFrames,
  getTotalSeconds,
  promoPropsSchema,
  videoLayerSchema,
} from "./schema";
export type { PromoProps, VideoLayerProps } from "./schema";
