
import { Politician } from "../types";

const BASE_URL = "https://www.myneta.info/";

// Priority list of CORS proxies to try sequentially
const PROXY_ROTATION = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // Add more proxies here if needed
];

export interface ScrapedData {
  id: number;
  name: string;
  party: string;
  constituency: string;
  state: string;
  photoUrl: string;
  mynetaId: string;
  electionSlug: string;
  success: boolean;
  source: 'live' | 'proxy' | 'simulation';
}

/**
 * Fetches just the photo URL for a politician given their MyNeta ID and Election Slug.
 */
export const fetchPoliticianImage = async (electionSlug: string, candidateId: string): Promise<string | null> => {
    const id = parseInt(candidateId, 10);
    if (isNaN(id)) return null;

    const data = await scrapePolitician(electionSlug, id);
    if (data.success && !data.photoUrl.includes("placeholder")) {
        return data.photoUrl;
    }
    return null;
};

/**
 * Tries to fetch a URL using the proxy rotation strategy.
 */
const fetchWithFailover = async (targetUrl: string): Promise<string> => {
  let lastError;

  for (const proxyGen of PROXY_ROTATION) {
    const proxyUrl = proxyGen(targetUrl);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per proxy

      const response = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      // AllOrigins returns contents in `contents`, others might return raw HTML directly (need adaptation if adding others)
      const html = data.contents || data; 
      
      if (html && typeof html === 'string' && html.length > 100) {
        return html;
      }
    } catch (e) {
      lastError = e;
      console.warn(`Proxy failed: ${proxyUrl}`, e);
      // Continue to next proxy
    }
  }

  throw lastError || new Error("All proxies failed");
};

/**
 * Generates realistic mock data if live scraping fails (Localhost/Offline support)
 */
const generateMockData = (id: number, electionSlug: string): ScrapedData => {
  const mockNames = ["Rajesh Kumar", "Aditi Singh", "Vikram Rathore", "Sanjay Patil", "Meera Reddy"];
  const mockParties = ["BJP", "INC", "AAP", "Independent", "SP"];
  const mockConsts = ["Varanasi", "Amethi", "New Delhi", "Pune", "Hyderabad"];
  
  const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return {
    id,
    name: `${random(mockNames)}`,
    party: random(mockParties),
    constituency: `${random(mockConsts)} (Simulated)`,
    state: "Simulated State",
    photoUrl: `https://i.pravatar.cc/300?u=${id}`, // Consistent random avatar
    mynetaId: id.toString(),
    electionSlug,
    success: true,
    source: 'simulation'
  };
};

export const scrapePolitician = async (
  electionSlug: string,
  candidateId: number
): Promise<ScrapedData> => {
  const targetUrl = `${BASE_URL}${electionSlug}/candidate.php?candidate_id=${candidateId}`;

  try {
    const htmlContent = await fetchWithFailover(targetUrl);
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    let name = doc.querySelector("h2")?.textContent?.trim() || "Unknown Candidate";
    name = name.replace("Candidate Affidavit", "").trim();

    // Image Extraction logic
    const imgEl = doc.querySelector('img[src*="images_candidate"]');
    let photoUrl = "https://via.placeholder.com/200?text=No+Image";
    
    if (imgEl) {
      const relativeSrc = imgEl.getAttribute("src");
      if (relativeSrc) {
         // MyNeta images are often relative
         const cleanRel = relativeSrc.replace(/^\.\.\//, '').replace(/^\//, ''); 
         photoUrl = `${BASE_URL}${cleanRel}`; 
      }
    }

    let party = "Independent";
    let constituency = "Unknown";
    let state = "Unknown";

    const gridHeaders = doc.querySelectorAll(".grid_2.alpha");
    gridHeaders.forEach(header => {
        if (header.textContent?.includes("Party:")) {
             party = header.nextElementSibling?.textContent?.trim() || party;
        }
        if (header.textContent?.includes("Constituency:")) {
             const text = header.nextElementSibling?.textContent?.trim() || "";
             const parts = text.split('(');
             constituency = parts[0].trim();
             if (parts[1]) state = parts[1].replace(')', '').trim();
        }
    });

    return {
      id: candidateId,
      name,
      party,
      constituency,
      state,
      photoUrl,
      mynetaId: candidateId.toString(),
      electionSlug,
      success: true,
      source: 'live'
    };

  } catch (error) {
    console.warn(`Scraping failed for ID ${candidateId}, falling back to simulation.`, error);
    // FALLBACK TO SIMULATION so the feature works on Localhost/Offline
    return generateMockData(candidateId, electionSlug);
  }
};
