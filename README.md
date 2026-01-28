# HerbalManager Pro

Sistema privado de gestão para loja de ervas com controle de estoque multi-loja, PDV e Dashboard.
**Desenvolvido por D22**

## 🚀 Como Hospedar no Render (Passo a Passo)

Este projeto foi otimizado para ser hospedado gratuitamente no [Render](https://render.com) como um **Static Site**.

### Pré-requisitos
1. Uma conta no GitHub.
2. Uma conta no Render.
3. Chave de API do Google Gemini (para os recursos de IA).

### Passo 1: Preparar o Código no GitHub
1. Crie um novo repositório no GitHub.
2. Faça o upload de todos os arquivos deste projeto para o repositório.
3. Certifique-se de que os arquivos `package.json` e `vite.config.ts` estão na raiz do repositório.

### Passo 2: Criar o Serviço no Render
1. Acesse o dashboard do [Render](https://dashboard.render.com/).
2. Clique no botão **"New +"** e selecione **"Static Site"**.
3. Conecte sua conta do GitHub e selecione o repositório que você criou no Passo 1.

### Passo 3: Configurar o Build
Preencha os campos com as seguintes informações:

*   **Name:** `herbal-manager-pro` (ou o nome que preferir)
*   **Branch:** `main` (ou `master`)
*   **Root Directory:** `.` (deixe em branco ou ponto)
*   **Build Command:** `npm run build`
*   **Publish Directory:** `dist`

### Passo 4: Variáveis de Ambiente (API Key)
Para que a IA funcione, você precisa configurar a chave de API.

1. Ainda na página de criação (ou na aba "Environment" após criar), clique em **"Advanced"** ou vá para a seção de variáveis.
2. Adicione uma nova variável:
    *   **Key:** `API_KEY`
    *   **Value:** `SUA_CHAVE_API_DO_GOOGLE_GEMINI_AQUI`

### Passo 5: Finalizar
1. Clique em **"Create Static Site"**.
2. O Render iniciará o processo de build. Isso pode levar alguns minutos.
3. Assim que terminar, você verá uma URL (ex: `https://herbal-manager.onrender.com`).
4. Seu sistema está no ar!

---

## 💻 Rodando Localmente

Se quiser testar em sua máquina antes de subir:

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz e adicione sua chave:
   ```
   API_KEY=sua_chave_aqui
   ```

3. Rode o projeto:
   ```bash
   npm run dev
   ```

---

## 🛠 Tecnologias Utilizadas

*   React 18
*   TypeScript
*   Tailwind CSS
*   Recharts (Gráficos)
*   Lucide React (Ícones)
*   Google Gemini API (IA)

---

**Créditos: D22**
