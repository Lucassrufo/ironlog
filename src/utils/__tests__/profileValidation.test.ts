import { describe, expect, test } from 'vitest';

import { validateProfileInput } from '../profileValidation';

describe('profile validation', () => {
  test('rejects empty name and non-positive metrics', () => {
    const result = validateProfileInput({ nome: '', sobrenome: 'Silva', altura: '0', peso: '-10' });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(['Informe seu nome.', 'Altura deve ser maior que zero.', 'Peso deve ser maior que zero.']);
  });

  test('normalizes valid decimal input', () => {
    const result = validateProfileInput({ nome: ' Ana ', sobrenome: ' Souza ', altura: '170,5', peso: '72.3' });

    expect(result).toEqual({
      ok: true,
      value: {
        nome: 'Ana',
        sobrenome: 'Souza',
        altura: 170.5,
        peso: 72.3,
      },
      errors: [],
    });
  });
});
