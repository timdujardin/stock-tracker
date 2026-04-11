import type { NewsCategory } from '@/types';

/** RSS proxy URL used to bypass CORS for feed fetching */
export const RSS_PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';

/** Ordered list of all tracked category identifiers */
export const CATEGORY_IDS: string[] = ['vd', 'to', 'iv', 'ct', 'ts'];

/** Category definitions with labels, icons, themes, and RSS feed URLs */
export const FEED_SOURCES: NewsCategory[] = [
  {
    categoryId: 'vd',
    label: 'Vandamme',
    icon: '🐦',
    themeClass: 'tvd',
    rssFeeds: [
      'https://news.google.com/rss/search?q=%22Jeroen+Vandamme%22+financieel&hl=nl&gl=BE&ceid=BE:nl',
      'https://news.google.com/rss/search?q=site:analyse.be&hl=nl&gl=BE&ceid=BE:nl',
    ],
  },
  {
    categoryId: 'to',
    label: 'Tourmaline Oil',
    icon: '🛢️',
    themeClass: 'tto',
    rssFeeds: [
      'https://news.google.com/rss/search?q=Tourmaline+Oil+TOU&hl=en&gl=CA&ceid=CA:en',
      'https://naturalgasintel.com/feed/',
      'https://news.google.com/rss/search?q=LNG+Canada+AECO+natural+gas&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=AECO+gas+price+forecast+Canada&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=%22LNG+Canada%22+%22phase+2%22+OR+%22expansion%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=natural+gas+data+center+power+demand&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:theglobeandmail.com+OR+site:marketscreener.com+%22Tourmaline+Oil%22+OR+%22TOU%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:morningstar.com+%22Tourmaline+Oil%22+OR+%22TOU%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:tourmalineoil.com&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:tradingeconomics.com+%22Tourmaline+Oil%22+OR+%22TOU:CN%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:gurufocus.com+OR+site:finimize.com+%22Tourmaline+Oil%22+OR+%22TRMLF%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:marketwatch.com+OR+site:marketbeat.com+%22Tourmaline+Oil%22+OR+%22TOU%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:kalkinemedia.com+OR+site:finance.yahoo.com+%22Tourmaline+Oil%22+OR+%22TOU%22+OR+%22TRMLF%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:tracxn.com+%22Tourmaline+Oil%22&hl=en&gl=CA&ceid=CA:en',
    ],
  },
  {
    categoryId: 'iv',
    label: 'Ivanhoe',
    icon: '⛏️',
    themeClass: 'tiv',
    rssFeeds: [
      'https://news.google.com/rss/search?q=site:ivanhoemines.com&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=%22Ivanhoe+Mines%22+OR+%22Kamoa-Kakula%22+copper&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:investing.com+%22Ivanhoe+Mines%22+OR+IVN.TO&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:morningstar.com+%22Ivanhoe+Mines%22+OR+%22IVN%22+copper&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=copper+price+forecast+outlook+demand&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=DRC+Congo+mining+political+instability&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:theglobeandmail.com+OR+site:reuters.com+%22Ivanhoe+Mines%22+OR+%22IVN%22&hl=en&gl=CA&ceid=CA:en',
      'https://news.google.com/rss/search?q=site:cnbc.com+OR+site:finance.yahoo.com+%22Ivanhoe+Mines%22+OR+%22IVN%22&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:tradingeconomics.com+OR+site:hl.co.uk+OR+site:morningstar.com.au+%22Ivanhoe+Mines%22+OR+%22IVN%22&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:marketbeat.com+OR+site:kalkinemedia.com+%22Ivanhoe+Mines%22+OR+%22IVN%22&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:simplywall.st+OR+site:seekingalpha.com+%22Ivanhoe+Mines%22+OR+%22IVN%22&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=site:tipranks.com+OR+site:bitget.com+%22Ivanhoe+Mines%22+OR+%22IVN%22&hl=en&gl=US&ceid=US:en',
    ],
  },
  {
    categoryId: 'ct',
    label: 'Japanse carry trade',
    icon: '🏦',
    themeClass: 'tct',
    rssFeeds: [
      'https://news.google.com/rss/search?q=Bank+of+Japan+yen+rate+hike&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=yen+carry+trade+unwind+tech+stocks&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Japan+yen+Nikkei+nasdaq+sell+off&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=BoJ+rate+decision+market+correction+impact&hl=en&gl=US&ceid=US:en',
    ],
  },
  {
    categoryId: 'ts',
    label: 'TSMC',
    icon: '💾',
    themeClass: 'tts',
    rssFeeds: [
      'https://news.google.com/rss/search?q=TSMC+Taiwan+Semiconductor+AI&hl=en&gl=US&ceid=US:en',
      'https://news.google.com/rss/search?q=Taiwan+China+geopolitics+semiconductor&hl=en&gl=US&ceid=US:en',
    ],
  },
];
