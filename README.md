# Beleggingsnieuws Tracker

PWA voor beleggingsnieuws per categorie met sentimentanalyse en AI-samenvattingen.

## Tech stack

| Technologie | Rol |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Google Gemini 2.5 Flash | AI-samenvattingen per categorie |
| CSS Custom Properties | Material Design 3 theming (light/dark) |
| Service Worker | PWA offline support |

## Projectstructuur

```
src/
├── components/
│   ├── atoms/          # SkeletonPulse, SentimentBar, CompactArticleCard, ErrorDisplay, ThemeToggleButton
│   ├── molecules/      # ArticleSlider, FeaturedSection, DaySummary
│   ├── organisms/      # AppHeader, CategorySection, CategoryFeed, SkeletonFeed
│   └── pages/          # FeedPage
├── config/             # feedSources, topicKeywords, sentimentKeywords
├── contexts/           # NewsFeedContext, GeminiSummaryContext, ThemeContext
├── hooks/              # articleAnalysis, initialization, serviceWorker
├── services/           # newsFeed.service, geminiSummary.service
├── types/              # Interfaces (NewsArticle, NewsCategory, …) + error types
└── utils/              # categoryLookup, featuredArticles, sentiment, sourceExtraction, textCleaning, timeFormatting, topicDetection
```

**Ontwerpprincipes:**
- **Atomic Design** — componenten opgesplitst in atoms, molecules, organisms, pages
- **Composition + Context** — geen prop drilling; state via `NewsFeedContext`, `GeminiSummaryContext`, `ThemeContext`
- **Services** — API-communicatie en data-fetching gescheiden van UI
- **Utils** — pure functies voor herbruikbare logica (lookup, sentiment, formatting); geen `.find`/`.filter` in componenten
- **Typed errors** — discriminated union (`AppError`) met factory functions en `ErrorDisplay` component
- **CSS logical properties** — voor taalrichting-onafhankelijke layouts
- **Unified layout** — zelfde layout op alle schermgroottes: gestapelde categoriesecties met horizontale article sliders

## Layout

De app toont een unified layout op zowel mobiel als desktop:

1. **Featured sectie** — bovenaan, 3 grotere cards met het meest impactvolle artikel (sterkst sentiment) per categorie: Tourmaline, Carry Trade, Ivanhoe
2. **Categoriesecties** — gestapeld per categorie, elk met:
   - Header met categorie-icon, label, artikelcount en sentiment bar
   - AI-samenvatting (DaySummary)
   - Horizontaal scrollbare article slider (compact cards, scroll-snap)
3. **Responsive card breedte** — op mobiel 3 cards + peek van 4e zichtbaar, op desktop 6-7 zichtbaar

## Hoe het werkt

Nieuws wordt verzameld via **Google News RSS** (als tussenstap) en directe RSS-feeds. De proxy `feedrapp.info` haalt de RSS-data op en geeft die als JSON terug. Per artikel wordt:

1. **Categorie** bepaald op basis van topic-keywords in de titel
2. **Sentiment** berekend (positief / negatief / neutraal) op basis van sentiment-keywords
3. **Bron** geëxtraheerd uit de Google News-titel (`"Headline - BronNaam"`) zodat de werkelijke publisher getoond wordt

Artikelen kunnen in meerdere categorieën verschijnen als de titel keywords uit meerdere lijsten matcht. Duplicaten worden gefilterd op basis van de eerste 80 karakters van de titel.

## Categorieën & bronnen

### Vandamme (`vd`)

| Eigenschap | Waarde |
|---|---|
| Sector | Financiële analyse (BE) |
| Bronnen | analyse.be, Google News (`"Jeroen Vandamme"`) |

### Tourmaline Oil (`to`)

| Eigenschap | Waarde |
|---|---|
| Sector | Energie (aardgas) |
| AI-link | Indirect (stroom voor datacenters) |
| Prijsdriver | Gasprijs / LNG-markt |
| Geopolitiek risico | Middel (Canada/LNG) |
| Karakter | Defensiever, inkomen (sterke cashflow, speciale dividenden) |
| Bronnen | naturalgasintel.com, Google News |

