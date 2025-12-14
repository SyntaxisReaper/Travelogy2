import { computeBadges, computeStreak } from './gamification';

describe('gamification utils', () => {
  test('computeStreak counts consecutive days with trips', () => {
    const today = new Date();
    const d = (offset: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset).toISOString();
    const trips = [
      { id: 'a', start_time: d(0) },
      { id: 'b', start_time: d(1) },
      { id: 'c', start_time: d(3) },
    ];
    expect(computeStreak(trips as any)).toBe(2);
  });

  test('computeBadges awards basic badges', () => {
    const stats = { total_trips: 12, eco_score: 85 };
    const trips = [{ id: 't1', start_time: new Date().toISOString() }];
    const res = computeBadges(stats as any, trips as any);
    expect(res.points.total).toBeGreaterThan(0);
    expect(res.badges.find(b => b.name === 'First Steps')).toBeTruthy();
    expect(res.badges.find(b => b.name === 'Trailblazer')).toBeTruthy();
    expect(res.badges.find(b => b.name === 'Eco Warrior')).toBeTruthy();
  });
});
