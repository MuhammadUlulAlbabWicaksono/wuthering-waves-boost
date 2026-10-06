"use client";

import { Fragment, type ElementType } from "react";
import { motion, type Variants } from "framer-motion";

type Part = { text: string; className?: string };
type Props = { parts: Part[]; as?: ElementType | string; className?: string };

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 15 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  },
};

export function BlurText({ parts, as = "h2", className }: Props) {
  // Gunakan elemen motion dinamis berdasarkan prop 'as' (default: h2)
  const MotionTag = (motion as any)[as as string] || motion.div;
  const label = parts.map((p) => p.text).join(" ");

  return (
    <MotionTag
      className={className}
      aria-label={label}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={containerVariants}
    >
      {parts.flatMap((part, pi) =>
        part.text.split(" ").map((word, wi) => (
          <Fragment key={`${pi}-${wi}`}>
            <motion.span
              aria-hidden="true"
              variants={wordVariants}
              className={`inline-block mr-[0.25em] ${part.className ?? ""}`}
            >
              {word}
            </motion.span>
          </Fragment>
        ))
      )}
    </MotionTag>
  );
}
