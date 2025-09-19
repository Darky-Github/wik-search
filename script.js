const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

let query = '';
let sroffset = 0;
let loading = false;

async function loadResults(reset = false) {
  if (loading) return;
  loading = true;

  if (reset) {
    resultsDiv.innerHTML = '';
    sroffset = 0;
  }

  resultsDiv.insertAdjacentHTML('beforeend', '<p id="loading">Loading...</p>');

  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*&sroffset=${sroffset}`);
    const data = await res.json();

    document.getElementById('loading').remove();

    if (data.query.search.length === 0 && sroffset === 0) {
      resultsDiv.innerHTML = '<p>No results found.</p>';
      return;
    }

    data.query.search.forEach(item => {
      const div = document.createElement('div');
      div.className = 'result-item';
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`;
      div.innerHTML = `<h3><a href="${url}" target="_blank">${item.title}</a></h3><p>${item.snippet}...</p>`;
      resultsDiv.appendChild(div);
    });

    sroffset += data.query.search.length;
  } catch (err) {
    resultsDiv.insertAdjacentHTML('beforeend', '<p>Error fetching results.</p>');
    console.error(err);
  }

  loading = false;
}

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    query = searchInput.value.trim();
    if (!query) return;
    loadResults(true);
  }
});

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    if (query) loadResults();
  }
});
