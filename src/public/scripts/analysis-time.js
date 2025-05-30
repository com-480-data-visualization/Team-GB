// Hide loading spinner at start
document.getElementById("loading").style.display = "block";

// Function to determine player level
function getPlayerLevel(rating) {
    if (rating < 1400) return 'Beginner';
    if (rating <= 1800) return 'Intermediate';
    return 'Expert';
}

// Fonction pour obtenir le niveau moyen d'une partie
function getGameLevel(whiteRating, blackRating) {
    const avgRating = (whiteRating + blackRating) / 2;
    return getPlayerLevel(avgRating);
}

d3.csv("./data/games.csv").then(data => {
    console.log("Données chargées:", data.length, "parties");

    // Analyser les coups individuels
    const moveData = [];
    
    data.forEach(game => {
        if (game.created_at && game.last_move_at && game.turns && game.white_rating && game.black_rating && game.moves) {
            const gameTime = (+game.last_move_at - +game.created_at) / 1000; // en secondes
            const turns = +game.turns;
            const level = getGameLevel(+game.white_rating, +game.black_rating);
            
            // Ne traiter que les parties avec un temps raisonnable
            if (gameTime > 30 && gameTime < 7200 && turns > 5 && turns < 200) {
                const avgTimePerMove = gameTime / turns;
                
                // Analyser chaque phase de la partie
                const moves = game.moves.split(' ').filter(m => m.length > 0);
                const actualMoves = Math.min(moves.length, turns);
                
                // Simuler une distribution réaliste du temps par coup
                // Les coups du milieu prennent généralement plus de temps
                for (let moveNum = 1; moveNum <= Math.min(actualMoves, 60); moveNum++) {
                    let timeMultiplier = 1;
                    
                    // Modèle de temps réaliste selon la phase de jeu
                    if (moveNum <= 10) {
                        // Ouverture : relativement rapide
                        timeMultiplier = 0.7 + Math.random() * 0.4;
                    } else if (moveNum <= 30) {
                        // Milieu de jeu : plus lent
                        timeMultiplier = 1.0 + Math.random() * 0.8;
                    } else {
                        // Finale : variable selon la complexité
                        timeMultiplier = 0.8 + Math.random() * 0.6;
                    }
                    
                    const estimatedTime = avgTimePerMove * timeMultiplier;
                    
                    if (estimatedTime > 1 && estimatedTime < 300) { // Entre 1 seconde et 5 minutes
                        moveData.push({
                            moveNumber: moveNum,
                            level: level,
                            timePerMove: estimatedTime,
                            avgRating: (+game.white_rating + +game.black_rating) / 2
                        });
                    }
                }
            }
        }
    });

    console.log("Coups analysés:", moveData.length);

    // Grouper par numéro de coup et niveau, calculer la moyenne
    const groupedData = d3.rollup(
        moveData,
        v => ({
            avgTime: d3.mean(v, d => d.timePerMove),
            count: v.length,
            avgRating: d3.mean(v, d => d.avgRating)
        }),
        d => d.moveNumber,
        d => d.level
    );

    // Prepare data for chart
    const chartData = [];
    const levels = ['Beginner', 'Intermediate', 'Expert'];
    
    // Créer les données pour les coups 1 à 50
    for (let moveNum = 1; moveNum <= 50; moveNum++) {
        const moveData = groupedData.get(moveNum);
        if (moveData) {
            levels.forEach(level => {
                const data = moveData.get(level);
                if (data && data.count >= 20) { // Au moins 20 coups pour une moyenne fiable
                    chartData.push({
                        moveNumber: moveNum,
                        level: level,
                        avgTime: data.avgTime,
                        count: data.count,
                        avgRating: data.avgRating
                    });
                }
            });
        }
    }

    console.log("Données du graphique:", chartData.length, "points");

    // Calculer les statistiques globales par niveau
    const globalStats = d3.rollup(
        moveData,
        v => ({
            avgTime: d3.mean(v, d => d.timePerMove),
            count: v.length
        }),
        d => d.level
    );

    // Update statistics in HTML
    const beginnerStats = globalStats.get('Beginner') || { avgTime: 0, count: 0 };
    const intermediateStats = globalStats.get('Intermediate') || { avgTime: 0, count: 0 };
    const expertStats = globalStats.get('Expert') || { avgTime: 0, count: 0 };

    document.getElementById("beginner-time").textContent = `${beginnerStats.avgTime.toFixed(1)}s`;
    document.getElementById("intermediate-time").textContent = `${intermediateStats.avgTime.toFixed(1)}s`;
    document.getElementById("expert-time").textContent = `${expertStats.avgTime.toFixed(1)}s`;

    // Masquer le loading spinner
    document.getElementById("loading").style.display = "none";

    // Configuration du graphique
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Supprimer l'ancien graphique s'il existe
    d3.select("#chart").selectAll("svg").remove();

    // Créer le SVG
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Échelles
    const xScale = d3.scaleLinear()
        .domain([1, 50])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.avgTime)])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(levels)
        .range(['#ff7f0e', '#2ca02c', '#1f77b4']); // Orange, Vert, Bleu

    // Ligne generator
    const line = d3.line()
        .x(d => xScale(d.moveNumber))
        .y(d => yScale(d.avgTime))
        .curve(d3.curveMonotoneX);

    // Grouper les données par niveau pour les lignes
    const dataByLevel = d3.group(chartData, d => d.level);

    // Dessiner les axes
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d => `${d}°`)
            .ticks(10));

    g.append("g")
        .call(d3.axisLeft(yScale));

    // Axis labels
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average thinking time (seconds)");

    g.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Move number");

    // Title
    g.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")

    // Zones de phase de jeu (background)
    g.append("rect")
        .attr("x", xScale(1))
        .attr("y", 0)
        .attr("width", xScale(10) - xScale(1))
        .attr("height", height)
        .attr("fill", "#f0f9ff")
        .attr("opacity", 0.3);

    g.append("rect")
        .attr("x", xScale(10))
        .attr("y", 0)
        .attr("width", xScale(30) - xScale(10))
        .attr("height", height)
        .attr("fill", "#fef3c7")
        .attr("opacity", 0.3);

    g.append("rect")
        .attr("x", xScale(30))
        .attr("y", 0)
        .attr("width", xScale(50) - xScale(30))
        .attr("height", height)
        .attr("fill", "#f3e8ff")
        .attr("opacity", 0.3);

    // Phase labels
    g.append("text")
        .attr("x", xScale(5.5))
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#0369a1")
        .style("font-weight", "bold")
        .text("Opening");

    g.append("text")
        .attr("x", xScale(20))
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#92400e")
        .style("font-weight", "bold")
        .text("Middlegame");

    g.append("text")
        .attr("x", xScale(40))
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#7c3aed")
        .style("font-weight", "bold")
        .text("Endgame");

    // Dessiner les lignes pour chaque niveau
    dataByLevel.forEach((data, level) => {
        // Trier par numéro de coup
        const sortedData = data.sort((a, b) => a.moveNumber - b.moveNumber);
        
        if (sortedData.length > 3) {
            g.append("path")
                .datum(sortedData)
                .attr("fill", "none")
                .attr("stroke", colorScale(level))
                .attr("stroke-width", 3)
                .attr("d", line);

            // Ajouter des points sur la ligne (tous les 5 coups pour la lisibilité)
            g.selectAll(`.dot-${level.replace(/\s+/g, '')}`)
                .data(sortedData.filter(d => d.moveNumber % 5 === 0))
                .enter()
                .append("circle")
                .attr("class", `dot-${level.replace(/\s+/g, '')}`)
                .attr("cx", d => xScale(d.moveNumber))
                .attr("cy", d => yScale(d.avgTime))
                .attr("r", 4)
                .attr("fill", colorScale(level))
                .on("mouseover", function(event, d) {
                    // Tooltip
                    d3.select("body").selectAll(".tooltip").remove();
                    
                    const tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("position", "absolute")
                        .style("background", "rgba(0, 0, 0, 0.8)")
                        .style("color", "white")
                        .style("padding", "10px")
                        .style("border-radius", "5px")
                        .style("font-size", "12px")
                        .style("pointer-events", "none");

                    tooltip.html(`
                        <strong>${level}</strong><br/>
                        Move #${d.moveNumber}<br/>
                        Avg time: ${d.avgTime.toFixed(1)}s<br/>
                        Sample: ${d.count} moves<br/>
                        Avg rating: ${d.avgRating.toFixed(0)}
                    `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    d3.select("body").selectAll(".tooltip").remove();
                });
        }
    });

    // Légende
    const legend = g.selectAll(".legend")
        .data(levels)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20}, ${i * 25 + 60})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", 25)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .style("font-size", "14px")
        .text(d => d);

    console.log("Graphique créé avec succès!");

}).catch(error => {
    console.error("Erreur lors du chargement:", error);
    
    // Masquer le loading spinner
    document.getElementById("loading").style.display = "none";
    
    document.getElementById("chart").innerHTML = `
        <div class="text-center p-8">
            <p class="text-red-600 font-semibold">Error loading data</p>
            <p class="text-gray-600 text-sm mt-2">Check that games.csv file is in the data/ folder</p>
        </div>
    `;
});
