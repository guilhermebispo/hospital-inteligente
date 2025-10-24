# Hospital Inteligente – Backend

Aplicação FastAPI que serve a plataforma Hospital Inteligente, concentrando autenticação, autorização e gestão centralizada de usuários.

## 📦 Imagem Docker

A imagem oficial é gerada automaticamente pelo GitHub Actions e publicada no GitHub Container Registry.

- **Repositório:** `ghcr.io/guilhermebispo/hospital-inteligente-backend`
- **Tags disponibilizadas:**
  - `latest` → build mais recente da branch `main`
  - `sha-<commit>` → build imutável associada a cada commit

### Como baixar

```bash
docker pull ghcr.io/guilhermebispo/hospital-inteligente-backend:latest
```

### Como executar

```bash
docker run --rm -p 8080:8080 \
  -e DATABASE_URL=postgresql+psycopg://usuario:senha@host:5432/hospital_db \
  -e JWT_SECRET=substitua-por-uma-chave-segura \
  ghcr.io/guilhermebispo/hospital-inteligente-backend:latest
```

> O serviço é servido via `uvicorn` na porta `8080`. Confirme que o banco está acessível antes de subir o container.

### Variáveis de ambiente suportadas

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | URL de conexão SQLAlchemy (ex.: `postgresql+psycopg://usuario:senha@host:5432/banco`) |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | Alternativa para informar somente credenciais, mantendo o host na URL |
| `JWT_SECRET` | Chave utilizada na assinatura dos tokens JWT |
| `JWT_ALGORITHM` | Algoritmo do JWT (padrão `HS256`) |
| `JWT_EXPIRATION_MS` | Tempo de expiração dos tokens em milissegundos (padrão `86400000`) |
| `CORS_ALLOWED_ORIGINS` | Lista de origens permitidas (separadas por vírgula) |
| `PORT` | Porta exposta pelo FastAPI (padrão `8080`) |

## 🔗 Endpoints principais

- **Swagger UI:** `http://localhost:8080/swagger-ui`
- **Healthcheck simples:** `GET /health`

## 🚀 Ambiente de desenvolvimento

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # personalize variáveis conforme necessário
python scripts/run_migrations.py
uvicorn app.main:app --reload --port 8080
```
