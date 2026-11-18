# Horizontes do Agro - API e front

Sistema de gestao de propriedades rurais. Este repositorio reune a API
(Spring Boot) e o front (Angular) num unico projeto, preparado para
deploy no Coolify a partir do GitHub.

## Estrutura

```
.
├── api/                  API em Spring Boot 4 / Java 25 (+ Dockerfile)
├── web/                  Front em Angular 16 servido por nginx (+ Dockerfile)
├── db/                   Script de carga para a apresentacao
├── docker-compose.yml    Orquestra banco + api + web
├── .env.example          Modelo das variaveis de ambiente
└── .github/workflows/    Pipeline que valida o build e dispara o Coolify
```

## Como as tres partes conversam

Somente o `web` fica publicado. O nginx que serve o Angular tambem atua
como proxy reverso: tudo que chega em `/api/` e `/usuarios` e repassado
para `api:8080` pela rede interna do Compose. A API nao precisa de porta
exposta e o navegador ve front e API na mesma origem, o que dispensa CORS.

```
navegador --> web (nginx :80) --+--> arquivos estaticos do Angular
                                 \--> /api/*, /usuarios --> api:8080 --> banco:5432
```

## Rodar na maquina local

```bash
cp .env.example .env
docker compose up -d --build
```

O front responde em http://localhost:8090 (ajuste `WEB_PORT` no `.env`).

Na primeira subida o Hibernate cria as tabelas. Para carregar os dados de
demonstracao, espere a API ficar de pe e rode:

```bash
docker compose exec -T banco psql -U postgres -d sifeo_db < db/carga_apresentacao.sql
```

Usuario de demonstracao: `demo@horizontesdoagro.com.br` / `Demo@2026`

Para derrubar tudo, preservando o banco:

```bash
docker compose down
```

Para derrubar apagando o banco:

```bash
docker compose down -v
```

## Deploy no Coolify

### 1. Enviar o codigo para o GitHub

```bash
git init -b main
git add .
git commit -m "feat: API e front reunidos para deploy no Coolify"
git remote add origin git@github.com:USUARIO/REPOSITORIO.git
git push -u origin main
```

### 2. Criar o recurso no Coolify

Em **+ New** -> **Resource**, escolha um cartao da secao **Git Based**:
**Public Repository**, se o repositorio for publico, ou **Private
Repository (with GitHub App)**, se for privado.

Nao use os cartoes da secao Docker (Dockerfile, Docker Compose, Docker
Image): todos dizem *without a Git repository* e pedem o arquivo colado
na mao. Este `docker-compose.yml` usa `build: ./api` e `build: ./web`,
que precisam dos arquivos do repositorio para construir as imagens.

Depois de informar o repositorio e a branch `main`, ajuste na propria
aplicacao:

| Campo | Valor |
| --- | --- |
| **Build Pack** | `Docker Compose` |
| **Docker Compose Location** | `/docker-compose.yml` |
| **Base Directory** | `/` (ou a subpasta, se o projeto nao for a raiz) |

Salve. O Coolify le o arquivo e lista os tres servicos.

### 3. Cadastrar as variaveis de ambiente

Em **Environment Variables**, informe as chaves do `.env.example`:

| Chave | Valor |
| --- | --- |
| `DB_NAME` | `sifeo_db` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | uma senha forte |
| `JWT_SECRET` | segredo com 32+ caracteres |
| `JWT_EXPIRATION_MS` | `7200000` |
| `CORS_ALLOWED_ORIGINS` | o dominio publicado, ex. `https://agro.seudominio.com` |

`JWT_SECRET` nao tem valor padrao na aplicacao: sem ele a API nao sobe.

### 4. Publicar o dominio

Na aba do servico `web`, preencha **Domains** com o dominio desejado. O
Coolify cria a rota no Traefik e emite o certificado. Nao publique o
servico `api`: ele e alcancado pelo proprio dominio, em `/api/...`.

### 5. Primeiro deploy

Clique em **Deploy**. O Coolify faz o build das duas imagens a partir dos
Dockerfiles e sobe a stack. Depois, carregue os dados de demonstracao pelo
terminal do servico `banco`, no proprio painel.

### 6. Automatizar o deploy

Nesta instancia do Coolify a **API REST esta desativada** e so um
administrador da instancia pode liga-la. Sem ela, `/api/v1/deploy` rejeita
qualquer chamada, entao o Actions nao consegue mandar o Coolify implantar.
O deploy passa a ser acionado pelo **webhook do GitHub**.

Como a fonte escolhida foi **Public Repository**, o Coolify nao tem o
GitHub App instalado e nao descobre os pushes sozinho: o webhook precisa
ser criado a mao.

1. Na aplicacao, abra **Webhooks** e copie a URL do webhook manual do
   GitHub e o secret que aparece ao lado.
2. No repositorio, em **Settings** -> **Webhooks** -> **Add webhook**:
   - *Payload URL*: a URL copiada
   - *Content type*: `application/json`
   - *Secret*: o secret copiado
   - *Events*: apenas `push`
3. De volta na aplicacao, ligue **Auto Deploy**.

A partir dai, todo push na `main` faz o Coolify reconstruir e subir a
stack, enquanto o workflow `.github/workflows/deploy.yml` compila API e
front em paralelo, servindo de verificacao.

O job `implantar` do workflow checa se os secrets `COOLIFY_URL`,
`COOLIFY_TOKEN` e `COOLIFY_UUID` existem. Sem eles, ele apenas registra um
aviso e termina em verde. Se a API for liberada algum dia, basta cadastrar
os tres em **Settings** -> **Secrets and variables** -> **Actions** (como
*repository secrets*, nao *environment secrets*) e o deploy volta a ser
disparado pelo Actions, condicionado ao build passar. Nesse caso, desligue
o Auto Deploy para nao deployar duas vezes.

## Diferencas em relacao aos repositorios originais

Dois pontos presos a `localhost` impediam qualquer deploy fora da maquina
de desenvolvimento e foram ajustados aqui:

1. **URLs da API no front.** Estavam fixas em `http://localhost:8080` e o
   Angular grava esses valores no bundle durante o build. Em
   `web/src/environments/environment.ts` passaram a ser relativas (`/api`),
   resolvidas pelo proxy do nginx. O arquivo de desenvolvimento
   (`environment.development.ts`) segue apontando para `localhost:8080`,
   para o `ng serve` continuar funcionando como antes.
2. **CORS na API.** `SecurityConfig` liberava apenas
   `http://localhost:4200` e `AuthController` repetia a restricao num
   `@CrossOrigin`. A anotacao foi removida e a lista passou a vir da
   propriedade `app.cors.allowed-origins`, alimentada por
   `CORS_ALLOWED_ORIGINS`.

Alem disso, o nginx recebeu `client_max_body_size 25m`, sem o qual o upload
de documentos falharia com HTTP 413 no limite padrao de 1 MB.
