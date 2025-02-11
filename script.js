// Toggle academic scores
function toggleScores(btn) {
    const scoresDiv = btn.nextElementSibling;
    scoresDiv.classList.toggle('show');
    btn.innerHTML = scoresDiv.classList.contains('show') ? 'Academic Scores ▲' : 'Academic Scores ▼';
}

// Toggle semester details
function toggleSemester(element) {
    const details = element.nextElementSibling;
    element.classList.toggle('active');
    details.style.maxHeight = details.style.maxHeight ? null : `${details.scrollHeight}px`;
}

function toggleClubDetails(header) {
    const details = header.nextElementSibling;
    header.classList.toggle('active');
    details.style.maxHeight = details.style.maxHeight ? null : `${details.scrollHeight}px`;
}

let statsLoaded = false;

async function toggleChessStats() {
  const container = document.getElementById('chess-stats-container');
  const button = document.querySelector('.toggle-stats');
  const loadingSpinner = document.querySelector('.loading-spinner');
  
  if (container.classList.contains('hidden')) {
      // Show spinner before fetching data
      loadingSpinner.style.opacity = '1';
      
      try {
          if (!statsLoaded) {
              await loadChessStats();
              statsLoaded = true;
          }
          container.classList.remove('hidden');
          button.textContent = 'Hide Stats';
          
          // Hide spinner after data loads
          loadingSpinner.style.opacity = '0';
      } catch (error) {
          console.error('Error:', error);
          loadingSpinner.style.opacity = '0';
      }
  } else {
      container.classList.add('hidden');
      button.textContent = 'Show Stats';
  }
}



// Chess stats
async function loadChessStats() {
  const loadingSpinner = document.querySelector('.loading-spinner');
    
  try {
    const proxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(proxy + encodeURIComponent('https://api.chess.com/pub/player/RogFury/stats'));
    
    if (!response.ok) throw new Error('Failed to fetch stats');
    const data = await response.json();

    document.getElementById('chess-stats').innerHTML = `
      <div class="stats-grid">
        ${['rapid', 'blitz'].map(mode => {
          const record = data[`chess_${mode}`]?.record;
          const totalGames = record ? record.win + record.loss + record.draw : 0;
          return createStatCard(mode.charAt(0).toUpperCase() + mode.slice(1), [
            ['Current Rating', data[`chess_${mode}`]?.last?.rating || 'N/A'],
            ['Win %', record ? `${((record.win / totalGames) * 100).toFixed(1)}%` : 'N/A'],
            ['Loss %', record ? `${((record.loss / totalGames) * 100).toFixed(1)}%` : 'N/A'],
            ['Total Games', totalGames || 'N/A']
          ]);
        }).join('')}
        ${createStatCard('Puzzles', [
            ['Highest Rating', data.tactics?.highest?.rating || 'N/A'],
            ['Current Rating', data.tactics?.last?.rating || 'N/A']
          ])}
      </div>
    `;
  } catch (error) {
    document.getElementById('chess-stats').innerHTML = `
      <div class="error-message">
        ${error.message}<br>
        <button onclick="loadChessStats()" class="retry-btn">
          Retry
        </button>
      </div>
    `;
  } finally {
    loadingSpinner.style.display = 'none'; // Always hide the spinner
  }
}

  // Keep the existing createStatCard function
  function createStatCard(title, items) {
    return `
      <div class="stat-card">
        <h3>${title}</h3>
        ${items.map(([label, value]) => `
          <div class="stat-item">
            <span class="stat-label">${label}</span>
            <span class="stat-value">${value}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

// Dynamic Background
document.addEventListener('DOMContentLoaded', () => {
  let x = 0;
  let y = 0;
  const radius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) * 0.5;
  let angle = 0;
  
  function updateGradient() {
      const progress = (angle / 360) % 1;
      const x = window.innerWidth * 0.5 + radius * Math.cos(angle * Math.PI / 180);
      const y = window.innerHeight * 0.5 + radius * Math.sin(angle * Math.PI / 180);
      
      document.body.style.background = `
          radial-gradient(
              circle at ${x}px ${y}px,
              #1d2a3d 0%, 
              #020303 100%
          )
      `;
      
      angle += 0.5;
      requestAnimationFrame(updateGradient);
  }

  // Start the animation
  updateGradient();

  // Handle window resize
  window.addEventListener('resize', () => {
      radius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) * 0.5;
  });
});
