"use client";

import { useEffect, useRef } from "react";

interface PanoramaViewerProps {
  imageUrl: string;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export default function PanoramaViewer({ imageUrl }: PanoramaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    // Charger le CSS de Pannellum
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.pannellum.org/2.5/pannellum.css";
    document.head.appendChild(link);

    // Charger le script de Pannellum
    const script = document.createElement("script");
    script.src = "https://cdn.pannellum.org/2.5/pannellum.js";
    script.async = true;
    
    script.onload = () => {
      if (!viewerRef.current || !imageUrl || !window.pannellum) return;

      // Initialiser Pannellum après le chargement du script
      viewerInstance.current = window.pannellum.viewer(viewerRef.current, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showControls: false,
        mouseZoom: false,
        compass: false,
        hotSpotDebug: false,
        hfov: 100,
        pitch: 0,
        yaw: 0,
      });
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (viewerInstance.current && viewerInstance.current.destroy) {
        viewerInstance.current.destroy();
      }
      document.head.removeChild(link);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [imageUrl]);

  return (
    <div
      ref={viewerRef}
      className="w-full h-full"
      style={{ cursor: "grab" }}
    />
  );
}
