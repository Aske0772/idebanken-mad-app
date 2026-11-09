import { useCallback, useEffect, useRef, useState } from 'react';

// Hold a card to pick it up, then drag it up or down to another evening.
// Touch and pen: hold still for HOLD_MS (moving earlier is a scroll). Mouse: just drag.
// The card follows the finger through a transform set directly on the element,
// so React only re-renders when the target evening changes.
const HOLD_MS = 350;
const SLOP = 8;
const EDGE = 72;
const MAX_SPEED = 14;

// scroller: ref to the scrolling element. dayAt(y): evening under a viewport y.
// onDrop(id, day): called while the card is still lifted, so its position can be measured.
export function useHoldDrag({ scroller, dayAt, onDrop }) {
  const [drag, setDrag] = useState(null); // { id, span, target }
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const latest = useRef({ dayAt, onDrop });
  latest.current = { dayAt, onDrop };

  // Stops the page scrolling under a lifted card. Must be non-passive and
  // registered before the touch starts (iOS).
  useEffect(() => {
    const block = (e) => {
      if (gesture.current?.active) e.preventDefault();
    };
    document.addEventListener('touchmove', block, { passive: false });
    return () => document.removeEventListener('touchmove', block);
  }, []);

  const finish = useCallback((commit) => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    clearTimeout(g.timer);
    cancelAnimationFrame(g.raf);
    window.removeEventListener('pointermove', g.onMove);
    window.removeEventListener('pointerup', g.onUp);
    window.removeEventListener('pointercancel', g.onCancel);
    if (!g.active) return;
    suppressClick.current = true;
    setTimeout(() => { suppressClick.current = false; }, 400);
    if (commit && g.target != null) latest.current.onDrop(g.id, g.target);
    g.el.style.transform = '';
    g.el.classList.remove('is-lifted');
    setDrag(null);
  }, []);

  useEffect(() => () => finish(false), [finish]);

  const bind = (id, from, span) => ({
    'data-id': id,
    onContextMenu: (e) => e.preventDefault(),
    onClickCapture: (e) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      e.preventDefault();
      e.stopPropagation();
    },
    onPointerDown: (e) => {
      if (gesture.current || e.button !== 0) return;
      const el = e.currentTarget;
      const g = {
        id, from, span, el, pointerId: e.pointerId, mouse: e.pointerType === 'mouse',
        x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, active: false, target: from
      };

      const place = () => {
        const sc = scroller.current;
        const dy = g.y - g.y0 + (sc ? sc.scrollTop - g.scroll0 : 0);
        el.style.transform = `translate3d(0, ${dy}px, 0) scale(1.03)`;
        // Aim with the card's first evening: its top edge plus half a row.
        const day = latest.current.dayAt(g.top0 + (g.y - g.y0) + 32);
        if (day !== g.target) {
          g.target = day;
          setDrag({ id, span, target: day });
        }
      };

      const scrollLoop = () => {
        const sc = scroller.current;
        if (sc && g.active) {
          const r = sc.getBoundingClientRect();
          let v = 0;
          if (g.y < r.top + EDGE) v = -MAX_SPEED * (1 - Math.max(0, g.y - r.top) / EDGE);
          else if (g.y > r.bottom - EDGE) v = MAX_SPEED * (1 - Math.max(0, r.bottom - g.y) / EDGE);
          if (v) {
            sc.scrollTop += v;
            place();
          }
        }
        g.raf = requestAnimationFrame(scrollLoop);
      };

      const lift = () => {
        g.active = true;
        g.top0 = el.getBoundingClientRect().top;
        g.scroll0 = scroller.current?.scrollTop ?? 0;
        try { el.setPointerCapture(g.pointerId); } catch { /* pointer already gone */ }
        el.classList.add('is-lifted');
        navigator.vibrate?.(12);
        setDrag({ id, span, target: from });
        place();
        g.raf = requestAnimationFrame(scrollLoop);
      };

      g.onMove = (ev) => {
        if (ev.pointerId !== g.pointerId) return;
        g.x = ev.clientX;
        g.y = ev.clientY;
        if (!g.active) {
          if (Math.hypot(g.x - g.x0, g.y - g.y0) <= SLOP) return;
          if (g.mouse) lift();
          else return finish(false); // moved before the hold: it is a scroll
        }
        place();
      };
      g.onUp = (ev) => ev.pointerId === g.pointerId && finish(true);
      g.onCancel = (ev) => ev.pointerId === g.pointerId && finish(false);
      window.addEventListener('pointermove', g.onMove);
      window.addEventListener('pointerup', g.onUp);
      window.addEventListener('pointercancel', g.onCancel);
      if (!g.mouse) g.timer = setTimeout(lift, HOLD_MS);
      gesture.current = g;
    }
  });

  return { drag, bind };
}
