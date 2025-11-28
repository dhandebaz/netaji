
import { NewsItem, RSSSource } from "../types";

// Default sources with some popular Indian news feeds
const DEFAULT_SOURCES: RSSSource[] = [
    { id: '1', name: 'The Hindu', url: 'https://www.thehindu.com/news/national/feeder/default.rss', enabled: true },
    { id: '2', name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', enabled: true },
    { id: '3', name: 'NDTV Top Stories', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', enabled: true },
    { id: '4', name: 'India Today', url: 'https://www.indiatoday.in/rss/1206584', enabled: true },
];

export const getRSSSources = (): RSSSource[] => {
    try {
        const stored = localStorage.getItem('neta_rss_sources');
        return stored ? JSON.parse(stored) : DEFAULT_SOURCES;
    } catch (error) {
        console.error("Error reading RSS sources", error);
        return DEFAULT_SOURCES;
    }
};

export const saveRSSSources = (sources: RSSSource[]) => {
    localStorage.setItem('neta_rss_sources', JSON.stringify(sources));
};

export const addRSSSource = (name: string, url: string): RSSSource[] => {
    const sources = getRSSSources();
    const newSource: RSSSource = {
        id: Date.now().toString(),
        name,
        url,
        enabled: true
    };
    const updated = [...sources, newSource];
    saveRSSSources(updated);
    return updated;
};

export const removeRSSSource = (id: string): RSSSource[] => {
    const sources = getRSSSources();
    const updated = sources.filter(s => s.id !== id);
    saveRSSSources(updated);
    return updated;
};

export const toggleRSSSource = (id: string): RSSSource[] => {
    const sources = getRSSSources();
    const updated = sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    saveRSSSources(updated);
    return updated;
};

export const fetchNewsForPolitician = async (politicianName: string): Promise<NewsItem[]> => {
    const sources = getRSSSources().filter(s => s.enabled);
    
    if (sources.length === 0) {
        return [];
    }

    // Using rss2json API to convert RSS XML to JSON for client-side consumption
    // Note: The free tier has rate limits.
    const RSS_TO_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

    const fetchPromises = sources.map(async (source) => {
        try {
            const response = await fetch(`${RSS_TO_JSON_API}${encodeURIComponent(source.url)}`);
            const data = await response.json();
            
            if (data.status === 'ok' && Array.isArray(data.items)) {
                return data.items.map((item: any) => {
                    // Try to parse date, handle various RSS date formats
                    // rss2json usually returns "YYYY-MM-DD HH:mm:ss"
                    let dateObj = new Date(item.pubDate.replace(/-/g, '/')); // Handle some browser incompatibilities
                    if (isNaN(dateObj.getTime())) {
                         dateObj = new Date(item.pubDate);
                    }
                    const rawDate = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime();
                    
                    const formattedDate = isNaN(dateObj.getTime()) 
                        ? 'Recent' 
                        : dateObj.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

                    return {
                        id: Date.now() + Math.random(),
                        headline: item.title,
                        source: source.name,
                        date: formattedDate,
                        rawDate: rawDate, // Internal use for sorting
                        snippet: item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 180) + '...' : '',
                        url: item.link
                    };
                });
            }
            return [];
        } catch (error) {
            console.warn(`Failed to fetch RSS from ${source.name}`, error);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    
    // Flatten array
    const allNews = results.flat();

    // Sort by date descending (newest first) using the rawDate property we added temporarily
    // We cast to any because rawDate isn't in the strict NewsItem type, but it exists at runtime
    allNews.sort((a: any, b: any) => (b.rawDate || 0) - (a.rawDate || 0));

    // Filter logic:
    // We want news that mentions the politician's name.
    // We use a case-insensitive check.
    const nameParts = politicianName.toLowerCase().split(' ').filter(p => p.length > 2);
    
    const relevantNews = allNews.filter(item => {
        const content = (item.headline + ' ' + item.snippet).toLowerCase();
        
        // Exact full name match (preferred)
        if (content.includes(politicianName.toLowerCase())) return true;

        // Check for parts (e.g. "Modi" in "PM Modi visits...")
        // We require at least one significant part of the name to be present.
        return nameParts.some(part => content.includes(part));
    });

    // Return filtered news. If empty, return generic latest news (limited) to keep UI populated
    if (relevantNews.length > 0) {
        return relevantNews;
    } else {
        return allNews.slice(0, 5); // Fallback to latest news
    }
};
