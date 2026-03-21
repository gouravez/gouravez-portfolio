"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useMotionValue, useSpring } from "motion/react";
import { cn } from "../lib/utils.js";

const MOVEMENT_DAMPING = 1400;

const GLOBE_CONFIG = {
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1,            
  diffuse: 1.2,
  mapSamples: 6000,
  mapBrightness: 1.4,

  baseColor: [0.95, 0.95, 0.97],   
  markerColor: [1, 0.4, 0.1],      
  glowColor: [0.8, 0.8, 1],        

  // markers: [
  //   { location: [19.076, 72.8777], size: 0.1 },   // Mumbai
  //   { location: [28.6139, 77.209], size: 0.08 },  // Delhi
  //   { location: [40.7128, -74.006], size: 0.1 },  // New York
  //   { location: [51.5072, -0.1276], size: 0.08 }, // London
  //   { location: [35.6762, 139.6503], size: 0.07 } // Tokyo
  // ],
};

export function Globe({ className, config = GLOBE_CONFIG }) {
  const canvasRef = useRef(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);

  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    // fallback to avoid 0 width issue
    if (!widthRef.current) widthRef.current = 500;

    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: widthRef.current,
      height: widthRef.current,
      scale: 0.9,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.005;
        }

        state.phi = phiRef.current + rs.get();
        state.width = widthRef.current;
        state.height = widthRef.current;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    }, 0);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config]);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[600px] aspect-square",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-0 transition-opacity duration-500"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}