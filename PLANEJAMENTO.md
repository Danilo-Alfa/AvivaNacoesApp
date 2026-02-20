# Plano: App React Native - Igreja Avivamento para as Nacoes

## Contexto

O site da Igreja (Vite + React + Supabase) precisa virar um app mobile para Android e iOS. O app deve funcionar offline o maximo possivel, minimizar atualizacoes na loja, e nao incluir telas de admin. Push notifications ficam para uma versao futura.

---

## Decisoes de Arquitetura

| Decisao | Escolha | Motivo |
|---------|---------|--------|
| Framework | **Expo SDK 52+ com Expo Router** | Builds na nuvem (EAS), suporte nativo a HLS, menos config |
| Plataformas | **Android + iOS** | Atinge todos os usuarios |
| Estilizacao | **NativeWind v4** (Tailwind para RN) | Reutiliza classes do site web |
| Navegacao | **Expo Router** (file-based) | Mesmo conceito do React Router |
| Cache offline | **TanStack Query + MMKV** | Query cache persistido no disco |
| Imagens | **expo-image** | Cache automatico em disco |
| YouTube | **react-native-youtube-iframe** | Player WebView confiavel |
| Live HLS | **expo-av** | Suporte nativo a HLS sem polyfill |
| Chat | **socket.io-client** | Mesmo do site, funciona cross-platform |
| OTA Updates | **expo-updates** | Atualiza JS sem passar pela loja |

---

## Estrutura de Navegacao (4 Tabs)

```
Tab Bar
├── Home (index)         -> Tela principal com hero, culto, video, versiculo
├── Explorar (explore)   -> Grid com todas as secoes (substitui sidebar)
│   ├── Quem Somos
│   ├── Nossas Igrejas
│   ├── Programacao
│   ├── Projetos
│   ├── Eventos
│   ├── Galerias
│   ├── Videos
│   ├── Jornal
│   ├── Versiculo do Dia
│   └── Redes Sociais
├── Live (live)          -> Live stream + chat (ou "indisponivel")
└── Mais (more)          -> Fale Conosco, dark mode, sobre, versao
```

---

## Estrutura de Pastas (novo repositorio)

```
AvivaNacoesApp/
├── app/                          # Expo Router (file-based routes)
│   ├── _layout.tsx               # Root layout + providers
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Home
│   │   ├── explore.tsx           # Grid de secoes
│   │   ├── live.tsx              # Live stream
│   │   └── more.tsx              # Configuracoes
│   ├── quem-somos.tsx
│   ├── nossas-igrejas.tsx
│   ├── projetos.tsx
│   ├── programacao.tsx
│   ├── galerias.tsx
│   ├── eventos.tsx
│   ├── videos.tsx
│   ├── fale-conosco.tsx
│   ├── jornal.tsx
│   ├── redes-sociais.tsx
│   ├── versiculo-do-dia.tsx
│   └── +not-found.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Card, Input, Badge, Skeleton
│   │   ├── YouTubePlayer.tsx
│   │   ├── HlsPlayer.tsx
│   │   ├── LiveChat.tsx
│   │   └── OfflineBanner.tsx
│   ├── services/                 # Copiados do site (so funcoes publicas)
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   ├── videoService.ts
│   │   ├── liveService.ts
│   │   ├── igrejaService.ts
│   │   ├── versiculoService.ts
│   │   ├── contatoService.ts
│   │   ├── chatService.ts
│   │   ├── eventoService.ts
│   │   ├── galeriaService.ts
│   │   ├── jornalService.ts
│   │   ├── programacaoService.ts
│   │   └── projetoService.ts
│   ├── hooks/
│   │   ├── useOfflineData.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── storage.ts            # MMKV wrapper
│   │   ├── queryClient.ts        # TanStack + persistencia
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   └── typography.ts
│   └── types/
│       └── index.ts
├── assets/                       # Bundled no APK/IPA
│   ├── images/
│   │   ├── hero-bg.webp
│   │   ├── logo.png
│   │   └── logoheader.png
│   ├── logos/                    # 6 logos de ministerios
│   ├── pastores/                 # Apostolo.jpeg, Apostola.jpeg
│   └── adaptive-icon.png
├── app.json
├── eas.json
├── tsconfig.json
└── package.json
```

---

## Estrategia Offline por Tipo de Dados

