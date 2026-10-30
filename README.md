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

1. No painel do Coolify: **+ New** -> **Resource** -> **Docker Compose**.
2. Escolha a fonte **GitHub** e selecione este repositorio e a branch `main`.
3. Em **Docker Compose Location**, deixe `/docker-compose.yml`.
4. Salve. O Coolify le o arquivo e lista os tres servicos.

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

### 6. Ligar o GitHub Actions

O workflow `.github/workflows/deploy.yml` compila API e front a cada push
na `main` e, se o build passar, chama a API do Coolify para implantar.

Crie um token em **Keys & Tokens** -> **API tokens** no Coolify e copie o
UUID da aplicacao (visivel na URL do recurso). Em seguida, no GitHub, em
**Settings** -> **Secrets and variables** -> **Actions**, cadastre:

| Secret | Valor |
| --- | --- |
| `COOLIFY_URL` | URL do painel, sem barra no fim |
| `COOLIFY_TOKEN` | o token de API |
| `COOLIFY_UUID` | UUID da aplicacao |

Com isso, desative **Auto Deploy** no Coolify, para o deploy acontecer
apenas quando o build do Actions passar.

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
