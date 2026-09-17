# IronLog

**IronLog** é um app de treino com portal web para conectar treinador e aluno. O aluno registra os treinos pelo app; o treinador acompanha evolução, cria rotinas e ajusta o plano pela web.

## O que o sistema faz

- Login e cadastro para **aluno** ou **treinador**.
- Portal web com dashboard, alunos, rotinas e chat.
- App mobile para registrar treino, carga, séries, repetições, notas e fotos.
- Histórico, evolução, resumo de treino e retomada de sessão em andamento.
- Integração opcional com Supabase Free para autenticação e sincronização.
- Modo local quando o Supabase ainda não estiver configurado.

## Tecnologias

- Expo
- React Native
- TypeScript
- Supabase
- Vitest

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode o projeto:

```bash
npm start
```

Ou abra direto por plataforma:

```bash
npm run web
npm run android
npm run ios
```

Se o Expo travar cache:

```bash
npx expo start --clear
```

## Configurar o Supabase

Crie um arquivo `.env` na raiz do projeto e preencha com suas chaves públicas do Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Depois execute as migrations em `supabase/migrations` no SQL Editor do Supabase.

Para login com Google, habilite o provider em:

```text
Supabase > Authentication > Providers > Google
```

O arquivo `.env` não deve ir para o GitHub. Ele já está protegido no `.gitignore`.

## Comandos úteis

```bash
npm run typecheck
npm run test
npm run apk
```

## Observações

- O projeto foi pensado para funcionar sem custo inicial usando Supabase Free.
- Não coloque chaves reais em arquivos versionados.
- O `.env.example` é apenas um modelo; o `.env` é o arquivo privado.

## Status

O IronLog já possui base mobile, portal web, autenticação, rotinas, dashboards e estrutura inicial de comunicação entre treinador e aluno.
