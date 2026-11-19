import React from 'react';

/**
 * Continuous Animated Walking Elephant Brand Mascot for KarigarBazaar
 * 
 * - Preserves the authentic Indian folk-art terracotta, orange, red and golden decorative patterns.
 * - Smoothly traverses from the extreme left of the viewport to the extreme right.
 * - Animates its legs, body, trunk and ears through natural walking cycle frames.
 * - Once it exits the right edge, waits ~1.5-2 seconds and seamlessly re-enters from the left.
 * - Positioned near the bottom of the viewport with pointer-events: none.
 * - Persists globally across all pages without restarting on navigation.
 * - Responsive: 145px (desktop), 110px (tablet), 84px (mobile).
 */
export default function ElephantWalkingMascot() {
  return (
    <div
      className="elephant-mascot-track select-none"
      aria-hidden="true"
      style={{ willChange: 'transform' }}
    >
      <div className="elephant-mascot-bob relative flex flex-col items-center">
        {/* Animated Walking Elephant Sprite */}
        <div
          className="elephant-sprite-walk w-[84px] h-[61px] sm:w-[110px] sm:h-[80px] lg:w-[145px] lg:h-[105px] drop-shadow-sm"
          style={{ willChange: 'background-position' }}
        />

        {/* Soft ground contact shadow */}
        <div className="w-[70%] h-1.5 bg-black/15 rounded-full blur-[1.5px] -mt-1 opacity-60" />
      </div>
    </div>
  );
}
