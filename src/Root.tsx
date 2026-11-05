import React from "react";
import { Composition } from "remotion";
import { PromoComposition } from "./compositions/promo/VideoComposition";
import { defaultProps, getTotalFrames, promoPropsSchema } from "./schema";

/**
 * Studio 预览 / 渲染入口
 * - schema：右侧 Props 面板的可编辑字段（所有素材的大小 / 位置 / 时长）
 * - calculateMetadata：改时长或画布尺寸后，总帧数自动跟随
 */
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="newyear-promo"
      component={PromoComposition}
      schema={promoPropsSchema}
      defaultProps={defaultProps}
      durationInFrames={getTotalFrames(defaultProps)}
      fps={defaultProps.canvas.fps}
      width={defaultProps.canvas.width}
      height={defaultProps.canvas.height}
      calculateMetadata={({ props }) => ({
        durationInFrames: getTotalFrames(props),
        fps: props.canvas.fps,
        width: props.canvas.width,
        height: props.canvas.height,
      })}
    />
  );
};
