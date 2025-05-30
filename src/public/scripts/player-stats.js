d3.csv("../../data/games.csv").then(data => {
  const input = document.getElementById("player-search");
  const button = document.getElementById("search-button");
  const results = document.getElementById("player-results");

  function formatNumber(n) {
    return d3.format(",")(n);
  }

  function updateStats(playerId) {
    const games = data.filter(d => d.white_id === playerId || d.black_id === playerId);

    if (games.length === 0) {
      results.innerHTML = `
        <div class="col-span-3 text-center text-red-600 font-semibold text-xl">
          ❌ No games found for <b>${playerId}</b>
        </div>
      `;
      return;
    }

    // Stats principales
    const totalGames = games.length;
    const wins = games.filter(d =>
      (d.white_id === playerId && d.winner === "white") ||
      (d.black_id === playerId && d.winner === "black")
    ).length;
    const losses = games.filter(d =>
      (d.white_id === playerId && d.winner === "black") ||
      (d.black_id === playerId && d.winner === "white")
    ).length;
    const draws = totalGames - wins - losses;
    const winRate = (wins / totalGames * 100).toFixed(1);
    const avgTurns = d3.mean(games, d => +d.turns).toFixed(0);

    const ratings = games.map(d =>
      d.white_id === playerId ? +d.white_rating :
      d.black_id === playerId ? +d.black_rating : null
    ).filter(Boolean);
    const avgElo = d3.mean(ratings).toFixed(0);

    const openingFreq = d3.rollup(
      games,
      v => v.length,
      d => d.opening_name || "Unknown"
    );
    const topOpening = [...openingFreq.entries()].sort((a, b) => b[1] - a[1])[0][0];

    const victoryFreq = d3.rollup(
      games,
      v => v.length,
      d => d.victory_status
    );
    const victories = [...victoryFreq.entries()].sort((a, b) => b[1] - a[1]);

    // Contenu HTML + SVG donut + barres D3.js
    results.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
        <div class="bg-yellow-100 p-6 rounded-xl shadow text-center">
          <svg id="donut-chart" width="120" height="120" class="mx-auto"></svg>
          <p class="text-sm uppercase tracking-wide text-yellow-700 mt-2">Win Rate</p>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow text-center">
          <h3 class="text-4xl font-bold text-blue-800 mb-2">${formatNumber(totalGames)}</h3>
          <p class="text-sm uppercase tracking-wide text-blue-700">Total Games</p>
        </div>
        <div class="bg-green-100 p-6 rounded-xl shadow text-center">
          <h3 class="text-4xl font-bold text-green-800 mb-2">${wins}</h3>
          <p class="text-sm uppercase tracking-wide text-green-700">Wins</p>
        </div>

        <div class="bg-red-100 p-6 rounded-xl shadow text-center">
          <h3 class="text-4xl font-bold text-red-800 mb-2">${losses}</h3>
          <p class="text-sm uppercase tracking-wide text-red-700">Losses</p>
        </div>
        <div class="bg-indigo-100 p-6 rounded-xl shadow text-center">
          <h3 class="text-4xl font-bold text-indigo-800 mb-2">${draws}</h3>
          <p class="text-sm uppercase tracking-wide text-indigo-700">Draws</p>
        </div>
        <div class="bg-purple-100 p-6 rounded-xl shadow text-center">
          <h3 class="text-4xl font-bold text-purple-800 mb-2">${avgTurns}</h3>
          <p class="text-sm uppercase tracking-wide text-purple-700">Avg. Turns</p>
        </div>

        <div class="bg-white col-span-2 p-6 rounded-xl shadow text-center">
          <h3 class="text-xl font-bold text-gray-800 mb-1">♟ ${topOpening}</h3>
          <p class="text-sm text-gray-500">Most Played Opening</p>
        </div>
        <div class="bg-gray-100 p-6 rounded-xl shadow text-center">
          <h3 class="text-4xl font-bold text-gray-800 mb-2">${avgElo}</h3>
          <p class="text-sm uppercase tracking-wide text-gray-700">Average Elo</p>
        </div>

        <div class="bg-pink-100 col-span-3 p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-pink-800 mb-4">Victory Methods</h3>
          <div id="victory-bars" class="space-y-2"></div>
        </div>
      </div>
    `;

    // Donut chart avec D3
    const svg = d3.select("#donut-chart");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
    const radius = Math.min(width, height) / 2;
    const g = svg.append("g").attr("transform", `translate(${width/2},${height/2})`);
    const arc = d3.arc().innerRadius(radius - 20).outerRadius(radius);
    const pie = d3.pie().value(d => d)([+winRate, 100 - winRate]);

    g.selectAll("path")
      .data(pie)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => i === 0 ? "#16a34a" : "#e5e7eb");

    g.append("text")
      .text(`${winRate}%`)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", "18px")
      .attr("font-weight", "bold");

    // Barres pour Victory Methods
    const maxVal = d3.max(victories, d => d[1]);
    const container = d3.select("#victory-bars");
    container.selectAll(".bar-group")
      .data(victories)
      .enter()
      .append("div")
      .attr("class", "bar-group")
      .style("display", "flex")
      .style("align-items", "center")
      .style("gap", "12px")
      .html(d => `
        <span class="text-sm font-medium w-24">${d[0]}: ${d[1]}</span>
        <div class="bg-pink-400 h-3 rounded" style="width:${(d[1]/maxVal)*100}%"></div>
      `);
  }

  button.addEventListener("click", () => {
    const id = input.value.trim();
    if (id) updateStats(id);
  });

  input.addEventListener("keypress", e => {
    if (e.key === "Enter") {
      const id = input.value.trim();
      if (id) updateStats(id);
    }
  });

  // Chargement automatique d’un exemple
  updateStats("daniel_likes_chess");
});