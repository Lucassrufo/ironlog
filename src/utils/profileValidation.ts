export interface ProfileInput {
  nome: string;
  sobrenome: string;
  altura: string;
  peso: string;
}

export interface ValidProfile {
  nome: string;
  sobrenome: string;
  altura: number;
  peso: number;
}

export type ProfileValidationResult =
  | { ok: true; value: ValidProfile; errors: [] }
  | { ok: false; errors: string[]; value?: never };

function parseMetric(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function validateProfileInput(input: ProfileInput): ProfileValidationResult {
  const errors: string[] = [];
  const nome = input.nome.trim();
  const sobrenome = input.sobrenome.trim();
  const altura = parseMetric(input.altura);
  const peso = parseMetric(input.peso);

  if (!nome) {
    errors.push('Informe seu nome.');
  }

  if (altura <= 0) {
    errors.push('Altura deve ser maior que zero.');
  }

  if (peso <= 0) {
    errors.push('Peso deve ser maior que zero.');
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { nome, sobrenome, altura, peso },
    errors: [],
  };
}