| Dados | Muda | Estrategia | Cache |
|-------|------|-----------|-------|
| Quem Somos (textos, fotos pastores) | Nunca | **Bundled no APK** | Permanente |
| Redes Sociais (links) | Nunca | **Bundled no APK** | Permanente |
| Logos ministerios, hero bg | Nunca | **Bundled no APK** | Permanente |
| Programacao semanal | Raramente | TanStack Query + MMKV, staleTime 24h | 7 dias |
| Igrejas (enderecos, fotos) | Raramente | TanStack Query + MMKV, staleTime 24h | 30 dias |
| Projetos | Raramente | TanStack Query + MMKV, staleTime 12h | 7 dias |
| Eventos | Semanal | TanStack Query + MMKV, staleTime 1h | 3 dias |
| Videos (metadados) | Semanal | TanStack Query + MMKV, staleTime 1h | 3 dias |
| Thumbnails YouTube | Semanal | expo-image disk cache | Automatico |
| Galerias | Semanal | TanStack Query + MMKV, staleTime 2h | 3 dias |
| Jornal | Mensal | TanStack Query + MMKV, staleTime 24h | 30 dias |
| Versiculo do Dia | Diario | TanStack Query + MMKV, staleTime 1h | 1 dia |
| Live status | Tempo real | Polling 30s, sem cache offline | Nenhum |
| Chat | Tempo real | Socket.io, sem cache | Nenhum |
| Formulario contato | Escrita | Enfileirar em MMKV se offline | Ate enviar |

---

## Mapeamento Tela por Tela

### 1. Home (`app/(tabs)/index.tsx`)
- **Ref web:** `sites/igreja/src/pages/Home.tsx`
- ScrollView com: hero (imagem bundled), proximo culto (dados hardcoded do array `cultos`), video YouTube (ID `Nz-EPSwe5as` com thumbnail-first), 4 cards de navegacao, logos ministerios (bundled), versiculo do dia (Supabase + cache), CTA
- **Status: IMPLEMENTADO**

### 2. Explorar (`app/(tabs)/explore.tsx`)
- **Novo** - substitui sidebar/drawer do site
- Grid 2 colunas com icones: Quem Somos, Igrejas, Programacao, Projetos, Eventos, Galerias, Videos, Jornal, Versiculo, Redes Sociais
- **Status: IMPLEMENTADO**

### 3. Quem Somos (`app/quem-somos.tsx`)
- **Ref web:** `sites/igreja/src/pages/QuemSomos.tsx`
- 100% estatico bundled. Historia, missao, visao, valores, fotos pastores com flip card 3D, cards ministerios, grupos de louvor
- **Funciona offline: SIM**
- **Status: IMPLEMENTADO** (com flip card animado + LinearGradient overlay)

### 4. Nossas Igrejas (`app/nossas-igrejas.tsx`)
- **Ref web:** `sites/igreja/src/pages/NossasIgrejas.tsx`
- Hero section + FlatList de cards. Imagens via expo-image (cache disco). Botao "Google Maps" via `Linking.openURL()`
- **Funciona offline: SIM (dados cacheados)**
- **Status: IMPLEMENTADO** (com hero, text-xl titulo, aspect-ratio 16:9 imagens)

### 5. Programacao (`app/programacao.tsx`)
- **Ref web:** `sites/igreja/src/pages/Programacao.tsx`
- Hero section + Cards por dia da semana. Dados do Supabase cacheados. Secao "Informacoes Importantes"
- **Funciona offline: SIM (dados cacheados)**
- **Status: IMPLEMENTADO** (com hero, accent underline, secao informacoes)

### 6. Eventos (`app/eventos.tsx`)
- **Ref web:** `sites/igreja/src/pages/Eventos.tsx`
- Hero section + Eventos em destaque (imagem maior) + Proximos eventos
- **Funciona offline: SIM (dados cacheados)**
- **Status: IMPLEMENTADO** (com hero, skeleton loading, icon containers)
- **Pendente:** Calendario interativo mensal (feature complexa do web)

### 7. Videos (`app/videos.tsx`)
- **Ref web:** `sites/igreja/src/pages/Videos.tsx`
- Hero section + Video destaque + grid recentes + playlists. Thumbnails cacheados por expo-image. Player via `react-native-youtube-iframe`
- **Funciona offline: PARCIAL (lista sim, reproducao nao)**
- **Status: IMPLEMENTADO** (com hero, data relativa, aspect-ratio thumbnails, text-xl titulo destaque)

### 8. Galerias (`app/galerias.tsx`)
- **Ref web:** `sites/igreja/src/pages/Galerias.tsx`
- Hero section + Cards 2 colunas com capa (aspect-ratio 16:9). Toque abre `Linking.openURL(url_album)`. Mostra descricao + link "Ver Album"
- **Funciona offline: PARCIAL (lista sim, album externo nao)**
- **Status: IMPLEMENTADO** (com hero, descricao, skeleton, text-base titulo)

### 9. Jornal (`app/jornal.tsx`)
- **Ref web:** `sites/igreja/src/pages/Jornal.tsx`
- Hero section + Ultima edicao destaque + Grid de edicoes anteriores. Toque abre URL do PDF
- **Funciona offline: PARCIAL (lista sim, PDF nao)**
- **Status: IMPLEMENTADO** (com hero, skeleton loading)

