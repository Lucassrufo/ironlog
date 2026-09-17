# IronLog

**IronLog** ? um app de treino com portal web para conectar treinador e aluno. O aluno registra os treinos pelo app; o treinador acompanha evolu??o, cria rotinas e ajusta o plano pela web.

## O que o sistema faz

- Login e cadastro para **aluno** ou **treinador**.
- Portal web com dashboard, alunos, rotinas e chat.
- App mobile para registrar treino, carga, s?ries, repeti??es, notas e fotos.
- Hist?rico, evolu??o, resumo de treino e retomada de sess?o em andamento.
- Integra??o opcional com Supabase Free para autentica??o e sincroniza??o.
- Modo local quando o Supabase ainda n?o estiver configurado.

## Tecnologias

- Expo
- React Native
- TypeScript
- Supabase
- Vitest

## Como rodar

Instale as depend?ncias:

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

Crie um arquivo `.env` na raiz do projeto e preencha com suas chaves p?blicas do Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Depois execute as migrations em `supabase/migrations` no SQL Editor do Supabase.

Para login com Google, habilite o provider em:

```text
Supabase > Authentication > Providers > Google
```

O arquivo `.env` n?o deve ir para o GitHub. Ele j? est? protegido no `.gitignore`.

## Comandos ?teis

```bash
npm run typecheck
npm run test
npm run apk
```

## Observa??es

- O projeto foi pensado para funcionar sem custo inicial usando Supabase Free.
- N?o coloque chaves reais em arquivos versionados.
- O `.env.example` ? apenas um modelo; o `.env` ? o arquivo privado.

## Status

O IronLog j? possui base mobile, portal web, autentica??o, rotinas, dashboards e estrutura inicial de comunica??o entre treinador e aluno.
