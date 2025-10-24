# Hospital Inteligente – Frontend

Aplicação Angular 19 que provê a interface web do Hospital Inteligente, servida por Nginx em produção e empacotada automaticamente pelo GitHub Actions.

## 📦 Imagem Docker

A imagem oficial está publicada no GitHub Container Registry.

- **Repositório:** `ghcr.io/guilhermebispo/hospital-inteligente-frontend`
- **Tags disponibilizadas:**
  - `latest` → build mais recente da branch `main`
  - `sha-<commit>` → build imutável vinculada a cada commit

### Como baixar

```bash
docker pull ghcr.io/guilhermebispo/hospital-inteligente-frontend:latest
```

### Como executar

```bash
docker run --rm -p 4200:80 \
  ghcr.io/guilhermebispo/hospital-inteligente-frontend:latest
```

O Nginx expõe a aplicação em `http://localhost:4200`. A URL da API backend é definida nos arquivos de ambiente de Angular (`src/environments`). Para apontar para outra API, gere uma nova build ajustando `environment.ts`/`environment.prod.ts`.
