import { DependencyList, RefObject, useLayoutEffect } from 'react';
import gsap from 'gsap';

type EntranceOptions = {
  selector?: string;
  y?: number;
  scale?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  ease?: string;
};

export function useGsapEntrance<T extends HTMLElement>(
  ref: RefObject<T>,
  deps: DependencyList = [],
  options: EntranceOptions = {},
) {
  const {
    selector,
    y = 14,
    scale = 0.985,
    duration = 0.42,
    stagger = 0.045,
    delay = 0,
    ease = 'power2.out',
  } = options;
  const depsKey = JSON.stringify(deps);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = selector
      ? Array.from(root.querySelectorAll<HTMLElement>(selector))
      : root.children.length > 0
        ? Array.from(root.children)
        : [root];

    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          y,
          opacity: 0,
          scale,
          filter: 'blur(6px)',
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration,
          delay,
          stagger,
          ease,
          clearProps: 'transform,filter',
        },
      );
    }, root);

    return () => ctx.revert();
  }, [ref, selector, y, scale, duration, stagger, delay, ease, depsKey]);
}
