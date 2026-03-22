"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export const Timeline = ({ data }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ✅ Correct scroll tracking
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start end", "end start"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section className="relative py-20" ref={containerRef}>
      <h2 className="text-heading c-space">My Work Experience</h2>

      <div ref={contentRef} className="relative mt-10">
        {/* Timeline Items */}
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-32 md:gap-10"
          >
            {/* Left Side (Sticky) */}
            <div className="sticky top-32 z-40 flex flex-col items-center self-start max-w-xs md:flex-row lg:max-w-sm md:w-full">
              {/* Dot */}
              <div className="absolute flex items-center justify-center w-10 h-10 rounded-full -left-3.5 bg-midnight">
                <div className="w-4 h-4 border rounded-full bg-neutral-800 border-neutral-700" />
              </div>

              {/* Desktop Text */}
              <div className="flex-col hidden gap-2 text-xl font-bold md:flex md:pl-20 md:text-3xl text-neutral-300">
                <h3>{item.date}</h3>
                <h3 className="text-neutral-400">{item.title}</h3>
                <h3 className="text-neutral-500">{item.job}</h3>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative w-full pl-20 pr-4 md:pl-4">
              {/* Mobile Text */}
              <div className="block mb-4 text-xl font-bold text-neutral-300 md:hidden">
                <h3>{item.date}</h3>
                <h3>{item.job}</h3>
              </div>

              {/* Content */}
              <ul className="space-y-2 text-neutral-400">
                {item.contents.map((content, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-sm">•</span>
                    <span>{content}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* Timeline Line (Background) */}
        <div
          style={{ height: height }}
          className="absolute top-0 left-1 w-0.5 bg-neutral-700"
        >
          {/* Animated Progress Line */}
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute top-0 left-0 w-full bg-purple-500 rounded-full"
          />
        </div>
      </div>
    </section>
  );
};