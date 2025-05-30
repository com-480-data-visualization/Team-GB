d3.csv("../../data/games.csv").then(data => {
    const checkDiv = document.getElementById('data-check-results');
    if (checkDiv) {
        let checkHTML = '<h3 class="text-lg font-semibold mb-3">Résultats de vérification :</h3>';
        checkHTML += data.length === 0
            ? '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">❌ Aucune donnée trouvée</div>'
            : `<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">✅ ${data.length} parties chargées</div>`;
        checkDiv.innerHTML = checkHTML;
    }

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    function extractSquare(move) {
        const clean = move.replace(/[+#]/g, '');
        if (clean.includes('x')) {
            const match = clean.match(/x([a-h][1-8])/);
            return match ? match[1] : null;
        }
        const match = clean.match(/([a-h][1-8])/g);
        return match ? match[match.length - 1] : null;
    }

    function extractPiece(move) {
        if (move.includes('O-O')) return 'k';
        const m = move.match(/^([KQRBN])/);
        return m ? m[1].toLowerCase() : 'p';
    }

    function isCapture(move) {
        return move.includes('x');
    }

    function isCheck(move) {
        return move.includes('+') || move.includes('#');
    }

    function generateHeatmap(pieceType, color, type) {
        const freq = {};
        files.forEach(f => ranks.forEach(r => freq[f + r] = 0));

        data.forEach(row => {
            const moves = row.moves?.split(" ") || [];

            moves.forEach((move, idx) => {
                if (/^\d+\./.test(move) || /^(1-0|0-1|1\/2-1\/2|\*)$/.test(move)) return;

                const moveColor = idx % 2 === 0 ? 'w' : 'b';
                if (color !== 'all' && moveColor !== color) return;

                // LOGIQUE SPÉCIFIQUE POUR LES OUVERTURES
                if (type === "openings") {
                    // Limiter aux 10 premiers coups (20 demi-coups)
                    if (idx >= 20) return;
                    
                    const piece = extractPiece(move);
                    
                    // Filtrer les pièces pertinentes pour les ouvertures
                    if (pieceType === 'all') {
                        // Pour "toutes les pièces", exclure le roi (sauf roques) et la dame au début
                        if (piece === 'k' && !move.includes('O-O')) return; // Pas de coups de roi sauf roques
                        if (piece === 'q' && idx < 6) return; // Pas de dame trop tôt
                    } else {
                        // Si une pièce spécifique est sélectionnée, la respecter
                        if (piece !== pieceType) return;
                    }
                    
                    // Suggestions supplémentaires pour les ouvertures
                    // Exclure les coups très tardifs de développement
                    if (idx > 14 && (piece === 'n' || piece === 'b')) return;
                }
                // LOGIQUE POUR LES AUTRES TYPES
                else {
                    if (type === "captures" && !isCapture(move)) return;
                    if (type === "checks" && !isCheck(move)) return;
                }

                const piece = extractPiece(move);
                const square = extractSquare(move);
                if (!square || !freq.hasOwnProperty(square)) return;

                // Pour les types autres que "openings", appliquer le filtre de pièce normalement
                if (type !== "openings" && pieceType !== 'all' && piece !== pieceType) return;

                freq[square]++;
            });
        });

        const max = d3.max(Object.values(freq));
        const heatmapData = Object.entries(freq).map(([sq, count]) => ({
            file: sq[0],
            rank: sq[1],
            value: max > 0 ? count / max : 0
        }));

        drawHeatmap(heatmapData);
    }

    function drawHeatmap(data) {
        const container = d3.select("#heatmap-container");
        container.selectAll("*").remove();

        const width = container.node().clientWidth;
        const size = width / 8;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", width);

        const scale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 1]);

        data.forEach(d => {
            const x = files.indexOf(d.file) * size;
            const y = (8 - +d.rank) * size;
            svg.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", size)
                .attr("height", size)
                .attr("fill", scale(d.value))
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5);
        });
    }

    // Sélecteurs
    const pieceSelector = document.getElementById("piece-filter");
    const colorSelector = document.getElementById("color-filter");
    const typeSelector = document.getElementById("heatmap-type");

    function updateHeatmap() {
        const piece = pieceSelector?.value || 'all';
        const color = colorSelector?.value || 'all';
        const type = typeSelector?.value || 'movements';
        generateHeatmap(piece, color, type);
    }

    pieceSelector?.addEventListener("change", updateHeatmap);
    colorSelector?.addEventListener("change", updateHeatmap);
    typeSelector?.addEventListener("change", updateHeatmap);

    updateHeatmap();

}).catch(error => {
    const checkDiv = document.getElementById('data-check-results');
    if (checkDiv) {
        checkDiv.innerHTML = `<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">❌ Erreur CSV: ${error.message}</div>`;
    }
});