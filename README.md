# Beleggingsnieuws Tracker

PWA voor beleggingsnieuws per categorie met sentimentanalyse.

## Hoe het werkt

Nieuws wordt verzameld via **Google News RSS** (als tussenstap) en directe RSS-feeds. De proxy `feedrapp.info` haalt de RSS-data op en geeft die als JSON terug. Per artikel wordt:

1. **Categorie** bepaald op basis van topic-keywords in de titel
2. **Sentiment** berekend (positief / negatief / neutraal) op basis van sentiment-keywords
3. **Bron** geëxtraheerd uit de Google News-titel (`"Headline - BronNaam"`) zodat de werkelijke publisher getoond wordt

Artikelen kunnen in meerdere categorieën verschijnen als de titel keywords uit meerdere lijsten matcht. Duplicaten worden gefilterd op basis van de eerste 80 karakters van de titel.

## Categorieën & bronnen

### Vandamme

| Eigenschap | Waarde |
|---|---|
| Sector | Financiële analyse (BE) |
| Bronnen | analyse.be, Google News (`"Jeroen Vandamme"`) |

### Tourmaline Oil

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

### Ivanhoe Mines

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

### Japanse carry trade

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

### TSMC

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

## Deployen (GitHub Pages)

1. Push alle bestanden naar de `main` branch
2. Ga naar **Settings** → **Pages**
3. Bij **Source**: kies **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`
5. Klik **Save**

## Installeren als app

- **Android**: Open de URL in Chrome → Menu (⋮) → **App installeren**
- **iOS**: Open de URL in Safari → Deel-icoon → **Zet op beginscherm**
