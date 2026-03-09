import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import type { ChipSpec } from '../../types/chip';
import chipsData from '../../data/chips.json';

// Register ScrollTrigger for GSAP
gsap.registerPlugin(ScrollTrigger);

const chips = chipsData as ChipSpec[];

// Sort chips by release date for the timeline
const sortedChips = [...chips].sort((a, b) => 
  new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
);

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we are on a desktop matching the md breakpoint
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    
    if (!isDesktop || !containerRef.current || !scrollRef.current) return;

    // Calculate total horizontal scroll width
    const totalScroll = scrollRef.current.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      // Horizontal scrolling effect using GSAP ScrollTrigger
      gsap.to(scrollRef.current, {
        x: () => -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          start: "top 20%",
          end: () => `+=${totalScroll}`,
          invalidateOnRefresh: true
        }
      });
      
      // Animate items appearing as they scroll into view
      gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((item) => {
        gsap.from(item, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: item,
            containerAnimation: gsap.getById('horizontal-scroll') || undefined, // Not required for simple scrub, but good practice
            start: "left 80%",
            toggleActions: "play none none reverse"
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative">
      <div className="md:hidden space-y-8 pl-8 border-l-2 border-glass relative">
        {/* Mobile Vertical Timeline */}
        {sortedChips.map((chip, index) => (
          <div key={`${chip.id}-mobile`} className="relative">
            <div 
              className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-bg-color z-10" 
              style={{ backgroundColor: chip.color }}
            />
            <div className="glass p-5 rounded-2xl">
              <span className="text-sm text-text-sub font-mono mb-1 block">{chip.releaseDate}</span>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chip.color }}></span>
                {chip.name}
              </h3>
              <p className="text-sm mb-3">
                {chip.series.toUpperCase()} Series • {chip.processNode} • {chip.cpu.totalCores}CPU / {chip.gpu.cores}GPU
              </p>
              {chip.highlights[0] && (
                <p className="text-sm text-text-sub border-t border-glass pt-2">
                  {chip.highlights[0]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Horizontal Timeline */}
      <div 
        ref={containerRef} 
        className="hidden md:block overflow-hidden h-[60vh] relative items-center flex"
      >
        <div ref={scrollRef} className="flex flex-nowrap gap-12 px-[10vw] min-w-max items-center h-full">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-[-100vw] h-1 bg-glass -translate-y-1/2 -z-10" />

          {sortedChips.map((chip, index) => {
            const isTop = index % 2 === 0;
            return (
              <div 
                key={`${chip.id}-desktop`} 
                className={`timeline-item relative w-80 shrink-0 flex flex-col ${isTop ? 'justify-end pb-8' : 'justify-start pt-8'} h-[300px]`}
                style={{ marginTop: isTop ? '-150px' : '150px' }}
              >
                {/* Node dot on timeline */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-bg-color z-10 transition-transform hover:scale-150 cursor-pointer`}
                  style={{ 
                    backgroundColor: chip.color,
                    [isTop ? 'bottom' : 'top']: '-12px'
                  }}
                />
                
                {/* Connection line */}
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-glass -z-10`}
                  style={{
                    height: '24px',
                    [isTop ? 'bottom' : 'top']: 0
                  }}
                />

                <div className="glass p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all">
                  <span className="text-xs text-text-sub font-mono mb-2 block tracking-widest uppercase">{chip.releaseDate}</span>
                  <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                    {chip.name}
                  </h3>
                  <div className="space-y-1 text-sm text-text-sub mb-4">
                    <p>Node: <span className="text-text-main font-medium">{chip.processNode}</span></p>
                    <p>CPU: <span className="text-text-main font-medium">{chip.cpu.totalCores}</span> Cores</p>
                    <p>GPU: <span className="text-text-main font-medium">{chip.gpu.cores}</span> Cores</p>
                  </div>
                  {chip.highlights.length > 0 && (
                    <div className="text-xs font-medium border-t border-glass pt-3 text-text-main">
                      {chip.highlights[0]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
