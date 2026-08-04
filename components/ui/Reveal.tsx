"use client";

import { motion, type Variants } from "framer-motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

type RevealAs = "div" | "section" | "ul" | "ol" | "header" | "footer" | "article";

type RevealProps = {
  as?: RevealAs;
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  /** Use this to stagger children — pairs with <RevealItem> */
  stagger?: number;
  amount?: number;
};

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  variants,
  stagger,
  amount,
}: RevealProps) {
  const prefersReduced = useReducedMotionPref();

  if (prefersReduced) {
    return renderPlain(as, className, children);
  }

  const resolved =
    variants ?? (stagger ? staggerContainer(stagger, delay) : fadeUp);

  const props = {
    className,
    initial: "hidden" as const,
    whileInView: "visible" as const,
    viewport: amount ? { once: true, amount } : viewportOnce,
    variants: resolved,
    transition: !variants && !stagger ? { delay } : undefined,
  };

  switch (as) {
    case "section":
      return <motion.section {...props}>{children}</motion.section>;
    case "ul":
      return <motion.ul {...props}>{children}</motion.ul>;
    case "ol":
      return <motion.ol {...props}>{children}</motion.ol>;
    case "header":
      return <motion.header {...props}>{children}</motion.header>;
    case "footer":
      return <motion.footer {...props}>{children}</motion.footer>;
    case "article":
      return <motion.article {...props}>{children}</motion.article>;
    case "div":
    default:
      return <motion.div {...props}>{children}</motion.div>;
  }
}

type RevealItemAs = "div" | "li" | "span" | "article";

type RevealItemProps = {
  as?: RevealItemAs;
  children: ReactNode;
  className?: string;
  variants?: Variants;
};

export function RevealItem({
  as = "div",
  children,
  className,
  variants,
}: RevealItemProps) {
  const prefersReduced = useReducedMotionPref();

  if (prefersReduced) {
    return renderPlain(as, className, children);
  }

  const v = variants ?? fadeUp;
  switch (as) {
    case "li":
      return (
        <motion.li className={className} variants={v}>
          {children}
        </motion.li>
      );
    case "span":
      return (
        <motion.span className={className} variants={v}>
          {children}
        </motion.span>
      );
    case "article":
      return (
        <motion.article className={className} variants={v}>
          {children}
        </motion.article>
      );
    case "div":
    default:
      return (
        <motion.div className={className} variants={v}>
          {children}
        </motion.div>
      );
  }
}

function renderPlain(
  as: string,
  className: string | undefined,
  children: ReactNode,
) {
  switch (as) {
    case "section":
      return <section className={className}>{children}</section>;
    case "ul":
      return <ul className={className}>{children}</ul>;
    case "ol":
      return <ol className={className}>{children}</ol>;
    case "header":
      return <header className={className}>{children}</header>;
    case "footer":
      return <footer className={className}>{children}</footer>;
    case "article":
      return <article className={className}>{children}</article>;
    case "li":
      return <li className={className}>{children}</li>;
    case "span":
      return <span className={className}>{children}</span>;
    case "div":
    default:
      return <div className={className}>{children}</div>;
  }
}
