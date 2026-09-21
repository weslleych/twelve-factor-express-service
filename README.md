# Twelve-Factor Express Microservice

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v24+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.21+-lightgrey.svg)](https://expressjs.com/)
[![12-Factor App](https://img.shields.io/badge/Methodology-12--Factor%20App-purple.svg)](https://12factor.net/)

Scaffold completo e referencial de um microsserviço minimalista em **Node.js** com **Express**, arquitetado desde o primeiro commit em estrita conformidade com os princípios da metodologia dos **[Doze Fatores (The Twelve-Factor App)](https://12factor.net/)**.

---

## 💡 Justificativa da Stack Tecnológica

| Componente | Tecnologia Escolhida | Justificativa Arquitetural |
| :--- | :--- | :--- |
| **Ambiente de Execução** | **Node.js (v24+ / LTS)** | Modelo orientado a eventos e I/O não-bloqueante (*event loop*), proporcionando altíssimo rendimento para cargas de trabalho de microsserviços I/O-bound com baixo consumo de memória. O suporte nativo a `--watch` simplifica o ciclo de desenvolvimento sem dependências extras. |
| **Framework Web** | **Express.js (v4.x)** | Minimalista, maduro, sem acoplamento a padrões opinativos pesados e com um modelo enxuto de encadeamento de *middlewares*. Permite controle granular sobre o ciclo de vida da requisição, tratamento de sinais de encerramento do processo e desacoplamento do servidor HTTP. |
| **Injeção de Configuração** | **dotenv + Módulo Centralizado** | Isola a configuração em variáveis de ambiente (Fator III). Durante o desenvolvimento local, carrega o arquivo `.env` (ignorado no Git). Em ambientes de contêiner ou nuvem, consome as variáveis nativas injetadas pela infraestrutura. |
| **Processos e Descartabilidade** | **Sinais do SO (`SIGTERM`, `SIGINT`)** | Mecanismo nativo de *graceful shutdown* com encerramento controlado de conexões e rejeição de novas requisições (503), garantindo robustez perante orquestradores de contêineres (Kubernetes, Azure Container Apps, Docker Swarm). |
| **Observabilidade e Logs** | **Fluxo não-bufferizado para `stdout`** | Rejeição deliberada de escrita em arquivos locais de log. O serviço emite streams estruturadas em formato JSON diretamente para `stdout`/`stderr`, viabilizando coleta transparente por agentes do hospedeiro (Promtail, Fluentbit, Datadog, AWS CloudWatch). |

---

## 📋 Mapeamento Completo dos Doze Fatores (12-Factor App)

A tabela abaixo detalha como cada um dos doze princípios foi implementado no projeto:

| Fator | Princípio do Manifesto | Implementação no Projeto | Arquivos de Referência |
| :--- | :--- | :--- | :--- |
| **I. Base de Código (Codebase)** | Uma base de código rastreada por controle de versão, muitos deploys. | Repositório único no GitHub com histórico contínuo e branches padronizadas. O mesmo artefato é implantado em múltiplos ambientes (dev, staging, prod). | [Git Repository](https://github.com/weslleych/twelve-factor-express-service) |
| **II. Dependências (Dependencies)** | Declare e isole as dependências de forma explícita. | Todas as dependências (`express`, `dotenv`) são declaradas no manifesto e travadas com exatidão no `package-lock.json`. Nenhuma dependência é assumida como instalada no sistema global. | [`package.json`](./package.json), [`package-lock.json`](./package-lock.json) |
| **III. Configurações (Config)** | Armazene as configurações no ambiente. | Variáveis de runtime (`PORT`, `NODE_ENV`, `APP_NAME`) são validadas de forma centralizada e congeladas via `Object.freeze`. O `.gitignore` veta arquivos `.env`, e o `.env.example` documenta as chaves. | [`src/config.js`](./src/config.js), [`.env.example`](./.env.example), [`.gitignore`](./.gitignore) |
| **IV. Serviços de Apoio (Backing Services)** | Trate os serviços de apoio como recursos anexados. | Recursos externos (bancos SQL, caches Redis, brokers de mensageria) são abstraídos como URLs e credenciais injetadas via variáveis de ambiente, permitindo permuta sem alterar código. | [`scripts/admin-check.js`](./scripts/admin-check.js) |
| **V. Construir, Lançar, Executar (Build, Release, Run)** | Separe estritamente os estágios de construção e execução. | O código separa a fase de resolução de dependências (`npm install`), validação e execução em runtime (`npm start`). Não há modificação de código em tempo de execução. | [`package.json`](./package.json) |
| **VI. Processos (Processes)** | Execute a aplicação como um ou mais processos stateless. | O microsserviço não mantém estado em memória nem grava arquivos temporários em disco. Qualquer persistência de estado é delegada a recursos externos. | [`src/server.js`](./src/server.js) |
| **VII. Vínculo de Portas (Port Binding)** | Exporte serviços por meio de vínculo de portas. | O microsserviço é autônomo e não depende de injeção em servidores de aplicação externos (como Apache/Tomcat); ele expõe seu próprio ouvinte HTTP via `PORT`. | [`src/server.js`](./src/server.js) |
| **VIII. Concorrência (Concurrency)** | Escale através do modelo de processos. | O serviço é projetado como um processo independente que escala horizontalmente por meio de múltiplas réplicas de contêineres gerenciadas por orquestradores. | [`src/server.js`](./src/server.js) |
| **IX. Descartabilidade (Disposability)** | Maximize a robustez com inicialização rápida e desligamento gracioso. | Captura `SIGTERM` e `SIGINT`, encerra recepção de novas conexões (HTTP 503), drena sockets ativos, fecha conexões ociosas (`closeIdleConnections`) e possui timeout de segurança de 10s. | [`src/server.js`](./src/server.js) |
| **X. Paridade Dev/Prod (Dev/prod Parity)** | Mantenha desenvolvimento, homologação e produção o mais similares possível. | Mesma versão de runtime, scripts unificados e uso das mesmas variáveis de configuração em todos os estágios, minimizando lacunas de comportamento entre ambientes. | [`package.json`](./package.json), [`.env.example`](./.env.example) |
| **XI. Logs (Logs)** | Trate os logs como fluxos de eventos. | Middleware de requisições gera eventos estruturados em JSON para `stdout` com método, rota, status e latência. Não cria nem gerencia arquivos de log em disco. | [`src/middleware/requestLogger.js`](./src/middleware/requestLogger.js) |
| **XII. Processos Administrativos (Admin Processes)** | Execute tarefas administrativas/gerenciais como processos pontuais. | Script de diagnóstico e verificação executado no mesmo ambiente e com as mesmas configurações da aplicação em produção via `npm run admin:check`. | [`scripts/admin-check.js`](./scripts/admin-check.js) |

---

## 🚀 Guia Rápido de Execução Local

### 1. Pré-requisitos

- **Node.js**: versão 20.x ou superior (versão 24.x recomendada).
- **npm**: versão 10.x ou superior.
- **Git**: instalado e autenticado.

### 2. Clonagem e Instalação

```bash
# Clonar o repositório
git clone https://github.com/weslleych/twelve-factor-express-service.git
cd twelve-factor-express-service

# Instalar dependências declaradas e isoladas
npm install
```

### 3. Configuração do Ambiente

Copie o template de ambiente fornecido e ajuste caso deseje:

```bash
cp .env.example .env
```

Variáveis documentadas disponíveis:
- `APP_NAME`: Identificador da instância do microsserviço (padrão: `twelve-factor-express-service`).
- `NODE_ENV`: Contexto de execução (`development`, `production`, `test`) (padrão: `development`).
- `PORT`: Porta TCP do servidor HTTP (padrão: `3000`).

### 4. Scripts Operacionais

- **Execução em Produção:**
  ```bash
  npm start
  ```
- **Execução em Desenvolvimento (com Live Reload nativo):**
  ```bash
  npm run dev
  ```
- **Rotina Administrativa Pontual (Fator XII):**
  ```bash
  npm run admin:check
  ```

### 5. Testando os Endpoints

Com o servidor em execução:

- **Metadados e Estado:**
  ```bash
  curl http://localhost:3000/
  ```
  *Resposta:*
  ```json
  {
    "service": "twelve-factor-express-service",
    "environment": "development",
    "status": "operational",
    "timestamp": "2026-09-21T23:20:00.000Z"
  }
  ```

- **Sonda de Integridade (*Liveness/Readiness Probe*):**
  ```bash
  curl http://localhost:3000/health
  ```
  *Resposta:*
  ```json
  {
    "status": "UP",
    "service": "twelve-factor-express-service",
    "environment": "development",
    "uptime": 12.45,
    "timestamp": "2026-09-21T23:20:00.000Z"
  }
  ```

---

## 🌐 Instruções para Deploy Rápido

### Opção A: Deploy via Vercel

O projeto já inclui compatibilidade serverless através do [`vercel.json`](./vercel.json) e [`api/index.js`](./api/index.js).

#### Método 1: Usando a Vercel CLI

1. Instale a Vercel CLI globalmente (caso ainda não possua):
   ```bash
   npm install -g vercel
   ```
2. Realize o login e implante o projeto:
   ```bash
   vercel
   ```
3. Para publicar diretamente em produção:
   ```bash
   vercel --prod
   ```

#### Método 2: Via Painel Web da Vercel
1. Acesse [vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **"Add New Project"** e selecione o repositório `weslleych/twelve-factor-express-service`.
3. Em **Environment Variables**, configure as chaves desejadas (ex.: `APP_NAME`, `NODE_ENV=production`).
4. Clique em **"Deploy"**. A Vercel executará as rotas através do adaptador serverless automaticamente.

---

### Opção B: Exposição Rápida via Cloudflare Tunnel

O **Cloudflare Tunnel** permite expor com segurança o microsserviço rodando em sua máquina ou contêiner local para a internet pública com HTTPS automático, sem abrir portas no roteador (*NAT/firewall*) e sem necessidade de IP estático.

#### Método 1: Quick Tunnel (Efêmero e Imediato)

Ideal para demonstrações, testes remotos de webhooks e homologações pontuais:

1. Baixe o utilitário `cloudflared`:
   - **Windows (via Winget):** `winget install Cloudflare.cloudflared`
   - **macOS (via Homebrew):** `brew install cloudflared`
   - **Linux:** `sudo apt-get install cloudflared`
2. Inicie sua aplicação localmente:
   ```bash
   npm start
   ```
3. Em outro terminal, crie o túnel apontando para a porta da aplicação:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
4. O terminal exibirá uma URL pública gerada dinamicamente, por exemplo:
   ```text
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
   |  https://random-assigned-name.trycloudflare.com                                            |
   +--------------------------------------------------------------------------------------------+
   ```
5. Teste o acesso público via HTTPS diretamente do navegador ou via `curl`:
   ```bash
   curl https://random-assigned-name.trycloudflare.com/health
   ```

#### Método 2: Túnel de Produção com Domínio Próprio

Para vincular o serviço a um subdomínio fixo gerenciado pela Cloudflare:

1. Autentique-se com sua conta Cloudflare:
   ```bash
   cloudflared tunnel login
   ```
2. Crie um túnel persistente nomeado:
   ```bash
   cloudflared tunnel create twelve-factor-tunnel
   ```
3. Roteie o tráfego DNS do seu subdomínio para o túnel:
   ```bash
   cloudflared tunnel route dns twelve-factor-tunnel api.seudominio.com
   ```
4. Crie o arquivo de configuração `~/.cloudflared/config.yml`:
   ```yaml
   tunnel: <ID-DO-TUNEL>
   credentials-file: /path/to/<ID-DO-TUNEL>.json

   ingress:
     - hostname: api.seudominio.com
       service: http://localhost:3000
     - service: http_status:404
   ```
5. Inicie o túnel:
   ```bash
   cloudflared tunnel run twelve-factor-tunnel
   ```

---

## 📄 Licença

Este projeto está licenciado sob os termos da licença [MIT](LICENSE).