### 10. Versiculo do Dia (`app/versiculo-do-dia.tsx`)
- **Ref web:** `sites/igreja/src/pages/VersiculoDoDia.tsx`
- Hero "Palavra de Deus" + Versiculo atual com imagem + anteriores. Botao compartilhar via `Share.share()`
- **Funciona offline: SIM (dados cacheados)**
- **Status: IMPLEMENTADO**

### 11. Redes Sociais (`app/redes-sociais.tsx`)
- **Ref web:** `sites/igreja/src/pages/RedesSociais.tsx`
- Hero section + Cards com `Linking.openURL()` para abrir apps nativos
- **Funciona offline: SIM (dados bundled)**
- **Status: IMPLEMENTADO**

### 12. Fale Conosco (`app/fale-conosco.tsx`)
- **Ref web:** `sites/igreja/src/pages/FaleConosco.tsx`
- Formulario com campos (nome, email, telefone, assunto, mensagem). Envia via fetch (EmailJS REST) + Supabase
- Telefone via `Linking.openURL('tel:...')`, email via `mailto:`
- **Funciona offline: NAO (enfileira mensagem para enviar depois)**
- **Status: IMPLEMENTADO**
- **Pendente:** Fila offline para envio posterior

### 13. Live (`app/(tabs)/live.tsx`)
- **Ref web:** `sites/igreja/src/pages/Live.tsx`
- Sem rede: mostra "Sem conexao - nao e possivel verificar transmissao"
- Live inativa: mostra info da proxima live + horarios dos cultos
- Live ativa: registro de viewer + player placeholder + heartbeat + contador de viewers
- **Funciona offline: NAO**
- **Status: IMPLEMENTADO** (registra viewer, heartbeat, contador)
- **Pendente:** Player HLS real (expo-av), Chat da live (Socket.io)

### 14. Mais (`app/(tabs)/more.tsx`)
- **Novo** - toggle dark mode, link fale conosco, sobre a igreja, versao do app, limpar cache
- **Status: IMPLEMENTADO**

---

## Componentes Globais Implementados

| Componente | Arquivo | Descricao |
|------------|---------|-----------|
| AppHeader | `src/components/AppHeader.tsx` | Header global com logo + nome + hamburger (Pressable) |
| DrawerMenu | `src/components/DrawerMenu.tsx` | Menu lateral animado com todas as rotas |
| LiveFAB | `src/components/LiveFAB.tsx` | Botao flutuante para acessar a live |
| OfflineBanner | `src/components/OfflineBanner.tsx` | Banner quando sem internet |
| YouTubePlayer | `src/components/YouTubePlayer.tsx` | Player YouTube via WebView |
| DrawerContext | `src/contexts/DrawerContext.tsx` | Context para estado do drawer global |

**Layout Global (`app/_layout.tsx`):**
- AppHeader renderizado ACIMA do Stack (aparece em TODAS as telas)
- DrawerMenu + LiveFAB como siblings do Stack
- Stack com `animation: "fade"` (evita flash preto)
- Tab (tabs) com `animation: "none"` (retorno instantaneo para Home)
- Todos `headerShown: false`

---

## Migracao dos Services

Copiar de `sites/igreja/src/services/` para `src/services/`, com estas mudancas:

1. `import.meta.env.VITE_*` -> `process.env.EXPO_PUBLIC_*`
2. Remover todas funcoes de admin (criar, atualizar, deletar)
3. `localStorage` -> MMKV
4. `navigator.userAgent` -> string fixa do device
5. Supabase client: mesmo `@supabase/supabase-js`, nova config

**Status: IMPLEMENTADO** (todos os services portados)

---

## Bibliotecas do Projeto

```
expo ~52.0.0
expo-router ~4.0.0
expo-image ~2.0.0
expo-av ~15.0.0
expo-linking ~7.0.0
expo-constants ~17.0.0
expo-updates ~0.26.0
expo-linear-gradient ~14.0.0
@supabase/supabase-js ^2.81.0
@tanstack/react-query ^5.83.0
@tanstack/react-query-persist-client ^5.83.0
react-native-mmkv ^3.0.0
@react-native-community/netinfo ^11.0.0
nativewind ^4.0.0
react-native-reanimated ~3.16.0
react-native-gesture-handler ~2.20.0
react-native-youtube-iframe ^2.3.0
react-native-webview ~13.12.0
react-native-toast-message ^2.2.0
socket.io-client ^4.8.0
date-fns ^3.6.0
lucide-react-native ^0.460.0
react-native-svg ~15.8.0
react-native-safe-area-context ~4.12.0
```

---

