# SteamHelperScripts 🎮

Coleção de scripts Tampermonkey para melhorar a usabilidade do Steam e aumentar a velocidade de trocas, vendas e outras atividades no marketplace.

---

## 📋 Índice

- [Scripts Disponíveis](#scripts-disponíveis)
  - [Steam - Market Auto Order and Register Key](./scripts/SteamMarketAutoOrderAndRegisterKey.js)
  - [Steam - Pesquisa para Troca](./scripts/SteamPesquisaParaTroca.js)
- [Instalação](#instalação)
- [Guia de Uso](#guia-de-uso)
- [Recursos](#recursos)
- [Licença](#licença)

---

## 📦 Scripts Disponíveis

### 1. **Steam - Market Auto Order and Register Key** ⚡
**Versão:** 4.2.1 | **Arquivo:** [SteamMarketAutoOrderAndRegisterKey.js](./scripts/SteamMarketAutoOrderAndRegisterKey.js)

Automatiza o processo de compra no marketplace do Steam e registro de product keys.

#### Funcionalidades:
- 🤖 **Auto Buy**: Abre automaticamente o diálogo de compra ao acessar uma página de listing com `?autobuy=1`
- 📋 **SSA Automático**: Marca automaticamente o checkbox de aceite do Steam Subscriber Agreement
- 💰 **Preço Inteligente**: Preenche automaticamente o campo de preço com a maior oferta de compra + 0.01
- 🎯 **Modal Compacto**: Redimensiona e reposiciona o modal de compra para melhor visualização
- 🔐 **Registro de Keys**: Marca SSA e submete formulário automaticamente na página de registro
- 🔗 **Batch Buy**: Cria botão para abrir múltiplas páginas de compra em abas

#### Páginas Suportadas:
- `https://steamcommunity.com/market/listings/*` (Marketplace)
- `https://steamcommunity.com/id/*/gamecards/*` (Game Cards - Perfil)
- `https://steamcommunity.com/profiles/*/gamecards/*` (Game Cards - Perfil)
- `https://store.steampowered.com/account/registerkey*` (Registro de Keys)

---

### 2. **Steam - Pesquisa para Troca** 🔍
**Versão:** 2.0 | **Arquivo:** [SteamPesquisaParaTroca.js](./scripts/SteamPesquisaParaTroca.js)

Pesquisa uma lista de jogos na sua biblioteca Steam e identifica quais você já possui e quais faltam.

#### Funcionalidades:
- 📝 **Cole uma Lista**: Cola nomes de jogos (um por linha, suporta marcadores como `*`, `-`, `•`)
- 🔎 **Pesquisa Automática**: Pesquisa cada jogo no campo de busca da sua biblioteca
- ✅ **Resultado Organizado**: Mostra jogos que você tem e não tem
- 🔗 **Links Diretos**: Gera links para cada jogo no Store do Steam
- 📋 **Copiar Lista**: Copia a lista de jogos faltantes para a área de transferência
- 🌐 **Abrir Todos**: Abre todos os links de jogos faltantes em abas

#### Páginas Suportadas:
- `https://steamcommunity.com/id/*/games/*` (Sua biblioteca de jogos)
- `https://steamcommunity.com/profiles/*/games/*` (Sua biblioteca de jogos)

---

## 🚀 Instalação

### Pré-requisitos
- Um navegador moderno (Chrome, Firefox, Edge, Opera, Brave)
- Extensão **Tampermonkey** instalada:
  - [Tampermonkey para Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobp55f)
  - [Tampermonkey para Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
  - [Tampermonkey para outros navegadores](https://www.tampermonkey.net/)

### Passo a Passo

#### 1. **Abrir o Tampermonkey**
   - Clique no ícone da extensão Tampermonkey na barra de ferramentas
   - Selecione **"Criar um novo script"**

#### 2. **Copiar o Código do Script**
   - Acesse o script desejado neste repositório:
     - [SteamMarketAutoOrderAndRegisterKey.js](./scripts/SteamMarketAutoOrderAndRegisterKey.js)
     - [SteamPesquisaParaTroca.js](./scripts/SteamPesquisaParaTroca.js)
   - Clique em **"Raw"** ou **"Copy Raw"** para copiar o código completo
   - Ou copie o código direto do arquivo

#### 3. **Colar no Tampermonkey**
   - Na aba do Tampermonkey, **limpe o código padrão** que aparece
   - **Cole todo o código** do script que você copiou
   - Substitua todo o conteúdo (não anexe)

   ```javascript
   // ==UserScript==
   // @name         Steam - Market Auto Order and Register Key
   // @namespace    https://steamcommunity.com
   // ...
   // Resto do código aqui
   ```

#### 4. **Salvar o Script**
   - Pressione **Ctrl + S** (ou Cmd + S no Mac)
   - Ou clique em **File** → **Save**
   - Você verá uma mensagem de confirmação

#### 5. **Verificar Instalação**
   - Você verá o script listado em **"Meus Scripts"** no Tampermonkey
   - O ícone ao lado indicará se está ✅ **ativo**

---

## 📖 Guia de Uso

### Script 1: Auto Order and Register Key

#### **Para Auto Buy (Compra Automática)**
1. Abra uma página de listing do marketplace: `https://steamcommunity.com/market/listings/...`
2. Adicione `?autobuy=1` na URL
   - Exemplo: `https://steamcommunity.com/market/listings/753/123456-Item Name?autobuy=1`
3. A página carregará, o diálogo de compra abrirá automaticamente
4. O preço será preenchido com a maior oferta + 0.01
5. O checkbox de SSA será marcado automaticamente

#### **Para Batch Buy (Abrir múltiplas abas)**
1. Vá para suas **Game Cards**: `https://steamcommunity.com/id/seu-username/gamecards/`
2. Aparecerá um botão azul **"Abrir páginas de compra"** no topo
3. Clique para abrir todas as páginas de compra em abas simultâneas com `?autobuy=1`

#### **Para Registro de Keys**
1. Acesse: `https://store.steampowered.com/account/registerkey`
2. O script marcará o SSA e será enviado automaticamente quando disponível

---

### Script 2: Pesquisa para Troca

#### **Como Usar**
1. Acesse sua **biblioteca de jogos**: `https://steamcommunity.com/id/seu-username/games/?tab=all`
2. Aparecerá um botão azul **"Pesquisa para Troca"** no canto inferior direito
3. Clique no botão
4. Cole uma lista de jogos na caixa de texto:
   ```
   Jogo 1
   - Jogo 2
   * Jogo 3
   • Jogo 4
   ```
5. Clique em **"Enviar"**
6. O script pesquisará cada jogo na sua biblioteca
7. Você verá os resultados:
   - ❌ **Você não tem** (com links para comprar)
   - ✅ **Você já tem** (confirmados na biblioteca)

#### **Ações Após Pesquisa**
- 📋 **Copiar lista**: Copia os jogos que você não tem
- 🌐 **Abrir todos os links**: Abre todas as páginas de compra em abas
- ❌ **Fechar**: Fecha o resultado

---

## ⚙️ Recursos Técnicos

- **Linguagem**: JavaScript Vanilla
- **Compatibilidade**: Todos os navegadores com Tampermonkey
- **Dependências**: Nenhuma (zero dependências externas)
- **Performance**: Otimizado com debounce e observers eficientes
- **Segurança**: Apenas CSS e manipulação de DOM, sem acesso a dados sensíveis

---

## 🔧 Troubleshooting

### Script não funciona?

1. **Verifique se o Tampermonkey está ativo**
   - Clique no ícone e veja se há um checkmark ✓ ao lado do script

2. **Recarregue a página**
   - Pressione `F5` ou `Ctrl + R`

3. **Abra o Console do navegador**
   - Pressione `F12` → **Console**
   - Procure por mensagens de erro ou logs `[Steam Auto]`

4. **Verifique a URL**
   - Confirme que você está na página correta
   - A URL deve corresponder aos `@match` do script

5. **Atualize o script**
   - Verifique se há uma versão mais recente deste repositório

---

## 📝 Licença

Sem licença explícita. Todos os direitos reservados.

Para usar ou modificar estes scripts, entre em contato com o autor.

---

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! 

Abra uma issue ou envie um PR descrevendo sua ideia.

---

## 📧 Contato

- **GitHub**: [@tiagopalves](https://github.com/tiagopalves)
- **Repositório**: [SteamHelperScripts](https://github.com/tiagopalves/SteamHelperScripts)

---

**Última atualização:** 2026-08-19

✨ Aproveite os scripts e melhore sua experiência no Steam! ✨
