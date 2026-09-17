# Relatório do sistema — IronLog

Análise realizada em 17/09/2026 sobre o código presente no projeto.

## 1. Visão geral

O IronLog é um aplicativo mobile para organizar e registrar treinos de academia. Ele reúne cadastro do praticante, planos predefinidos, acompanhamento de séries, cronômetro, histórico e indicadores de evolução.

Hoje, o sistema funciona com dados locais: não há servidor próprio, login com senha, banco de dados remoto ou sincronização entre aparelhos. O perfil é um cadastro no dispositivo. As “postagens” de treinos são registros pessoais locais, sem publicação em uma rede social.

Minha avaliação é que o projeto já tem uma boa base para uso individual, mas ainda precisa de ajustes na confiabilidade do registro, nos indicadores e na navegação antes de ser tratado como um produto finalizado.

## 2. Tecnologias e organização

| Tecnologia | Uso no projeto |
| --- | --- |
| Expo SDK 54 | Desenvolvimento e configuração do aplicativo |
| React Native 0.81.5 e React 19.1 | Construção das telas mobile |
| TypeScript 5.9 | Tipagem do código |
| React Navigation 7 | Navegação entre telas |
| AsyncStorage | Armazenamento local de perfil, histórico e postagens |
| Expo Image Picker | Escolha de imagens da galeria |
| Expo File System | Cópia de fotos para a pasta de documentos do aplicativo |
| EAS Build | Configuração para gerar APK e Android App Bundle |

As versões acima correspondem às declarações do `package.json`; o `package-lock.json` registra as resoluções das dependências.

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `App.tsx` | Inicialização, animação de abertura e provedores de estado |
| `src/navigation/` | Rotas do cadastro e do aplicativo |
| `src/screens/` | Telas principais |
| `src/screens/onboarding/OnboardingFlowScreen.tsx` | Cadastro inicial atualmente utilizado |
| `src/context/UserContext.tsx` | Perfil, persistência e conclusão dos treinos |
| `src/context/ThemeContext.tsx` | Estrutura de temas |
| `src/data/workouts.ts` | Catálogo de exercícios e planos predefinidos |
| `src/utils/` | Cálculos e apresentação dos exercícios |
| `src/components/` | Componentes visuais reutilizáveis |
| `assets/` | Logo, imagens e demonstração em GIF |
| `app.json` e `eas.json` | Configuração do app e dos builds |

O `index.html` da raiz é apenas uma página com instruções para iniciar o Expo. Abrir esse arquivo no navegador não executa o aplicativo.

## 3. O que o sistema faz atualmente

### Cadastro inicial

O fluxo ativo tem **13 etapas**, apesar de o README mencionar três. Ele coleta nome, sobrenome, foto opcional, gênero, experiência, frequência atual, objetivo, local de treino, região corporal de interesse, idade, altura, peso, frequência desejada, duração da sessão e modo de configuração do plano. Alguns dados são agrupados na mesma etapa.

O aplicativo calcula e apresenta o IMC. O modelo também contém meta de peso, inicialmente preenchida com o peso atual; isso ainda não representa um acompanhamento completo de metas.

O “plano inteligente” aplica regras locais para escolher nível e divisão. Não existe integração com inteligência artificial. A experiência, frequência e dias desejados influenciam o nível; dias, foco e local podem influenciar a divisão. Objetivo e duração não geram uma ficha individualizada.

### Planos e tela inicial

- Três níveis: iniciante, regular e profissional.
- Duas divisões: normal e a opção denominada “Full body ABC”.
- Planos com exercícios, grupos musculares, séries, repetições e cargas iniciais sugeridas.
- Seleção manual do dia/plano na tela inicial.
- Visualização dos músculos envolvidos e acesso aos detalhes dos exercícios.
- Alteração posterior do nível e da divisão pelas preferências de treino.
- Avanço de um índice de sequência após concluir uma sessão.

A tela inicial usa essa sequência de treinos; a agenda usa dias fixos da semana. Portanto, o comportamento não é simplesmente “treino do dia calculado pelo calendário”, como descrito no README.

### Registro do treino

- Cronômetro iniciado ao entrar na sessão.
- Navegação entre exercícios e possibilidade de deixar um exercício pendente para depois.
- Edição de repetições e carga por série.
- Inclusão de séries extras.
- Marcação de todas as séries de um exercício como concluídas.
- Escolha de execução bilateral ou unilateral, armazenada por exercício.
- Anotações por exercício.
- Contagem de exercícios concluídos, repetições e volume.
- Exibição de calorias calculadas por uma fórmula fixa de seis por minuto.
- Foto opcional escolhida da galeria ao finalizar.
- Gravação do treino completo e tela de conclusão com animação.

