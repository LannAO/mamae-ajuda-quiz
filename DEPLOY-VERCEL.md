# Deploy na Vercel

Este projeto é um app TanStack Start (SSR + server functions). O build gera a
saída no formato Build Output API da Vercel, então não é necessário nenhum
adaptador extra.

## Passo a passo

1. Conecte este projeto ao GitHub (menu + → GitHub → Connect project).
2. Na Vercel: **Add New → Project** e importe o repositório.
3. Framework Preset: **Other** (o `vercel.json` do repositório já define
   `buildCommand` e `NITRO_PRESET=vercel`).
4. Cadastre as variáveis de ambiente (Project Settings → Environment Variables)
   para Production e Preview:

| Variável                        | Uso                                | Exposta ao navegador |
| ------------------------------- | ---------------------------------- | -------------------- |
| `VITE_SUPABASE_URL`             | cliente do navegador               | sim                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | cliente do navegador               | sim                  |
| `VITE_SUPABASE_PROJECT_ID`      | cliente do navegador               | sim                  |
| `SUPABASE_URL`                  | servidor (SSR / server functions)  | não                  |
| `SUPABASE_PUBLISHABLE_KEY`      | servidor (leituras públicas)       | não                  |

Os valores são os mesmos que estão no `.env` deste projeto. Copie-os de lá.
Chaves privadas (service role) **não** são necessárias para este site e não
devem ser adicionadas.

5. Deploy. As rotas funcionam sem regras de rewrite: o SSR cuida de todas as
   URLs, incluindo refresh em links diretos.

## Observações

- Nada no código depende de APIs específicas de plataforma: sem `fs`,
  `child_process`, `sharp` ou binários nativos; segredos são lidos apenas
  dentro de handlers de servidor.
- O Meta Pixel e o Supabase funcionam igualmente na Vercel, pois usam apenas
  chamadas HTTP do navegador.
- O publish dentro da Lovable continua funcionando normalmente: o alvo padrão
  é preservado no build da Lovable e a Vercel só entra em ação com
  `NITRO_PRESET=vercel`.
- Domínio próprio: configure em Vercel → Project → Domains.
