"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    // Charger Three.js
    const threeScript = document.createElement("script");
    threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
    threeScript.async = true;

    threeScript.onload = () => {
      // Charger Vanta Dots après Three.js
      const vantaScript = document.createElement("script");
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js";
      vantaScript.async = true;

      vantaScript.onload = () => {
        if (window.VANTA && vantaRef.current) {
          vantaEffect.current = window.VANTA.DOTS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 2.0,
            scaleMobile: 1.0,
            color: 0xf20f0f,
            color2: 0xc5c1be,
            backgroundColor: 0x1b0808,
            size: 6.0,
            spacing: 200.0,
            showLines: true,
          });
        }
      };

      document.body.appendChild(vantaScript);
    };

    document.body.appendChild(threeScript);

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  return <div ref={vantaRef} className="fixed inset-0 -z-10" />;
}