Atualmente, todas as séries precisam estar marcadas para salvar a sessão. Não há opção de concluir um treino parcial. As cargas de uma nova sessão começam pelos valores do catálogo, sem reaproveitar automaticamente as últimas cargas registradas.

### Biblioteca e detalhes dos exercícios

A biblioteca reúne exercícios dos planos, organiza a consulta por músculos e apresenta grupos por equipamento. A tela de detalhes possui abas de alvo muscular, instruções e equipamento.

Há um GIF local associado ao supino inclinado com halteres. Para os demais exercícios, a tela usa uma representação visual de músculos. Embora o catálogo tenha URLs do YouTube, a tela atual não utiliza essas URLs para reproduzir vídeos embutidos.

A aba de favoritos exibe “Favoritos em breve”; a estrela da tela de detalhes ainda não salva favoritos.

### Perfil, histórico e evolução

- Edição de nome, sobrenome, altura, peso e foto.
- Cálculo de IMC com os dados informados.
- Comparação entre a primeira carga registrada e a melhor carga por exercício.
- Feed local de treinos concluídos com foto, duração, volume e repetições.
- Histórico técnico resumido com as seis sessões mais recentes.
- Tela de evolução com treinos, exercícios, minutos, calorias, repetições, volume, gráfico dos últimos sete dias e regiões mais treinadas.
- Ação de resetar perfil e histórico, mediante confirmação.

Existe uma tela de agenda que calcula os treinos previstos para os próximos 14 dias e lista sessões anteriores. Existe também uma tela de resumo com detalhes das séries. As duas estão registradas nas rotas, mas não encontrei entrada para a agenda nas telas principais. O acesso ao resumo aparece somente dentro dessa agenda. Assim, são funcionalidades implementadas, porém desconectadas do fluxo usual.

### Progressão de nível

O aplicativo avança de iniciante para regular e de regular para profissional após 30 conclusões de treino no nível. O contador se chama `completedDaysInLevel`, mas conta sessões: concluir mais de um treino no mesmo dia incrementa mais de uma vez.

### Dados e aparência

Perfil e histórico são armazenados no AsyncStorage; as fotos são copiadas para arquivos locais. Os fluxos principais não dependem de uma API externa de dados. No desenvolvimento, o celular ainda precisa acessar o servidor do Expo para carregar o projeto.

Não há backup próprio: trocar de aparelho ou apagar os dados do app pode causar perda do histórico. O reset remove os registros do armazenamento, mas não há remoção explícita dos arquivos de fotos copiados.

Há estrutura para temas claro e escuro, porém o app começa no escuro, não persiste essa preferência e não encontrei um controle de troca de tema nas telas.

## 4. O que baixar ou instalar

Para trabalhar neste projeto no Windows e testar em um Android:

