// js/api.js
const API_CONFIG = {
  // Points to your local Wrangler dev server
  BASE_URL: "https://portfolio-api.sandipansamanta2004.workers.dev/api",
};

async function fetchAPI(endpoint) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(
      `[API] Fetch failed for ${endpoint}. Is Wrangler running?`,
      error,
    );
    return null;
  }
}
