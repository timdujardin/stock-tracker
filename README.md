# Beleggingsnieuws Tracker

PWA voor beleggingsnieuws per categorie met sentimentanalyse, AI-samenvattingen en langetermijnvooruitzichten.

## Tech stack

| Technologie             | Rol                                         |
| ----------------------- | ------------------------------------------- |
| React 19 + TypeScript   | UI framework                                |
| Vite                    | Build tool & dev server                     |
| Recharts                | Sentimenttrend- en outlookgrafieken         |
| Google Gemini 2.5 Flash | AI-samenvattingen en 10-jaar outlooks       |
| CSS Custom Properties   | Material Design 3 theming (light/dark)      |
| Service Worker          | PWA offline support                         |
| GitHub Actions          | CI/CD naar GitHub Pages                     |

## Projectstructuur

```
src/
├── components/
│   ├── atoms/          # ArticleCard, HighlightedArticleCard, SentimentBar, SentimentCounters,
│   │                   # SkeletonPulse, SkeletonArticleCard, SkeletonHighlightedCard, SkeletonSummary,
│   │                   # SkeletonCounters, ErrorDisplay, ThemeToggleButton
│   ├── molecules/      # ArticleList, DaySummary, SummaryPreview, SummaryResult, SentimentTrendChart
│   ├── organisms/      # AppHeader, CategorySection, SkeletonFeed, bottom-nav/BottomNav
│   └── pages/          # FeedPage, CategoryPage
├── config/             # app, feedSources, navigation, topicKeywords, sentimentKeywords
├── contexts/           # NewsFeedContext, GeminiSummaryContext, GeminiOutlookContext, GeminiUsageContext, ThemeContext
├── hooks/              # articleAnalysis, sentimentTrend, outlook, pagination, initialization, serviceWorker
├── services/           # newsFeed, geminiSummary, geminiOutlook
├── types/              # news, outlook, errors, index
└── utils/              # articleSorting, categoryLookup, sentiment, sentimentTrend, sourceExtraction,
                        # textCleaning, timeFormatting, topicDetection
```

**Ontwerpprincipes:**

- **Atomic Design** — componenten opgesplitst in atoms, molecules, organisms, pages
- **Composition + Context** — geen prop drilling; state via `NewsFeedContext`, `GeminiSummaryContext`, `GeminiOutlookContext`, `GeminiUsageContext`, `ThemeContext`
- **Services** — API-communicatie en data-fetching gescheiden van UI
- **Utils** — pure functies voor herbruikbare logica; geen `.find`/`.filter` in componenten
- **Typed errors** — discriminated union (`AppError`) met factory functions en `ErrorDisplay` component
- **CSS logical properties** — voor taalrichting-onafhankelijke layouts

## Layout

De app gebruikt een tab-gebaseerde navigatie met een bottom nav bar:

1. **Bottom navigation** — 5 tabs (Vandamme, Tourmaline, Ivanhoe, Carry trade, TSMC), altijd zichtbaar onderaan
2. **Categoriepagina** — per tab, met:
   - Header met categorie-icon, label en sentimenttellers (positief/negatief/neutraal)
   - Uitgelicht artikel (grootste card met sentiment-kleur)
   - AI-samenvatting (DaySummary) met mood-indicator
   - Sentimenttrend-lijngrafiek (afgelopen 14 dagen)
   - 10-jaar outlook-grafiek met bullish/bearish factoren (via Gemini AI)
   - Artikellijst met gepagineerde cards
3. **Responsive** — bullish/bearish factoren stapelen verticaal op mobiel; cards schalen mee

## Hoe het werkt

Nieuws wordt verzameld via **Google News RSS** en directe RSS-feeds. De proxy `api.rss2json.com` converteert RSS naar JSON om CORS te omzeilen. Per artikel wordt:

1. **Categorie** bepaald op basis van topic-keywords in de titel
2. **Sentiment** berekend (positief / negatief / neutraal) op basis van sentiment-keywords
3. **Bron** geëxtraheerd uit de Google News-titel (`"Headline - BronNaam"`) of het `author`-veld

Duplicaten worden gefilterd op basis van de eerste 80 karakters van de titel.

## Features

### Sentimenttrend

