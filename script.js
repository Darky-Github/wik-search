const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

searchInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsDiv.innerHTML = 'Please wait.';

    try {
      const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
      const data = await res.json();

      resultsDiv.innerHTML = '';
      if (data.query.search.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
      }

      data.query.search.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `<h3>${item.title}</h3><p>${item.snippet}...</p>`;
        resultsDiv.appendChild(div);
      });
    } catch (err) {
      resultsDiv.innerHTML = '<p>Error fetching results.</p>';
      console.error(err);
    }
  }
});
