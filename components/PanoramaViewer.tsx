"use client";

import { useEffect, useRef } from "react";

interface PanoramaViewerProps {
  imageUrl: string;
  autoRotate?: boolean;
}

declare global {
  interface Window {
    pannellum: any;
  }
}

export default function PanoramaViewer({ imageUrl, autoRotate = false }: PanoramaViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  // Effet pour charger et initialiser Pannellum une seule fois
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
        mouseZoom: true,
        compass: false,
        hotSpotDebug: false,
        hfov: 100,
        pitch: 0,
        yaw: 0,
        autoRotate: 0,
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

  // Effet séparé pour gérer l'autoRotate sans recréer le viewer
  useEffect(() => {
    if (viewerInstance.current) {
      // Mettre à jour l'autoRotate sans reset
      const config = viewerInstance.current.getConfig();
      config.autoRotate = autoRotate ? -1 : 0;
      viewerInstance.current.setUpdate(true);
    }
  }, [autoRotate]);

  return (
    <div
      ref={viewerRef}
      className="w-full h-full"
      style={{ cursor: "grab" }}
    />
  );
}
