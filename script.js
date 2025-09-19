const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

const experimentalToggle = document.getElementById('experimental-toggle');
const hfInput = document.getElementById('hf-api');

const searchInput = document.getElementById('search-input');
const resultsDiv = document.getElementById('results');

let query = '';
let sroffset = 0;
let loading = false;

async function fetchAISummary(title, hfKey) {
  if (!hfKey) return '';

  try {
    const res = await fetch('https://api-inference.huggingface.co/models/your-model', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: `Summarize this article: ${title}` })
    });
    const data = await res.json();
    return data[0]?.generated_text || '';
  } catch {
    return '';
  }
}

async function loadResults(reset = false) {
  if (loading) return;
  loading = true;

  if (reset) {
    resultsDiv.innerHTML = '';
    sroffset = 0;
  }

  resultsDiv.insertAdjacentHTML('beforeend', '<p id="loading">Loading...</p>');

  try {
    let project = experimentalToggle.checked ? 'all' : 'wikipedia';
    let url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*&sroffset=${sroffset}`;
    
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById('loading').remove();

    if (data.query.search.length === 0 && sroffset === 0) {
      resultsDiv.innerHTML = '<p>No results found.</p>';
      return;
    }

    for (let item of data.query.search) {
      const div = document.createElement('div');
      div.className = 'result-item';
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`;

      let summary = '';
      if (hfInput.value.trim()) {
        summary = await fetchAISummary(item.title, hfInput.value.trim());
      }

      div.innerHTML = `<h3><a href="${url}" target="_blank">${item.title}</a></h3>
                       <p>${item.snippet}...</p>
                       ${summary ? `<p><strong>AI Summary:</strong> ${summary}</p>` : ''}`;
      resultsDiv.appendChild(div);
      setTimeout(() => div.classList.add('fade-in'), 50);
    }

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
