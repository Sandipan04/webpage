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

// chessStats.js
document.addEventListener('DOMContentLoaded', () => {
    const MODE_MAP = {
      tactics: { name: 'Puzzles', icon: '🧩' },
      chess: { name: 'Daily', icon: '📅' },
      rapid: { name: 'Rapid', icon: '⏱️' },
      lightning: { name: 'Blitz', icon: '⚡' },
      bullet: { name: 'Bullet', icon: '🔫' },
      tactics_challenge: { name: 'Puzzle Challenge', icon: '🏆' }
    };
  
    async function fetchChessStats() {
      try {
        const response = await fetch(`https://www.chess.com/callback/member/stats/RogFury`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
      } catch (error) {
        console.error('Error fetching chess stats:', error);
        return null;
      }
    }
  
    function createStatItem(label, value) {
      const div = document.createElement('div');
      div.className = 'stat-item';
      div.innerHTML = `
        <span class="stat-label">${label}</span>
        <span class="stat-value">${value}</span>
      `;
      return div;
    }
  
    function renderChessStats(data) {
      const container = document.getElementById('chess-stats');
      if (!data || !data.stats) {
        container.innerHTML = '<p>Chess statistics currently unavailable</p>';
        return;
      }
  
      container.innerHTML = '';
      Object.entries(MODE_MAP).forEach(([key, mode]) => {
        const stats = data.stats[key];
        if (!stats) return;
  
        const card = document.createElement('div');
        card.className = 'chess-mode-card';
        
        card.innerHTML = `
          <div class="chess-mode-title">
            ${mode.icon} ${mode.name}
          </div>
        `;
  
        if (stats.highest) {
          card.appendChild(createStatItem('Peak Rating', stats.highest.rating));
        }
        
        card.appendChild(createStatItem('Current Rating', stats.last?.rating || 'N/A'));
        
        if (stats.record) {
          const totalGames = stats.record.win + stats.record.loss + stats.record.draw;
          card.appendChild(createStatItem('Total Games', totalGames));
          card.appendChild(createStatItem('Win Rate', 
            `${Math.round((stats.record.win / totalGames) * 100)}%`));
        }
  
        container.appendChild(card);
      });
    }
  
    // Initialize
    fetchChessStats().then(renderChessStats);
  });