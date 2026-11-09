import { describe, it, expect } from 'vitest';
import { layoutWeek, moveItem, weekMonday } from './week.js';

const item = (id, days = 1, day) => (day == null ? { id, days } : { id, days, day });
const daysOf = (plan) => Object.fromEntries(plan.map((p) => [p.id, p.day]));

describe('layoutWeek', () => {
  it('puts dishes without a day on the first free evenings, in order', () => {
    const { starts, unplaced } = layoutWeek([item('a', 2), item('b'), item('c', 3)]);
    expect(starts).toEqual({ a: 0, b: 2, c: 3 });
    expect(unplaced).toEqual([]);
  });

  it('keeps chosen days and fills around them', () => {
    const { starts } = layoutWeek([item('a', 1, 4), item('b', 2), item('c')]);
    expect(starts).toEqual({ a: 4, b: 0, c: 2 });
  });

  it('bumps a dish whose day is taken, and leaves out what does not fit', () => {
    const { starts, unplaced } = layoutWeek([item('a', 3, 0), item('b', 1, 1), item('c', 4), item('d', 1)]);
    expect(starts).toEqual({ a: 0, b: 3, d: 4 });
    expect(unplaced.map((p) => p.id)).toEqual(['c']);
  });
});

describe('moveItem', () => {
  it('swaps two dishes', () => {
    const plan = moveItem([item('a', 1, 0), item('b', 1, 2)], 'a', 2);
    expect(daysOf(plan)).toEqual({ a: 2, b: 0 });
  });

  it('slides a dish to the nearest free evening when the swap does not fit', () => {
    // a (1 day, Mon) onto b (2 days, Wed–Thu): b cannot fit on Monday alone next to c on Tue.
    const plan = moveItem([item('a', 1, 0), item('c', 1, 1), item('b', 2, 2)], 'a', 2);
    expect(daysOf(plan)).toEqual({ a: 2, c: 1, b: 3 });
  });

  it('keeps a multi-day dish inside the week', () => {
    const plan = moveItem([item('a', 3, 0)], 'a', 6);
    expect(daysOf(plan)).toEqual({ a: 4 });
  });

  it('places a dish that had no room', () => {
    const full = [item('a', 4, 0), item('b', 3, 4), item('c', 1)];
    expect(layoutWeek(full).unplaced.map((p) => p.id)).toEqual(['c']);
    const plan = moveItem(full, 'c', 6);
    expect(plan.find((p) => p.id === 'c').day).toBe(6);
    expect(layoutWeek(plan).unplaced.map((p) => p.id)).toEqual(['b']);
  });

  it('writes a day on every placed dish so the layout stays', () => {
    const plan = moveItem([item('a'), item('b'), item('c')], 'c', 0);
    expect(daysOf(plan)).toEqual({ c: 0, a: 2, b: 1 });
  });
});

describe('weekMonday', () => {
  it('finds the Monday of an ISO week', () => {
    const d = weekMonday('2026-W46');
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getDay()]).toEqual([2026, 11, 9, 1]);
    expect(weekMonday('2027-W01').getDate()).toBe(4);
  });
});
