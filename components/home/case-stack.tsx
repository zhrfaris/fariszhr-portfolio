"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

import styles from "./home.module.css";
import { useCaseStack } from "./use-case-stack";

export type CaseStackHandle = {
  /** 0 = fully stacked, 1 = settled into the grid. Driven from the scroll frame. */
  paint: (s: number) => void;
};

/**
 * Wraps the server-rendered case-study grid and gives it its stacked state.
 * The grid itself is untouched — this only positions, tones and animates the
 * cards it finds, and gets out of the way once they are at rest.
 */
const CaseStack = forwardRef<
  CaseStackHandle,
  {
    children: ReactNode;
    onJumpToGrid: () => void;
    /** revealed on the deck's own ramp, so it lands with the card contents */
    headingRef: RefObject<HTMLElement>;
  }
>(function CaseStack({ children, onJumpToGrid, headingRef }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const blockerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLButtonElement>(null);

  const { paint, setLift, settled } = useCaseStack({
    hostRef,
    blockerRef,
    deckRef,
    headingRef,
  });

  useImperativeHandle(ref, () => ({ paint }), [paint]);

  return (
    /* data-deck-motion is present from SSR until the deck is at rest, and is
       what the skeuomorphic tier treatment keys off. */
    <div
      className={styles.caseStack}
      ref={hostRef}
      data-deck-motion={settled ? undefined : ""}
    >
      {children}

      {/* While the deck has not landed it is one object, not four cards: this
          blanket takes the pointer off every card in transit, so the grid's own
          dark-invert hover can only ever fire on a card at rest. */}
      <div className={styles.stackBlocker} ref={blockerRef} hidden={settled}>
        <button
          type="button"
          ref={deckRef}
          className={styles.stackDeck}
          onClick={onJumpToGrid}
          onPointerEnter={() => setLift(true)}
          onPointerLeave={() => setLift(false)}
          onFocus={() => setLift(true)}
          onBlur={() => setLift(false)}
        >
          <span className={styles.stackDeckLabel}>
            Jump to the selected case studies
          </span>
        </button>
      </div>
    </div>
  );
});

export default CaseStack;