Een lijngrafiek toont de dagelijkse sentimentevolutie over de afgelopen 14 dagen. De lijn en punten kleuren groen (positief), rood (negatief) of neutraal op basis van de score. Minimum 2 dagen data vereist.

### 10-jaar outlook (AI)

Per investering (uitgezonderd Vandamme) genereert Gemini een langetermijnvooruitzicht op basis van recente nieuwskoppen, sentimentverdeling en markttrends. De output bevat:

- **Lijngrafiek** met scorepunten op jaar 0, 1, 2, 5, 8 en 10 (schaal -10 tot +10)
- **Bullish/bearish factoren** als gekleurde pills
- **Samenvatting** in 1-2 zinnen

Outlooks worden gecacht in `localStorage` (7 dagen TTL).

### AI-samenvattingen

Per categorie kan een AI-samenvatting gegenereerd worden. Focus op prijsbewegingen, risicosignalen en kansen voor beleggers. Samenvattingen worden gecacht per dag.

### Gemini API-limieten

| Limiet              | Waarde            |
| ------------------- | ----------------- |
| Requests per dag    | 20 (self-imposed) |

Zowel samenvattingen als outlooks tellen mee in dezelfde dagelijkse teller. De teller is zichtbaar in de header (`AI: x/20`) en wordt bijgehouden via `GeminiUsageContext`.

## Categorieën & bronnen

### Vandamme (`vd`)

| Eigenschap | Waarde                                        |
| ---------- | --------------------------------------------- |
| Sector     | Financiële analyse (BE)                       |
| Outlook    | Niet beschikbaar                              |
| Bronnen    | analyse.be, Google News (`"Jeroen Vandamme"`) |

### Tourmaline Oil (`to`)

| Eigenschap         | Waarde                                                      |
| ------------------ | ----------------------------------------------------------- |
| Sector             | Energie (aardgas)                                           |
| AI-link            | Indirect (stroom voor datacenters)                          |
| Prijsdriver        | Gasprijs / LNG-markt                                        |
| Geopolitiek risico | Middel (Canada/LNG)                                        |
| Karakter           | Defensiever, inkomen (sterke cashflow, speciale dividenden) |
| Bronnen            | naturalgasintel.com, tourmalineoil.com, theglobeandmail.com, marketscreener.com, morningstar.com, tradingeconomics.com, Google News |

**RSS-feeds:**

- `Tourmaline Oil TOU` — bedrijfsnieuws
- `naturalgasintel.com/feed/` — direct RSS (natural gas intelligence)
- `LNG Canada AECO natural gas` — LNG-markt en AECO-gasprijs
- `AECO gas price forecast Canada` — AECO-prijssignalen
- `"LNG Canada" "phase 2" OR "expansion"` — LNG Canada fase 2
- `natural gas data center power demand` — AI-gerelateerde gasvraag
- `site:theglobeandmail.com OR site:marketscreener.com "Tourmaline Oil"` — financiële pers
- `site:morningstar.com "Tourmaline Oil"` — analistendata
- `site:tourmalineoil.com` — bedrijfswebsite
- `site:tradingeconomics.com "Tourmaline Oil"` — economische data

**Signalen:**
| Signaal | Impact | Actie |
|---|---|---|
| AECO-gasprijs herstelt | Positief | Herwaardering verwachten |
| LNG Canada fase 2 bevestigd | Positief | Positie eventueel vergroten |

### Ivanhoe Mines (`iv`)

| Eigenschap         | Waarde                                                              |
| ------------------ | ------------------------------------------------------------------- |
| Sector             | Mijnbouw (koper)                                                    |
| AI-link            | Direct (koper als materiaal)                                        |
| Prijsdriver        | Koperprijs                                                          |
| Geopolitiek risico | Hoog (DRC)                                                          |
| Karakter           | Groeier, hogere volatiliteit (groeiende cashflow, investeringsfase) |
| Bronnen            | ivanhoemines.com, investing.com, morningstar.com, theglobeandmail.com, reuters.com, cnbc.com, finance.yahoo.com, tradingeconomics.com, hl.co.uk, morningstar.com.au, Google News |

**RSS-feeds:**

