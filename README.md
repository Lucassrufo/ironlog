# IronLog

Aplicativo mobile para registrar treinos de musculacao, acompanhar historico e visualizar evolucao. O projeto usa React Native, Expo e TypeScript, com dados salvos localmente no aparelho.

## Recursos atuais

- Login/registro com papel de treinador ou aluno via Supabase Free.
- Login/cadastro com email e senha forte ou Google OAuth via Supabase.
- Portal inicial do treinador para dashboard, alunos, rotinas, atribuicao de treino e chat.
- Area web inicial do aluno com dashboard e chat.
- App do aluno preparado para carregar rotina designada pelo treinador.
- Sincronizacao de treino concluido com Supabase quando configurado.
- Onboarding completo com dados pessoais, objetivo, experiencia, local de treino, foco corporal, dias por semana e duracao preferida.
- Planos por nivel: iniciante, regular e profissional.
- Divisoes de treino normal e full body ABC.
- Agenda com proximos treinos e historico de sessoes concluidas.
- Registro de treino com series, repeticoes, carga, notas e foto opcional.
- Rascunho de treino em andamento com retomada local.
- Finalizacao de treino completo ou parcial.
- Calculo de volume sem duplicar carga bilateral.
- Tratamento de prancha/cardio como trabalho por tempo.
- Evolucao com filtros de ultimo dia, semana, mes e ano.
- Perfil editavel com validacao de nome, altura e peso.
- Resumo detalhado com exercicios, series, maior carga, repeticoes, tempo ativo e volume.

## O que precisa baixar

- Node.js 20.19 ou superior.
- npm, instalado junto com o Node.js.
- Expo Go compativel com o SDK do projeto ou um emulador Android/iOS.
- Android Studio para rodar no emulador Android.
- Xcode para rodar no simulador iOS, somente no macOS.
- Conta Expo/EAS para gerar APK pela nuvem.

## Como rodar

```bash
npm install
npm start
```

Depois, abra o QR Code no Expo Go ou escolha uma das opcoes do terminal.

```bash
npm run android
npm run ios
```

Para limpar cache quando o Expo estiver estranho:

```bash
npx expo start --clear
```

## Configurar Supabase Free

Crie um projeto gratuito no Supabase e copie `.env.example` para `.env`.

```bash
copy .env.example .env
```

Preencha:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

Depois execute, nesta ordem, as migrations no SQL Editor do Supabase:

1. `supabase/migrations/20260917120000_trainer_student_platform.sql`
2. `supabase/migrations/20260917133000_platform_security_hardening.sql`
3. `supabase/migrations/20260917143000_auth_profile_trigger.sql`

### Login com Google sem custo

No Supabase, abra **Authentication > Providers > Google** e habilite o provider. No Google Cloud, crie um OAuth Client do tipo Web e cadastre:

- Authorized JavaScript origin local: `http://localhost:8081`, `http://localhost:8082` ou a porta que o Expo mostrar.
- Authorized redirect URI: use a URL de callback mostrada na tela do provider Google dentro do Supabase.

No Supabase, em **Authentication > URL Configuration**, adicione a URL local do Expo em **Redirect URLs**. Exemplo:

```text
http://localhost:8082
```

Se aparecer `Unsupported provider: provider is not enabled`, o app esta correto, mas o provider Google ainda esta desligado no Supabase.

### Email de confirmacao mais bonito

No Supabase, abra **Authentication > Email Templates > Confirm signup**.

Use este assunto:

```text
Confirme seu acesso ao IronLog
```

Cole o HTML de:

```text
supabase/templates/confirm-signup.html
```

O template usa `{{ .ConfirmationURL }}`, variavel oficial do Supabase para o link de confirmacao. O app tambem envia `emailRedirectTo`, entao depois de confirmar o email a pessoa volta para o proprio site do IronLog.

Sem essas chaves, o app mostra uma tela de setup e permite continuar em modo local, sem custo.

## Segurança aplicada sem custo

- As tabelas online usam Row Level Security.
- Treinadores so conseguem acessar alunos vinculados.
- Alunos so conseguem acessar a propria rotina atribuida e as proprias sessoes.
- Chat so permite leitura/envio por participantes do vinculo.
- Cadastro por email normaliza o email e exige senha mais forte.
- Login por Google passa por criacao segura de perfil com papel de treinador ou aluno.
- Nao ha SMS, servidor pago, provedor pago de email ou plano pago obrigatório nesta fase.

## Testes e checagem

```bash
npm run test
npm run typecheck
```

## Gerar APK

```bash
npm run eas:login
npm run apk
```

O perfil `preview` do EAS gera um APK instalavel. Quando o build terminar, o EAS mostra o link para download.

## Observacoes

- O app agora tem backend opcional via Supabase Free; sem `.env`, ele continua em modo local.
- A plataforma online usa Supabase Free; se as cotas gratuitas forem excedidas, pode ser necessario pausar uso ou migrar de plano no futuro.
- Nao use login por telefone/SMS nesta fase, porque pode gerar custo.
- Favoritos, editor avancado de fichas, notificacoes nativas e convites por email ainda aparecem como proximos passos de produto.
