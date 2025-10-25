# Hospital Inteligente

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular)](https://angular.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)

Base fullstack do sistema **Hospital Inteligente**, composta por **FastAPI + Angular + PostgreSQL**.
O foco atual está em autenticação, autorização e gestão de usuários, servindo como alicerce para
novos módulos clínicos e operacionais.

O frontend oferece internacionalização com suporte a **Português** e **Inglês** – o idioma pode ser
alternado pelo menu superior da aplicação.

Esta versão também traz um módulo de **Pacientes**, permitindo CRUD completo e filtros por gênero
para consultas rápidas diretamente na API.

---

## 🚀 Tecnologias
- **Backend:** Python 3.12, FastAPI, SQLAlchemy, JWT, Passlib, Swagger/OpenAPI  
- **Frontend:** Angular 19, Angular Material, ngx-toastr  
- **Banco:** PostgreSQL 16  
- **Infra:** Docker, Docker Compose, Nginx  

---

## ⚙️ Como Rodar

### 🔹 Opção 1: Com Docker (recomendado)

#### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/)  
- [Docker Compose](https://docs.docker.com/compose/)  

#### Passos
```bash
# clonar repositório
git clone https://github.com/seu-usuario/hospital-inteligente.git
cd hospital-inteligente

# configurar variáveis de ambiente
cp .env.example .env
# edite .env se precisar alterar credenciais/URLs

# subir os containers
docker compose up -d --build
```

---

### 🔹 Opção 2: Localmente (sem Docker)

#### Pré-requisitos
- [Python 3.12](https://www.python.org/downloads/)  
- [Node.js](https://nodejs.org/)  
- Banco de dados PostgreSQL rodando localmente

#### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# personalize o arquivo conforme o seu ambiente
source .env  # carrega as variáveis (PowerShell: Get-Content .env | ForEach-Object { if($_ -and $_ -notmatch '^#') { $name,$value = $_ -split '=',2; Set-Item env:$name $value } })
# caso prefira, exporte manualmente: export DATABASE_URL="$LOCAL_DATABASE_URL"

python scripts/run_migrations.py

uvicorn app.main:app --reload --port 8080
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🌐 Endpoints

- **Frontend:** http://localhost:4200  
- **Backend:** http://localhost:8080  
- **Swagger UI:** http://localhost:8080/swagger-ui  
- **Banco de Dados:** postgres://localhost:5434/hospital_db  
- **Pacientes:** `GET /patients`, `POST /patients`, `PUT /patients/{id}`, `DELETE /patients/{id}`  
- **Médicos:** `GET /doctors`, `POST /doctors`, `PUT /doctors/{id}`, `DELETE /doctors/{id}`  
- **Pacotes extras:** `POST /patients/{id}/create-user` (gera acesso de portal para o paciente)
- **Domínios:** `GET /domains/roles` e `GET /domains/genders`

---

## 👤 Usuário Padrão

Um usuário administrador é criado automaticamente na primeira execução:

- **Usuário:** admin@hospital.com  
- **Senha:** 123456

---

## 🐳 Imagens Docker & Deploy CI/CD

Commits enviados para `main` (ou execuções manuais do workflow) disparam uma action que constrói e envia as imagens Docker do backend e do frontend para o GitHub Container Registry (`ghcr.io`).

Cada imagem recebe as tags:
- `latest`, apontando sempre para a build mais recente da branch `main`;
- `sha-<commit>`, permitindo versionamento imutável.

O workflow usa o `GITHUB_TOKEN` padrão, portanto não exige secrets adicionais para publicar as imagens.

### Rodando migrations via CI

Ao final do build na branch `main`, o job `run-migrations` executa `backend/scripts/run_migrations.py`. Para habilitá-lo:

1. Acesse as configurações do repositório em GitHub → *Settings* → *Secrets and variables* → *Actions*.
2. Clique em **New repository secret**.
3. Defina o nome `MIGRATIONS_DATABASE_URL`.
4. Informe a string de conexão do banco (ex.: `postgresql+psycopg://usuario:senha@host:5432/banco`).
5. Salve. A partir do próximo build em `main`, as migrations rodarão usando essa URL.

### Disparando deploys no Render

Se você utilizar Deploy Hooks do Render, o workflow também consegue chamar esses endpoints ao final da pipeline:

1. Crie os secrets `RENDER_BACKEND_DEPLOY_HOOK_URL` e/ou `RENDER_FRONTEND_DEPLOY_HOOK_URL` seguindo o mesmo caminho (*Settings → Secrets and variables → Actions* → **New repository secret**).
2. Em cada secret, informe o URL privado fornecido pelo Render para disparar o deploy do respectivo serviço.
3. Com os secrets configurados, o job `trigger-deploy-hooks` chamará cada hook (quando presente) após a conclusão do build e das migrations na branch `main`.
