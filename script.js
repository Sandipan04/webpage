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