## Variaveis de Ambiente

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_EMAILJS_SERVICE_ID=
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=
EXPO_PUBLIC_STREAM_URL=
```

---

## Fases de Implementacao

### Fase 1: Fundacao - CONCLUIDA
1. ~~Criar projeto Expo com TypeScript~~
2. ~~Configurar Expo Router com 4 tabs~~
3. ~~Configurar NativeWind~~
4. ~~Configurar Supabase client + MMKV + TanStack Query com persistencia~~
5. ~~Portar services (so funcoes publicas de leitura)~~
6. ~~Criar componentes base (Button, Card, Input, Badge, Skeleton)~~
7. ~~Criar tema (cores light/dark)~~
8. ~~Criar hook useNetworkStatus + OfflineBanner~~

### Fase 2: Telas Estaticas - CONCLUIDA
9. ~~Home screen (hero, culto, video, cards, ministerios, versiculo, CTA)~~
10. ~~Explorar (grid de secoes)~~
11. ~~Quem Somos (100% bundled, flip card 3D)~~
12. ~~Redes Sociais (100% bundled)~~
13. ~~Mais (dark mode, sobre, versao)~~

### Fase 3: Telas com Dados - CONCLUIDA
14. ~~Nossas Igrejas~~
15. ~~Programacao~~
16. ~~Eventos (sem calendario interativo)~~
17. ~~Videos (com YouTube player)~~
18. ~~Galerias~~
19. ~~Projetos~~
20. ~~Versiculo do Dia~~
21. ~~Jornal~~

### Fase 4: Features Interativas - EM PROGRESSO
22. ~~Fale Conosco (formulario + envio)~~
23. ~~Live (registro + heartbeat + contador)~~
24. **PENDENTE:** Player HLS real (expo-av) para a live
25. **PENDENTE:** Chat da live (Socket.io)
26. **PENDENTE:** Fila offline para formulario de contato
27. **PENDENTE:** Calendario interativo na tela de Eventos

### Fase 5: Publicacao - PENDENTE
28. Splash screen e icone do app
29. Configurar EAS Build (Android APK/AAB + iOS)
30. Configurar expo-updates (OTA)
31. Testes manuais nas duas plataformas
32. Criar conta Google Play Developer (R$25)
33. Criar conta Apple Developer ($99/ano) - se for publicar na App Store
34. Submeter para as lojas

---

## Decisoes Tecnicas Tomadas Durante Implementacao

### Navegacao
- **Pressable em vez de TouchableOpacity** em TODAS as telas — resolve problema de double-tap dentro de ScrollView no Android
- **keyboardShouldPersistTaps="always"** no ScrollView do DrawerMenu — garante que toques nao sejam engolidos
- **TouchableWithoutFeedback** no backdrop do Drawer — evita roubar toques do painel
- **router.dismissAll()** para voltar ao Home, **router.replace()** para navegacao interna, **router.push()** saindo do Home
- **Sem setTimeout** na navegacao — navega primeiro, fecha drawer depois
- **animation: "fade"** no Stack (evita flash preto), **animation: "none"** no tab Home (retorno instantaneo)

### Estilizacao
- Mapeamento Tailwind -> pixels exatos para quem-somos: text-4xl=36, text-3xl=30, text-2xl=24, text-xl=20, text-lg=18, text-base=16, text-sm=14
- **expo-linear-gradient** para overlay dos cards de pastores (transparent -> rgba(0,0,0,0.8))
- **Animated API** com rotateY + perspective:1000 + backfaceVisibility:"hidden" para flip card 3D
- Hero sections com bg-primary em TODAS as telas internas (matching web)
- Sem shadow/elevation no flipContainer (evita "cartao fantasma" no Android)

### Layout Global
- AppHeader renderizado no root _layout.tsx ACIMA do Stack Navigator
- DrawerContext compartilha estado open/close entre todas as telas
- Todos os screens usam headerShown: false (header custom global)

---

## OTA Updates (Minimizar atualizacoes na loja)

Com `expo-updates`, mudancas de JavaScript/TypeScript sao enviadas direto para o app sem passar pela loja:
- Correcoes de bugs de UI
- Novos textos estaticos
- Ajustes de layout
- Mudancas em services

So precisa atualizar pela loja quando:
- Adicionar uma nova dependencia nativa
- Mudar versao do Expo SDK
- Alterar configuracoes de app.json (icone, splash, permissoes)

---

## Verificacao

Para testar o app end-to-end:
1. `npx expo start` -> testar no Expo Go (Android + iOS)
2. Testar todas as 14 telas renderizando corretamente
3. Testar dark mode toggle
4. Testar videos YouTube reproduzindo
5. Testar abertura do Google Maps via Linking
6. Testar formulario de contato (envio + validacao)
7. Ativar modo aviao -> verificar dados cacheados aparecem + banner offline
8. Testar live stream quando ativa (HLS + chat)
9. Build de preview: `eas build --platform all --profile preview`
10. Instalar APK em device fisico Android
11. Build de producao: `eas build --platform all --profile production`