- `site:ivanhoemines.com` — direct van Ivanhoe Mines
- `"Ivanhoe Mines" OR "Kamoa-Kakula" copper` — bedrijfsnieuws
- `site:investing.com "Ivanhoe Mines" OR IVN.TO` — investing.com
- `site:morningstar.com "Ivanhoe Mines" OR "IVN" copper` — morningstar.com
- `copper price forecast outlook demand` — koperprijssignalen
- `DRC Congo mining political instability` — DRC geopolitiek
- `site:theglobeandmail.com OR site:reuters.com "Ivanhoe Mines"` — financiële pers
- `site:cnbc.com OR site:finance.yahoo.com "Ivanhoe Mines"` — marktnieuws
- `site:tradingeconomics.com OR site:hl.co.uk OR site:morningstar.com.au "Ivanhoe Mines"` — brede dekking

**Signalen:**
| Signaal | Impact | Actie |
|---|---|---|
| Koperprijs daalt structureel | Negatief | Positie heroverwegen |
| DRC politieke instabiliteit escaleert | Negatief | Risico herbekijken |

### Japanse carry trade (`ct`)

| Eigenschap | Waarde                          |
| ---------- | ------------------------------- |
| Raakt      | Tourmaline + Ivanhoe (indirect) |
| Bronnen    | Google News                     |

**RSS-feeds:**

- `Bank of Japan yen rate hike` — BoJ rentebeslissingen
- `yen carry trade unwind tech stocks` — carry trade unwind
- `Japan yen Nikkei nasdaq sell off` — marktimpact Japan/yen
- `BoJ rate decision market correction impact` — marktcorrectie

**Signalen:**
| Signaal | Impact | Actie |
|---|---|---|
| BoJ verhoogt rente → marktcorrectie | Negatief | Beide bijkopen als fundamentals intact |
| Carry trade-unwind | Negatief | Niet verkopen — eventueel bijkopen |

### TSMC (`ts`)

| Eigenschap | Waarde        |
| ---------- | ------------- |
| Sector     | Halfgeleiders |
| Bronnen    | Google News   |

**RSS-feeds:**

- `TSMC Taiwan Semiconductor AI` — bedrijfsnieuws + AI
- `Taiwan China geopolitics semiconductor` — geopolitiek risico

## Sentimentanalyse

Per categorie zijn er lijsten met positieve en negatieve keywords. Het sentiment wordt bepaald door het aantal positieve vs. negatieve matches in de titel:

- **Meer positief dan negatief** → positief
- **Meer negatief dan positief** → negatief
- **Gelijk of geen matches** → neutraal

## Ontwikkeling

```bash
# Installeer dependencies
npm install

# Start dev server
npm run dev

# Type check + productie build
npm run build

# Preview productie build
npm run preview
```

### Environment variabelen

Maak een `.env` bestand in de root:

```
VITE_GEMINI_KEY=jouw_google_ai_studio_api_key
VITE_RSS2JSON_KEY=jouw_rss2json_api_key
```

- **`VITE_GEMINI_KEY`** is verkrijgbaar via [Google AI Studio](https://aistudio.google.com/apikey). Zonder key werkt de app nog steeds, maar zijn AI-samenvattingen en outlooks uitgeschakeld.
- **`VITE_RSS2JSON_KEY`** is verkrijgbaar via [rss2json.com](https://rss2json.com/me/api_key). Optioneel, maar sterk aanbevolen: zonder key loop je bij meerdere feeds snel tegen een rate limit aan (`You are converting new feeds in a very short period...`).

## Deployen (GitHub Pages)

Deployment gaat automatisch via GitHub Actions bij elke push naar `main`.

1. Ga naar **Settings → Pages** en stel de source in op **GitHub Actions**
2. Ga naar **Settings → Secrets and variables → Actions** en voeg toe:
   - `VITE_GEMINI_KEY` — je Google AI Studio API key
   - `VITE_RSS2JSON_KEY` — je rss2json API key (optioneel, verhoogt rate limit)
3. Push naar `main` — de workflow bouwt de app en deployt naar GitHub Pages

Sub-route navigatie werkt dankzij een `404.html` fallback die in de CI-stap gekopieerd wordt vanuit `index.html`.

## Installeren als app

- **Android**: Open de URL in Chrome → Menu (⋮) → **App installeren**
- **iOS**: Open de URL in Safari → Deel-icoon → **Zet op beginscherm**