| Item | Necessidade |
| --- | --- |
| [Node.js](https://nodejs.org/en/download) com npm | Necessário para instalar dependências e iniciar o projeto |
| Expo Go compatível com SDK 54 | Necessário se o teste for pelo Expo Go |
| Editor de código | Você já pode usar o editor atual |
| Git | Opcional para executar a cópia existente; útil para versionar e colaborar |
| [Android Studio](https://developer.android.com/studio) | Opcional, caso queira usar emulador Android |
| Conta Expo com acesso ao projeto | Necessária para gerar builds pelo EAS |

O SDK 54 exige Node.js a partir da linha 20.19.x. Prefira uma versão LTS mantida que satisfaça esse requisito. Nesta máquina encontrei Node **24.14.0** e npm **11.9.0**; a checagem de TypeScript passou nesse ambiente. Referência: [compatibilidade do SDK 54](https://docs.expo.dev/versions/v54.0.0/).

**Compatibilidade do Expo Go:** a versão atual da loja não deve ser presumida compatível com o SDK 54. Para Android, selecione uma versão compatível em [expo.dev/go](https://expo.dev/go). Se não houver uma opção adequada ao aparelho, será necessário preparar um development build ou atualizar o SDK. Em iPhone físico, a distribuição do Expo Go é limitada à versão atual. Referência: [política de versões do Expo Go](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

Não é necessário instalar MySQL, PostgreSQL, Docker ou configurar um arquivo `.env` para o funcionamento atual. As bibliotecas React Native e Expo são instaladas pelas dependências do projeto.

## 5. Como rodar

### No celular Android

Abra um terminal PowerShell na pasta do projeto:

```powershell
cd C:\Users\Master\Desktop\ironlog
node --version
npm --version
npm ci
npm start
```

`npm ci` instala as versões do arquivo de lock e recria a pasta de dependências. O README também oferece `npm install`, que pode ser usado durante o desenvolvimento quando for necessário atualizar dependências.

Com o servidor iniciado:

1. Deixe computador e celular na mesma rede Wi-Fi.
2. Abra o Expo Go compatível no Android.
3. Leia o QR code exibido no terminal.
4. Mantenha o servidor rodando enquanto testa.

Se houver bloqueio de conexão pela rede, tente:

```powershell
npx expo start --tunnel
```

O modo túnel depende de internet e pode solicitar uma dependência adicional. Os passos de QR code, mesma rede e túnel estão na [documentação de execução do Expo](https://docs.expo.dev/get-started/start-developing/).

Para reiniciar limpando o cache do empacotador:

```powershell
npx expo start --clear
```

### No emulador Android

Instale o Android Studio, configure o SDK Android e crie um dispositivo virtual pelo Device Manager. Inicie esse dispositivo e execute:

```powershell
npm run android
```

Esse script inicia o Expo direcionado ao Android; ele não gera um APK de distribuição. Referência: [preparação do emulador Android](https://docs.expo.dev/workflow/android-studio-emulator/).

### No iOS

O projeto tem configuração para iOS e o script `npm run ios`. Para usar o simulador iOS localmente é necessário macOS com Xcode; o Windows não oferece esse simulador. Testar em iPhone físico também exige resolver a compatibilidade do Expo Go ou preparar um build adequado. Referência: [simulador iOS](https://docs.expo.dev/workflow/ios-simulator/).

### No navegador

Existe `npm run web`, mas `react-dom` e `react-native-web` não estão declarados nas dependências. Portanto, a versão web não deve ser considerada pronta.

Um primeiro passo, caso a equipe escolha dar suporte ao navegador, é:

```powershell
npx expo install react-dom react-native-web
npm run web
```

Depois será necessário validar e adaptar recursos de arquivos, fotos e interface. Esses comandos são uma orientação para trabalho futuro; não instalei essas dependências nesta análise. Referência: [suporte web do Expo](https://docs.expo.dev/workflow/web/).

### Gerar um APK

Com as dependências instaladas:

```powershell
npm run eas:login
npm run apk
```

O segundo comando usa o perfil `preview` do `eas.json`, configurado para APK. O EAS realiza a compilação na nuvem e, se ela for bem-sucedida, disponibiliza o arquivo. A instalação desse APK não depende do Expo Go nem de manter o servidor de desenvolvimento aberto. Referência: [geração e instalação de APK pelo EAS](https://docs.expo.dev/build-reference/apk/).

O `app.json` já está vinculado a um projeto EAS. A conta utilizada precisa ter acesso a ele; se for um projeto de outra pessoa, será necessário ajustar o vínculo. O perfil `production` está configurado para Android App Bundle, formato diferente do APK de instalação direta. Nenhum build foi gerado nesta análise.

## 6. Correções que eu priorizaria

As constatações abaixo vêm da leitura do código. Os riscos de comportamento devem ser reproduzidos no dispositivo antes de fechar cada correção.

| Prioridade | Ponto encontrado | Correção proposta |
| --- | --- | --- |
| Alta | Treino em andamento fica apenas no estado da tela. A chave de treino ativo é removida em alguns fluxos, mas não existe salvamento/restauração da sessão atual. | Salvar séries, notas e horário inicial; oferecer retomada; confirmar saída quando houver alterações. |
| Alta | Conclusão não tem bloqueio de envio repetido, tratamento de erro ou gravação conjunta dos dados. Estado visual é atualizado antes de terminar a persistência. | Desabilitar o botão durante o salvamento, impedir duplicidade por ID de sessão e permitir recuperação de falhas sem perder o treino. |
| Alta | A leitura inicial faz `JSON.parse` sem recuperação de dados inválidos. | Validar o formato, versionar dados locais e mostrar uma alternativa de recuperação quando a leitura falhar. |
| Alta | Volume multiplica qualquer exercício bilateral por dois. | Definir se a carga é total ou por lado. Exemplo: se 40 kg no supino já representam a barra carregada, dez repetições não deveriam virar 800 kg de volume. |
| Alta | Exercícios como prancha e cardio usam o mesmo campo de repetições dos exercícios de força. | Distinguir séries por repetições, duração e distância, evitando somar segundos como repetições. |
| Alta | “Semana” aparece selecionada, mas os totais usam todo o histórico; os outros filtros não têm ação. | Aplicar o mesmo período aos números e ao gráfico; implementar os filtros e a navegação temporal. |
| Alta | Gráfico mostra mês fixo `/6` e agrupa dias com datas UTC. | Formatar mês real e agrupar por dia local, inclusive para treinos próximos da meia-noite. |
| Alta | Preferências como “peso corporal” não filtram exercícios por equipamentos; a frequência escolhida não define a agenda. | Gerar planos que respeitem equipamentos e disponibilidade. Hoje uma escolha de até três dias pode levar à divisão ABC com seis dias no calendário. |
| Média | Agenda e resumo não possuem caminho completo de acesso pelas telas principais. | Adicionar entrada na agenda e tornar os registros do perfil clicáveis para abrir o resumo. |
| Média | “Criar treino rápido”, estrelas e favoritos não executam a funcionalidade anunciada. | Implementar essas ações ou identificar claramente sua indisponibilidade. |
| Média | Cards da central de treinos abrem apenas o Dashboard, sem informar qual plano foi escolhido. | Passar o identificador do plano e abrir a seleção correspondente. |
| Média | Contador de “dias” aumenta por sessão; nível sobe automaticamente a cada 30 conclusões. | Definir se a regra é por sessão ou dia e ajustar os nomes; oferecer revisão/aceite antes de trocar o nível. |
| Média | Edição de perfil salva altura e peso sem validar positividade, campos vazios ou valores inválidos. | Validar antes de salvar, com mensagens específicas por campo. |
| Média | Resumo mostra “Carga somada” e “Volume” com exatamente o mesmo valor. | Exibir métricas distintas, como volume, séries e maior carga, com unidades claras. |
| Média | Calorias usam uma constante por minuto e aparecem como um número comum. | Identificar explicitamente como estimativa simplificada ou remover o indicador até definir uma regra adequada ao produto. |
| Média | Reset não remove fotos locais e a troca de imagens pode deixar arquivos sem uso. | Gerenciar e limpar arquivos associados aos registros excluídos. |
| Baixa | Tema claro está preparado, mas sem controle acessível e sem persistência. | Adicionar escolha de tema, salvar preferência e revisar cores fixas nas telas. |
| Baixa | README descreve cadastro antigo, vídeo embutido e calendário de forma diferente do fluxo atual. | Atualizar a documentação com base no comportamento efetivamente disponível. |

Os principais arquivos para essas correções são `ActiveWorkoutScreen.tsx`, `UserContext.tsx`, `ProgressScreen.tsx`, `TrainingHubScreen.tsx`, `WorkoutSummaryScreen.tsx`, `ProfileScreen.tsx`, `OnboardingFlowScreen.tsx` e `src/data/workouts.ts`.

## 7. Funcionalidades que valeria adicionar

Estas são propostas de produto, ainda não implementadas.

| Funcionalidade | Benefício |
| --- | --- |
| Descanso entre séries com aviso sonoro ou vibração | Reduz a necessidade de alternar entre aplicativos durante o treino |
| Últimas cargas preenchidas automaticamente | Agiliza o registro e facilita comparar sessões |
| Finalizar treino parcial e registrar motivo | Preserva o que foi realizado quando falta tempo ou equipamento |
| Criar, duplicar e editar fichas | Permite adaptar o plano à rotina real da pessoa |
| Substituição de exercícios por equipamento disponível | Torna a ficha utilizável em academias diferentes |
| Favoritos e busca por nome | Acelera a consulta à biblioteca |
| Histórico editável, com exclusão de sessões | Permite corrigir registros feitos por engano |
| Recordes pessoais e gráficos por exercício | Mostra evolução de carga, repetições e volume ao longo do tempo |
| Histórico de peso e medidas | Permite acompanhar mudanças, em vez de apenas sobrescrever o peso atual |
| Exportação e importação de backup | Protege o histórico e facilita a troca de aparelho |
| Dias de treino configuráveis e lembretes opcionais | Aproxima a agenda da disponibilidade do usuário |
| Compartilhar uma imagem do resumo | Aproveita o registro com foto sem exigir uma rede social interna |
| Demonstrações específicas para mais exercícios | Torna os detalhes mais úteis do que as instruções genéricas por músculo |
| Conta e sincronização entre dispositivos | Permite continuidade entre aparelhos, quando a base local estiver confiável |

Minha ordem sugerida seria:

1. **Confiabilidade:** retomada de sessão, salvamento seguro, cálculos e validação dos dados.
2. **Coerência do aplicativo:** períodos da evolução, acesso ao histórico, plano selecionado e preferências respeitadas.
3. **Uso durante o treino:** descanso, últimas cargas, treino parcial e substituições.
4. **Personalização:** editor de fichas, favoritos, metas e gráficos detalhados.
5. **Continuidade dos dados:** backup e, depois, sincronização com conta.

## 8. Verificações realizadas e limites

- Analisei a navegação, telas, modelos, catálogo de treinos, persistência e configurações do projeto.
- Executei `npm run typecheck`: **concluiu com código de saída 0, sem erros de TypeScript**.
- Confirmei a presença dos arquivos de logo e GIF referenciados pela aplicação.
- Consultei a documentação oficial do Expo para instalação, compatibilidade e geração de APK.
- Não encontrei script de testes automatizados ou lint no `package.json`.
- Não executei o aplicativo em celular/emulador, não validei visualmente todas as telas e não gerei APK. A aprovação da tipagem não comprova o funcionamento desses fluxos.

Para validar as próximas correções, recomendo testar um ciclo completo: cadastrar usuário, iniciar treino, registrar algumas séries, sair e retomar, concluir uma vez, consultar o histórico e reiniciar o app. Também devem entrar nos testes sessões perto da meia-noite, troca de nível, treino parcial e falha de salvamento.

Este relatório documenta o estado atual e as propostas. Nenhuma funcionalidade do aplicativo foi alterada durante a análise.

## 9. Alteracoes implementadas apos este relatorio

Nesta rodada foram implementadas as primeiras correcoes prioritarias:

- Rascunho de treino ativo salvo no AsyncStorage, com retomada local da sessao.
- Finalizacao protegida por `sessionId`, reduzindo risco de duplicidade.
- Conclusao de treino parcial com as series ja registradas.
- Calculo de volume sem multiplicar automaticamente exercicios bilaterais por dois.
- Prancha e cardio tratados como trabalho por tempo, com `workSeconds`.
- Leitura local com parsing seguro para usuario, registros, posts e rascunho ativo.
- Validacao de nome, altura e peso no perfil.
- Historico tecnico do perfil clicavel para abrir o resumo.
- Resumo com metricas distintas: exercicios, series, maior carga, repeticoes, tempo ativo e volume.
- Tela de evolucao com filtros funcionais de ultimo dia, semana, mes e ano.
- Grafico usando datas locais e mes real.
- Central de treinos abrindo o plano escolhido no Dashboard.
- Agenda e Dashboard respeitando a quantidade de dias de treino escolhida.
- Entrada para agenda/historico adicionada na interface principal.
- Acoes ainda nao finalizadas, como favoritos e treino rapido, agora mostram aviso em vez de parecerem quebradas.
- README atualizado e testes automatizados adicionados para regras centrais.

Continuam como proximos passos maiores: editor completo de fichas, favoritos reais na biblioteca, substituicao de exercicios, backup/exportacao, lembretes nativos e sincronizacao com conta.

## 10. Plataforma treinador/aluno iniciada

Foi iniciada a migracao para uma plataforma com login, treinador e aluno usando Supabase Free:

- Adicionada especificacao em `docs/superpowers/specs/2026-09-17-ironlog-trainer-student-platform-design.md`.
- Adicionado plano de implementacao em `docs/superpowers/plans/2026-09-17-ironlog-trainer-student-platform.md`.
- Adicionado `.env.example` para `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Adicionada migration SQL com tabelas, indices, politicas RLS e funcao `link_student_by_email`.
- Adicionado login/registro com selecao de papel: treinador ou aluno.
- Adicionado portal inicial do treinador com dashboard, alunos, rotinas, atribuicao de rotina e chat.
- Adicionada area web inicial do aluno.
- Adicionado mapeamento de rotina atribuida no Supabase para o fluxo de treino existente no app.
- Adicionada tentativa de sincronizacao de treino concluido com Supabase, mantendo registro local quando a sincronizacao falhar.
- Adicionados testes para mapeamento de rotina, payload de sessao, metricas de dashboard e roteamento por papel.

Para funcionar online, ainda e necessario criar um projeto Supabase Free, preencher `.env` e executar a migration no SQL Editor do Supabase. Sem isso, o app continua disponivel em modo local.
