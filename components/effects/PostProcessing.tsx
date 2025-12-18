import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";

export default function PostProcessing() {
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        intensity={1.0} // 稍微降低强度 1.5 -> 1.0
        kernelSize={KernelSize.HUGE} // 使用更大的模糊核，让光晕更扩散、更柔和，而不是刺眼的一个点
        luminanceThreshold={1.5} // 保持高阈值
        luminanceSmoothing={0.9} // 大幅增加平滑度 (0.3 -> 0.9)，让光晕边缘非常柔和
        mipmapBlur
      />
    </EffectComposer>
  );
}
