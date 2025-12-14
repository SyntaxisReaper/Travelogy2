export interface SimpleTrip {
  id: string;
  start_time: string;
  end_time?: string;
  transport_mode?: string;
}

export interface BadgesResult {
  points: { total: number; level: number; current_streak: number };
  badges: Array<{ name: string; icon?: string; description?: string }>;
}

// Compute current daily streak: count consecutive days with at least one trip ending today, yesterday, etc.
export const computeStreak = (trips: SimpleTrip[]): number => {
  if (!Array.isArray(trips) || trips.length === 0) return 0;
  const days = new Set<string>();
  for (const t of trips) {
    const d = new Date(t.end_time || t.start_time);
    const key = d.toISOString().slice(0, 10);
    days.add(key);
  }
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak += 1; else break;
  }
  return streak;
};

export const computeBadges = (stats: { total_trips?: number; eco_score?: number }, trips: SimpleTrip[]): BadgesResult => {
  const totalTrips = stats.total_trips || trips.length || 0;
  const eco = stats.eco_score || 0;
  const streak = computeStreak(trips);

  const badges: BadgesResult['badges'] = [];

  if (totalTrips >= 1) badges.push({ name: 'First Steps', icon: '🥇', description: 'Completed your first trip!' });
  if (totalTrips >= 10) badges.push({ name: 'Trailblazer', icon: '🏅', description: 'Completed 10 trips' });
  if (totalTrips >= 50) badges.push({ name: 'Voyager', icon: '🎖️', description: 'Completed 50 trips' });
  if (eco >= 80) badges.push({ name: 'Eco Warrior', icon: '🌿', description: 'High eco score' });
  if (streak >= 3) badges.push({ name: 'Streak Starter', icon: '🔥', description: '3-day daily streak' });
  if (streak >= 7) badges.push({ name: 'Weekly Streak', icon: '⚡', description: '7-day daily streak' });

  const points = totalTrips * 5 + streak * 10 + Math.round(eco);
  const level = Math.max(1, Math.floor(points / 100));

  return {
    points: { total: points, level, current_streak: streak },
    badges,
  };
};
