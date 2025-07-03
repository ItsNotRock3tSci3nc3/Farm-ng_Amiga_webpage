"use client";
import { useEffect, useRef, useState } from "react";

export default function ControllerPage() {
  const [leftStick, setLeftStick] = useState({ x: 0, y: 0 });
  const [rightStick, setRightStick] = useState({ x: 0, y: 0 });
  const [frontCameraFrame, setFrontCameraFrame] = useState<string | null>(null);
  const [rearCameraFrame, setRearCameraFrame] = useState<string | null>(null);
  const frontFrameUrlRef = useRef<string | null>(null);
  const rearFrameUrlRef = useRef<string | null>(null);

  // Camera URLs
  const CAMERA_WS_URL_1 = "ws://100.97.75.64:8000/ws/camera/1";
  const CAMERA_WS_URL_2 = "ws://100.97.75.64:8000/ws/camera/2";

  // Gamepad polling
  useEffect(() => {
    let animationFrame: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0];
      if (gp) {
        setLeftStick({ x: gp.axes[0], y: gp.axes[1] });
        setRightStick({ x: gp.axes[2], y: gp.axes[3] });
      }
      animationFrame = requestAnimationFrame(pollGamepad);
    };

    pollGamepad();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Camera WebSocket connections
  useEffect(() => {
    // Clean up previous frame URLs
    return () => {
      if (frontFrameUrlRef.current) URL.revokeObjectURL(frontFrameUrlRef.current);
      if (rearFrameUrlRef.current) URL.revokeObjectURL(rearFrameUrlRef.current);
    };
  }, []);

  useEffect(() => {
    // Front camera
    const ws1 = new WebSocket(CAMERA_WS_URL_1);
    ws1.binaryType = "arraybuffer";
    ws1.onmessage = (event) => {
      if (typeof event.data === "object") {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        if (frontFrameUrlRef.current) URL.revokeObjectURL(frontFrameUrlRef.current);
        frontFrameUrlRef.current = url;
        setFrontCameraFrame(url);
      }
    };
    //ws1.onerror = (err) => console.error("Front camera WebSocket error:", err);
    ws1.onclose = () => console.log("Front camera WebSocket closed");

    // Rear camera
    const ws2 = new WebSocket(CAMERA_WS_URL_2);
    ws2.binaryType = "arraybuffer";
    ws2.onmessage = (event) => {
      if (typeof event.data === "object") {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        if (rearFrameUrlRef.current) URL.revokeObjectURL(rearFrameUrlRef.current);
        rearFrameUrlRef.current = url;
        setRearCameraFrame(url);
      }
    };
    //ws2.onerror = (err) => console.error("Rear camera WebSocket error:", err);
    ws2.onclose = () => console.log("Rear camera WebSocket closed");

    return () => {
      ws1.close();
      ws2.close();
    };
  }, [CAMERA_WS_URL_1, CAMERA_WS_URL_2]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Controller Page</h1>
      <p>Connect a gamepad and move the joysticks to see their values.</p>
      <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Gamepad Data Panel */}
        <div className="flex-1">
          <h2 className="font-semibold">Left Stick</h2>
          <p>X: {leftStick.x.toFixed(2)} | Y: {leftStick.y.toFixed(2)}</p>
          <h2 className="font-semibold mt-4">Right Stick</h2>
          <p>X: {rightStick.x.toFixed(2)} | Y: {rightStick.y.toFixed(2)}</p>
        </div>
        {/* Live Camera Feed Panel 1 */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Front Camera Live Camera Feed</h2>
          {frontCameraFrame ? (
            <img
              src={frontCameraFrame}
              alt="Farm-ng Live Feed Front Camera"
              className="w-full max-w-xl border rounded"
            />
          ) : (
            <div className="text-gray-500">Waiting for front camera feed...</div>
          )}
        </div>
        {/* Live Camera Feed Panel 2 */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Rear Camera Live Camera Feed</h2>
          {rearCameraFrame ? (
            <img
              src={rearCameraFrame}
              alt="Farm-ng Live Feed Rear Camera"
              className="w-full max-w-xl border rounded"
            />
          ) : (
            <div className="text-gray-500">Waiting for rear camera feed...</div>
          )}
        </div>
      </div>
    </main>
  );
}