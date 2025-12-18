import { useEffect, useRef, useState } from "react";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { useSceneStore } from "../stores/sceneStore";

export function useGestureRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const requestRef = useRef<number>(null);

  // 新增：用于记录上次识别的时间，实现节流
  const lastPredictionTimeRef = useRef(0);

  const { isCameraEnabled, setCameraEnabled, setExploded, setIsHandOpen } =
    useSceneStore();

  // 1. 初始化 MediaPipe (保持不变)
  useEffect(() => {
    const loadRecognizer = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://pub-1e3a5383825649febccf7a08a8d30a57.r2.dev/wasm" // 本地路径
        );

        recognizerRef.current = await GestureRecognizer.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://pub-1e3a5383825649febccf7a08a8d30a57.r2.dev/gesture_recognizer.task", // 本地路径
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          }
        );

        setIsLoaded(true);
      } catch (error) {
        console.error("MediaPipe 加载失败:", error);
      }
    };
    loadRecognizer();
  }, []);

  // 2. 预测循环
  useEffect(() => {
    if (!isCameraEnabled || !isLoaded || !videoRef.current) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert("无法访问摄像头：请使用 HTTPS 或 localhost");
          setCameraEnabled(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: 640, // 降低分辨率有助于提高 CPU 模式下的性能
            height: 480,
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("摄像头启动失败:", err);
        setCameraEnabled(false);
      }
    };

    const predictWebcam = () => {
      if (
        recognizerRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4
      ) {
        // --- 性能优化关键点 ---
        const now = Date.now();
        // 如果距离上次识别不足 100ms (即 10FPS)，则跳过本次识别
        // 这能极大减轻 CPU 负担，解决卡顿问题
        if (now - lastPredictionTimeRef.current < 100) {
          requestRef.current = requestAnimationFrame(predictWebcam);
          return;
        }
        lastPredictionTimeRef.current = now;

        try {
          const results = recognizerRef.current.recognizeForVideo(
            videoRef.current,
            now
          );

          if (results.gestures.length > 0) {
            const gestureName = results.gestures[0][0].categoryName;
            const handLandmarks = results.landmarks[0];

            // --- 1. 手势控制爆炸 ---
            if (gestureName === "Open_Palm") {
              setIsHandOpen(true);
              setExploded(true);
            } else if (gestureName === "Closed_Fist") {
              setIsHandOpen(false);
              setExploded(false);
            }

            // --- 2. 手部移动控制视角 ---
            if (handLandmarks && handLandmarks[9]) {
              const x = handLandmarks[9].x;
              const y = handLandmarks[9].y;
              useSceneStore.setState({
                handPosition: { x: x - 0.5, y: y - 0.5 },
              });
            }
          }
        } catch (error) {
          console.warn("Gesture recognition error:", error);
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    startCamera();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraEnabled, isLoaded, setExploded, setIsHandOpen, setCameraEnabled]);

  return { videoRef, isLoaded };
}
