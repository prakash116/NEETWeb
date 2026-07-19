'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface RevealProps extends HTMLMotionProps<'div'> {
  /** Seconds — used to stagger cards inside a grid (index * 0.08). */
  delay?: number;
}

/**
 * Fade-up-once scroll reveal for landing sections. Root MotionConfig
 * (reducedMotion="user") disables the translation for reduced-motion users.
 */
export function Reveal({ delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      {...props}
    />
  );
}
