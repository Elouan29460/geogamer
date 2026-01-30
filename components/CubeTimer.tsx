"use client";

import { useEffect, useRef } from "react";

interface CubeTimerProps {
  timer: number;
  maxTime: number;
}

export default function CubeTimer({ timer, maxTime }: CubeTimerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cubeGroupRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationIdRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const currentTimerRef = useRef<number>(timer);
  const lastSecondRef = useRef<number>(timer);
  const lastSecondChangeTimeRef = useRef<number>(0);
  const lastEffectTimeRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const isInitializedRef = useRef<boolean>(false);


  // Initialisation de la scène (une seule fois)
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Empêcher la double initialisation (React Strict Mode)
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initThree = () => {
      const THREE = (window as any).THREE;
      if (!THREE || !containerRef.current) return;

      // Configuration de la scène
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 4;
      
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(160, 160);
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;
      containerRef.current.appendChild(renderer.domElement);

      // Créer un groupe pour le cube
      const cubeGroup = new THREE.Group();
      cubeGroupRef.current = cubeGroup;
      scene.add(cubeGroup);

      // Créer le cube avec les textures initiales
      const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
      const materials = [];
      
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      
      for (let i = 0; i < 6; i++) {
        ctx.clearRect(0, 0, 256, 256);
        ctx.fillStyle = 'rgba(10, 25, 60, 1)';
        ctx.fillRect(0, 0, 256, 256);
        
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 140px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timer.toString(), 128, 128);
        ctx.shadowBlur = 0;
        
        const texture = new THREE.CanvasTexture(canvas);
        materials.push(new THREE.MeshBasicMaterial({ map: texture, transparent: false }));
      }
      
      const cube = new THREE.Mesh(geometry, materials);
      cubeGroup.add(cube);
      
      // Créer des particules autour du cube
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = 30;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 6;
        positions[i + 1] = (Math.random() - 0.5) * 6;
        positions[i + 2] = (Math.random() - 0.5) * 6;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0x64c8ff,
        size: 0.08,
        transparent: true,
        opacity: 0
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      particlesRef.current.push(particles);
      cubeGroup.add(particles);

      // Animation
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        
        if (cubeGroupRef.current) {
          cubeGroupRef.current.rotation.y += 0.004;
          cubeGroupRef.current.rotation.x += 0.002;
          
          // Effet aléatoire de particules scintillantes
          const now = Date.now();
          if (now - lastEffectTimeRef.current > 3000 && Math.random() > 0.98) {
            lastEffectTimeRef.current = now;
            particlesMaterial.opacity = 0.8;
          }
          
          // Fade out des particules
          if (particlesMaterial.opacity > 0) {
            particlesMaterial.opacity -= 0.01;
          }
          
          // Rotation des particules
          if (particles) {
            particles.rotation.y += 0.002;
            particles.rotation.x += 0.001;
          }
        }
        
        renderer.render(scene, camera);
      };
      
      animate();
    };

    // Vérifier si Three.js est déjà chargé
    if ((window as any).THREE) {
      initThree();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
      script.async = true;
      script.onload = initThree;
      document.head.appendChild(script);
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current) {
        // Ne retirer le canvas que s'il est encore dans le container
        const container = containerRef.current;
        if (container && rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      // Réinitialiser après un court délai pour éviter les re-montages rapides
      setTimeout(() => {
        isInitializedRef.current = false;
      }, 100);
    };
  }, []);

  // Mise à jour du timer et des arêtes
  useEffect(() => {
    currentTimerRef.current = timer;
    
    // Détecter le changement de seconde pour l'effet de diffusion
    if (timer !== lastSecondRef.current && timer <= 10) {
      lastSecondChangeTimeRef.current = Date.now();
    }
    
    // Animation spéciale quand on passe à 10 secondes
    if (timer === 10 && lastSecondRef.current === 11) {
      const container = containerRef.current;
      if (container) {
        container.classList.add('animate-[shake_0.5s_ease-in-out]', 'scale-110');
        setTimeout(() => {
          container.classList.remove('animate-[shake_0.5s_ease-in-out]', 'scale-110');
        }, 500);
      }
    }
    
    lastSecondRef.current = timer;
    
    // Réinitialiser le temps de départ quand le timer est à maxTime (nouveau round)
    if (timer === maxTime) {
      startTimeRef.current = Date.now();
    }
  }, [timer, maxTime]);

  // Animation continue pour la bordure rouge
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Attendre que THREE soit chargé
    const waitForThree = setInterval(() => {
      const THREE = (window as any).THREE;
      if (!THREE || !cubeGroupRef.current) return;

      clearInterval(waitForThree);

      const cube = cubeGroupRef.current.children[0];
      if (!cube) return;

      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      
      const updateCanvas = () => {
        const elapsedMs = Date.now() - startTimeRef.current;
        const elapsedSeconds = Math.min(elapsedMs / 1000, maxTime);
        const remainingTime = maxTime - elapsedSeconds;
        const progress = 1 - (remainingTime / maxTime);
        
        // Effet de reflet bleuté qui se déplace
        const time = Date.now() / 3000; // Cycle de 3 secondes
        const reflectionPosition = (time % 1) * 2 - 0.5; // De -0.5 à 1.5
        
        for (let i = 0; i < 6; i++) {
          ctx.clearRect(0, 0, 256, 256);
          ctx.fillStyle = 'rgba(10, 25, 60, 1)';
          ctx.fillRect(0, 0, 256, 256);
          
          // Dessiner l'effet de reflet bleuté
          const reflectionX = reflectionPosition * 256;
          const gradient = ctx.createLinearGradient(reflectionX - 100, 0, reflectionX + 100, 0);
          gradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
          gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 256, 256);
          
          // Effet de flash aléatoire
          const now = Date.now();
          if (now - lastEffectTimeRef.current < 300) {
            const flashIntensity = 1 - ((now - lastEffectTimeRef.current) / 300);
            const flashGradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 180);
            flashGradient.addColorStop(0, `rgba(100, 200, 255, ${flashIntensity * 0.3})`);
            flashGradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
            ctx.fillStyle = flashGradient;
            ctx.fillRect(0, 0, 256, 256);
          }
          
          // Dessiner la bordure rouge progressive
          if (progress > 0) {
            const borderWidth = 16;
            const margin = 20;
            
            const seg1 = 128 - margin;
            const seg2 = 256 - 2 * margin;
            const seg3 = 256 - 2 * margin;
            const seg4 = 256 - 2 * margin;
            const seg5 = 128 - margin;
            
            const totalPerimeter = seg1 + seg2 + seg3 + seg4 + seg5;
            const currentLength = progress * totalPerimeter;
            
            ctx.lineWidth = borderWidth;
            ctx.strokeStyle = '#ff0044';
            ctx.shadowColor = '#ff0044';
            ctx.shadowBlur = 40;
            ctx.lineCap = 'square';
            
            ctx.beginPath();
            ctx.moveTo(128, margin);
            
            let distance = 0;
            
            if (currentLength > distance) {
              const draw = Math.min(currentLength - distance, seg1);
              ctx.lineTo(128 + draw, margin);
              distance += seg1;
            }
            
            if (currentLength > distance) {
              const draw = Math.min(currentLength - distance, seg2);
              ctx.lineTo(256 - margin, margin + draw);
              distance += seg2;
            }
            
            if (currentLength > distance) {
              const draw = Math.min(currentLength - distance, seg3);
              ctx.lineTo(256 - margin - draw, 256 - margin);
              distance += seg3;
            }
            
            if (currentLength > distance) {
              const draw = Math.min(currentLength - distance, seg4);
              ctx.lineTo(margin, 256 - margin - draw);
              distance += seg4;
            }
            
            if (currentLength > distance) {
              const draw = Math.min(currentLength - distance, seg5);
              ctx.lineTo(margin + draw, margin);
            }
            
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          
          // Effet de diffusion rouge dans les 10 dernières secondes
          if (currentTimerRef.current <= 10) {
            const timeSinceChange = Date.now() - lastSecondChangeTimeRef.current;
            const diffusionDuration = 800;
            
            if (timeSinceChange < diffusionDuration) {
              const diffusionProgress = timeSinceChange / diffusionDuration;
              const radius = 80 + (diffusionProgress * 60);
              const opacity = (1 - diffusionProgress) * 0.8;
              
              const diffusionGradient = ctx.createRadialGradient(128, 128, 40, 128, 128, radius);
              diffusionGradient.addColorStop(0, `rgba(255, 0, 68, 0)`);
              diffusionGradient.addColorStop(0.7, `rgba(255, 0, 68, ${opacity * 0.3})`);
              diffusionGradient.addColorStop(1, `rgba(255, 0, 68, 0)`);
              
              ctx.fillStyle = diffusionGradient;
              ctx.fillRect(0, 0, 256, 256);
            }
            
            const pulseIntensity = Math.abs(Math.sin(Date.now() / 200)) * 30 + 20;
            ctx.shadowColor = '#ff0044';
            ctx.shadowBlur = pulseIntensity;
          } else {
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 12;
          }
          
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.fillStyle = 'white';
          ctx.font = 'bold 140px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(currentTimerRef.current.toString(), 128, 128);
          
          ctx.shadowBlur = 0;
          
          const texture = new THREE.CanvasTexture(canvas);
          cube.material[i].map = texture;
          cube.material[i].needsUpdate = true;
        }
      };
      
      updateCanvas();
      intervalId = setInterval(updateCanvas, 50);
    }, 100);

    return () => {
      clearInterval(waitForThree);
      if (intervalId) clearInterval(intervalId);
    };
  }, [maxTime]);

  return <div ref={containerRef} className="w-40 h-40 transition-transform duration-300" />;
}
