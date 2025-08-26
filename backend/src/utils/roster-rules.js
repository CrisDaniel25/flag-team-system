export function defaultPolicy(){
  return {
    min_by_position: { QB:1, WR:2, CB:2 },
    min_by_gender: { male:5, female:5 }
  };
}

export function validateCounts({ entries, players, policy, roster_limit }){
  const pol = policy && Object.keys(policy||{}).length ? policy : defaultPolicy();
  const active = entries.filter(e => e.role === 'starter' || e.role === 'bench');

  const total = active.length;
  if (roster_limit && total > roster_limit) {
    return { ok:false, reason: `Roster excede el límite (${roster_limit}). Actual: ${total}` };
  }

  const posMin = pol.min_by_position || {};
  const genMin = pol.min_by_gender || {};

  const posCount = {};
  for (const e of active) {
    const p = players.get(e.player_id) || {};
    const pos = e.position || p.position || null;
    if (!pos) continue;
    posCount[pos] = (posCount[pos] || 0) + 1;
  }
  for (const [pos, min] of Object.entries(posMin)){
    const c = posCount[pos] || 0;
    if (c < min) return { ok:false, reason:`Falta ${pos}: ${c}/${min}` };
  }

  const genCount = { male:0, female:0, nonbinary:0 };
  for (const e of active){
    const p = players.get(e.player_id) || {};
    if (p.gender && genCount[p.gender] !== undefined) genCount[p.gender]++;
  }
  for (const [g, min] of Object.entries(genMin)){
    const c = genCount[g] || 0;
    if (c < min) return { ok:false, reason:`Mínimo de ${g}: ${c}/${min}` };
  }

  return { ok:true };
}
