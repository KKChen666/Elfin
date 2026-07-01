import type { DependencyList, RefObject } from 'react';

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
  void ref;
  void deps;
  void options;
}
