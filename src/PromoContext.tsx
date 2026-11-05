import React, { createContext, useContext } from "react";
import { defaultProps, type PromoProps } from "./schema";

/**
 * 参数上下文：Studio 里改 Props → 顶层重新渲染 → 所有图层拿到新值
 * 各图层组件统一用 usePromo() 读取，不再写死常量
 */
const PromoContext = createContext<PromoProps>(defaultProps);

export const PromoProvider: React.FC<{ value: PromoProps; children: React.ReactNode }> = ({
  value,
  children,
}) => <PromoContext.Provider value={value}>{children}</PromoContext.Provider>;

export const usePromo = (): PromoProps => useContext(PromoContext);