**RSS-feeds:**
- `Tourmaline Oil TOU` — bedrijfsnieuws
- `naturalgasintel.com/feed/` — direct RSS (natural gas intelligence)
- `LNG Canada AECO natural gas` — LNG-markt en AECO-gasprijs
- `AECO gas price forecast Canada` — AECO-prijssignalen
- `"LNG Canada" "phase 2" OR "expansion"` — LNG Canada fase 2
- `natural gas data center power demand` — AI-gerelateerde gasvraag

**Signalen:**
| Signaal | Impact | Actie |
|---|---|---|
| AECO-gasprijs herstelt | Positief | Herwaardering verwachten |
| LNG Canada fase 2 bevestigd | Positief | Positie eventueel vergroten |

### Ivanhoe Mines (`iv`)

| Eigenschap | Waarde |
|---|---|
| Sector | Mijnbouw (koper) |
| AI-link | Direct (koper als materiaal) |
| Prijsdriver | Koperprijs |
| Geopolitiek risico | Hoog (DRC) |
| Karakter | Groeier, hogere volatiliteit (groeiende cashflow, investeringsfase) |
| Bronnen | ivanhoemines.com, investing.com, morningstar.com, Google News |

**RSS-feeds:**
- `site:ivanhoemines.com` — direct van Ivanhoe Mines
- `"Ivanhoe Mines" OR "Kamoa-Kakula" copper` — bedrijfsnieuws
- `site:investing.com "Ivanhoe Mines" OR IVN.TO` — investing.com
- `site:morningstar.com "Ivanhoe Mines" OR "IVN" copper` — morningstar.com
- `copper price forecast outlook demand` — koperprijssignalen
- `DRC Congo mining political instability` — DRC geopolitiek

**Signalen:**
| Signaal | Impact | Actie |
|---|---|---|
| Koperprijs daalt structureel | Negatief | Positie heroverwegen |
| DRC politieke instabiliteit escaleert | Negatief | Risico herbekijken |

### Japanse carry trade (`ct`)

| Eigenschap | Waarde |
|---|---|
| Raakt | Tourmaline + Ivanhoe (indirect) |
| Bronnen | Google News |

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

| Eigenschap | Waarde |
|---|---|
| Sector | Halfgeleiders |
| Bronnen | Google News |

**RSS-feeds:**
- `TSMC Taiwan Semiconductor AI` — bedrijfsnieuws + AI
- `Taiwan China geopolitics semiconductor` — geopolitiek risico

## Sentimentanalyse

Per categorie zijn er lijsten met positieve en negatieve keywords. Het sentiment wordt bepaald door het aantal positieve vs. negatieve matches in de titel:
- **Meer positief dan negatief** → ↑ Positief
- **Meer negatief dan positief** → ↓ Negatief
- **Gelijk of geen matches** → → Neutraal

## AI-samenvattingen (Gemini)

Per categorie kan een AI-samenvatting gegenereerd worden via de **Google Gemini 2.5 Flash** API (gratis tier). Beperkingen:

| Limiet | Waarde |
|---|---|
| Requests per minuut | 5 |
| Tokens per minuut | 250.000 |
| Requests per dag | 20 (self-imposed) |

Samenvattingen worden gecacht in `localStorage` per dag. Dagelijks gebruik wordt bijgehouden om de rate limit te respecteren.

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

Maak een `.env` bestand in de root (zie `.env.example`):

```
VITE_GEMINI_KEY=jouw_google_ai_studio_api_key
```

De API key is verkrijgbaar via [Google AI Studio](https://aistudio.google.com/apikey).

## Deployen (Netlify)

1. Koppel de GitHub repository aan Netlify
2. Build settings worden automatisch gedetecteerd:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Stel `VITE_GEMINI_KEY` in als environment variable in Netlify (Site settings → Environment variables)

## Installeren als app

- **Android**: Open de URL in Chrome → Menu (⋮) → **App installeren**
- **iOS**: Open de URL in Safari → Deel-icoon → **Zet op beginscherm**
