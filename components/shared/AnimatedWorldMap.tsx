'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Approximate locations for dots on the map (percentage)
// Based on typical Robinson/Mercator projection
const LOCATIONS = [
  { x: 18, y: 35 }, // North America West
  { x: 28, y: 38 }, // North America East
  { x: 32, y: 65 }, // South America
  { x: 48, y: 28 }, // Europe West
  { x: 52, y: 30 }, // Europe East
  { x: 55, y: 50 }, // Africa Central
  { x: 65, y: 35 }, // Middle East
  { x: 75, y: 32 }, // Asia China
  { x: 82, y: 35 }, // Japan
  { x: 78, y: 55 }, // SE Asia
  { x: 85, y: 75 }, // Australia
]

export function AnimatedWorldMap() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* Map Image */}
      <div className="absolute inset-0 opacity-[0.15] flex items-center justify-center translate-y-10 scale-110">
        <Image
           src="/world-map.svg"
           alt="World Map"
           width={1000}
           height={600}
           className="w-full h-full object-contain"
           priority
        />
      </div>

      {/* Animated Dots Layer */}
      {/* We center this container to match the map image placement */}
      <div className="absolute inset-0 flex items-center justify-center translate-y-10 scale-110">
         <div className="relative w-full h-full">
            {/* We assume the image fills the container mostly. 
                We use the same object-contain logic implicitly by using % coordinates 
                that match the SVG structure.
            */}
            
            {LOCATIONS.map((loc, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                {/* Ping Animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    scale: [0.5, 2.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.8, // Staggered start
                    ease: "easeOut"
                  }}
                  className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-indigo-400 rounded-full"
                />
                
                {/* Static Dot */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
                    className="w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50" 
                />
              </div>
            ))}
            
            {/* Connecting Lines (Optional - connecting random points) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
               <motion.path
                  d={`M ${LOCATIONS[1].x}% ${LOCATIONS[1].y}% Q 40% 10% ${LOCATIONS[3].x}% ${LOCATIONS[3].y}%`}
                  fill="none"
                  stroke="url(#gradient-line)"
                  strokeWidth="1"
                  strokeDasharray="10 10"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               />
               <defs>
                 <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="transparent" />
                   <stop offset="50%" stopColor="#6366f1" />
                   <stop offset="100%" stopColor="transparent" />
                 </linearGradient>
               </defs>
            </svg>
         </div>
      </div>
    </div>
  )
}
