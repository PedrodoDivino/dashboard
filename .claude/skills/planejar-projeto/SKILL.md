---
name: planejar-projeto
description: Planeja o projeto dashboard deste repositório - entrevista o usuário com a skill grilling e depois escreve as etapas e tarefas em docs/. Use sempre que o usuário quiser planejar, replanejar, organizar ou quebrar em tarefas o dashboard, decidir "o que fazer primeiro", montar um roadmap/backlog/checklist, ou atualizar o plano depois de concluir tarefas, mesmo que ele não diga "planejar" explicitamente.
---

# Planejar o projeto dashboard

O objetivo é sair de uma ideia (às vezes vaga) para uma lista de etapas e tarefas pequenas o bastante para serem executadas uma de cada vez. O plano vive em `docs/` para ser versionado no git e consultado em sessões futuras.

## 1. Ver o que já existe

Antes de perguntar qualquer coisa, olhe o repositório: `README.md`, código existente, `package.json` ou equivalentes, e principalmente `docs/decisoes.md` e `docs/tarefas.md`.

- **Se `docs/tarefas.md` já existe**, você está em modo de atualização: leia o plano, veja o que foi marcado como concluído e o que mudou no código desde então. A entrevista deve focar só no que mudou ou ficou em aberto, não recomeçar do zero.
- **Se não existe**, é um planejamento novo.

Fatos que dá para descobrir sozinho (tecnologia já usada, arquivos que existem) você descobre; não pergunte ao usuário.

## 2. Entrevistar com a grilling

Chame a skill `grilling` com o Skill tool e siga as instruções dela para conduzir a entrevista em rodadas. Escreva as perguntas em português.

Para um dashboard, a árvore de decisões costuma passar por:

- Para quem é o dashboard e que decisão ele ajuda a tomar
- Quais métricas/indicadores aparecem e de onde vêm os dados (planilha, API, banco, manual)
- Com que frequência os dados atualizam
- Quais telas/visões existem e o que entra na primeira versão
- Tecnologia (frontend, hospedagem, se precisa de login)
- Restrições: prazo, orçamento, tempo disponível por semana, nível de experiência do usuário

Isto é um mapa, não um roteiro: pule o que já está decidido e siga os ramos que as respostas abrirem. Termine só quando o usuário confirmar que vocês chegaram a um entendimento comum.

## 3. Escrever o plano em docs/

Crie (ou atualize) dois arquivos.

### docs/decisoes.md

Registro curto do que foi decidido na entrevista, para que as tarefas façam sentido daqui a um mês. Um item por decisão, com o porquê em uma linha:

```markdown
# Decisões do projeto

_Atualizado em AAAA-MM-DD_

- **Dados:** planilha do Google Sheets da equipe. Já é onde os números são lançados hoje.
- **Primeira versão:** só a tela de vendas mensais. As outras telas dependem de dados que ainda não existem.
```

### docs/tarefas.md

Etapas em ordem, cada uma com uma checklist de tarefas:

```markdown
# Tarefas

_Atualizado em AAAA-MM-DD_

## Etapa 1 - Base do projeto
Objetivo: ter uma página rodando localmente.

- [ ] Criar o projeto com <tecnologia escolhida>
- [ ] Publicar uma página "olá mundo" em <hospedagem>

## Etapa 2 - ...
```

Boas tarefas:

- **Pequenas:** cabem em uma sessão de trabalho (algumas horas no máximo). Se uma tarefa parece grande, quebre-a.
- **Verificáveis:** dá para saber se terminou ("gráfico de vendas mostra os últimos 12 meses", não "melhorar o gráfico").
- **Em ordem de dependência:** nada depende de uma tarefa que vem depois.
- **Cada etapa entrega algo que funciona**, mesmo que simples. Isso dá retorno cedo e evita passar semanas sem ver resultado.

A primeira etapa deve ser a menor versão que já mostra algo útil; o resto vem depois.

Ao atualizar um plano existente, preserve as tarefas já marcadas `[x]`, ajuste as pendentes e adicione as novas no lugar certo da ordem. Atualize a data.

## 4. Fechar

Mostre ao usuário um resumo curto: quantas etapas, o que é a primeira etapa e qual a próxima tarefa a fazer. Não comece a executar as tarefas sem o usuário pedir.
