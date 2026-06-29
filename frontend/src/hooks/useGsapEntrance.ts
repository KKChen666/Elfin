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
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = options.selector
      ? Array.from(root.querySelectorAll<HTMLElement>(options.selector))
      : root.children.length > 0
        ? Array.from(root.children)
        : [root];

    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          y: options.y ?? 14,
          opacity: 0,
          scale: options.scale ?? 0.985,
          filter: 'blur(6px)',
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: options.duration ?? 0.42,
          delay: options.delay ?? 0,
          stagger: options.stagger ?? 0.045,
          ease: options.ease ?? 'power2.out',
          clearProps: 'transform,filter',
        },
      );
    }, root);

    return () => ctx.revert();
  }, deps);
}
