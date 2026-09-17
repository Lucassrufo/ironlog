import { describe, expect, test } from 'vitest';

import { limitPlansForUser } from '../planPreferences';
import { WorkoutPlan } from '../../types/models';

function plan(index: number): WorkoutPlan {
  return {
    id: `plan-${index}`,
    dayLabel: `Dia ${index}`,
    weekDay: index,
    title: `Treino ${index}`,
    focus: 'Forca',
    exercises: [],
  };
}

describe('plan preferences', () => {
  test('limits plans to the selected training frequency', () => {
    const plans = [1, 2, 3, 4, 5, 6].map(plan);

    expect(limitPlansForUser(plans, { diasTreinoSemana: 3 }).map((item) => item.id)).toEqual(['plan-1', 'plan-2', 'plan-3']);
  });

  test('keeps at least one plan and never invents extra plans', () => {
    const plans = [plan(1), plan(2)];

    expect(limitPlansForUser(plans, { diasTreinoSemana: 0 })).toHaveLength(1);
    expect(limitPlansForUser(plans, { diasTreinoSemana: 6 })).toHaveLength(2);
  });
});
