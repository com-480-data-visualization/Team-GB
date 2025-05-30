d3.csv("../../data/games.csv").then(data => {
    const checkDiv = document.getElementById('data-check-results');
    if (checkDiv) {
        let checkHTML = '<h3 class="text-lg font-semibold mb-3">Résultats de vérification :</h3>';
        checkHTML += data.length === 0
            ? '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">❌ Aucune donnée trouvée dans le fichier CSV</div>'
            : `<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">✅ ${data.length} parties chargées avec succès</div>`;
        checkDiv.innerHTML = checkHTML;
    }

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    function extractSquare(move) {
        // Nettoyer le coup des symboles d'échec/mat
        const cleanMove = move.replace(/[+#]/g, '');
        
        // Pour les captures, chercher la case de destination après 'x'
        if (cleanMove.includes('x')) {
            const match = cleanMove.match(/x([a-h][1-8])/);
            return match ? match[1] : null;
        }
        
        // Pour les coups normaux, dernière case mentionnée
        const match = cleanMove.match(/([a-h][1-8])/g);
        return match ? match[match.length - 1] : null;
    }

    function extractPiece(move) {
        // Nettoyer le coup
        const cleanMove = move.replace(/[+#x]/g, '');
        
        // Roques
        if (move.includes('O-O')) return 'k';
        
        // Pièce explicite au début
        const pieceMatch = move.match(/^([KQRBN])/);
        if (pieceMatch) return pieceMatch[1].toLowerCase();
        
        // Sinon c'est un pion
        return 'p';
    }

    function isCapture(move) {
        return move.includes('x');
    }

    function isCheckOrMate(move) {
        return move.includes('+') || move.includes('#');
    }

    function generateHeatmap(pieceType, color, type) {
        const squareFreq = {};
        files.forEach(f => ranks.forEach(r => squareFreq[f + r] = 0));

        data.forEach(row => {
            const moves = row.moves?.split(" ") || [];

            moves.forEach((move, idx) => {
                // Ignorer les numéros de coups et les résultats
                if (/^\d+\./.test(move) || /^(1-0|0-1|1\/2-1\/2|\*)$/.test(move)) return;
                
                const moveColor = idx % 2 === 0 ? 'w' : 'b';
                if (color !== 'all' && color !== moveColor) return;

                const piece = extractPiece(move);
                const square = extractSquare(move);
                
                // Vérifier que la case est valide
                if (!square || !squareFreq.hasOwnProperty(square)) return;
                if (pieceType !== 'all' && piece !== pieceType) return;

                // Filtrer par type de mouvement
                if (type === 'captures' && !isCapture(move)) return;
                if (type === 'checks' && !isCheckOrMate(move)) return;
                // type === 'movements' inclut tous les coups

                squareFreq[square]++;
            });
        });

        const maxFreq = d3.max(Object.values(squareFreq));
        const normalizedData = Object.entries(squareFreq).map(([square, count]) => ({
            file: square[0],
            rank: square[1],
            frequency: maxFreq > 0 ? count / maxFreq : 0
        }));

        drawHeatmap(normalizedData);
    }

    function drawHeatmap(normalizedData) {
        const container = d3.select("#heatmap-container");
        container.selectAll("*").remove();

        const width = container.node().clientWidth;
        const squareSize = width / 8;
        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", width);

        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 1]);

        normalizedData.forEach(d => {
            const x = files.indexOf(d.file) * squareSize;
            const y = (8 - +d.rank) * squareSize;

            svg.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("width", squareSize)
                .attr("height", squareSize)
                .attr("fill", colorScale(d.frequency))
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5);
        });
    }

    // Initialisation des sélecteurs
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

    updateHeatmap(); // affichage initial

}).catch(error => {
    console.error('Erreur lors du chargement du CSV:', error);
    const checkDiv = document.getElementById('data-check-results');
    if (checkDiv) {
        checkDiv.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                ❌ Erreur lors du chargement : ${error.message}
                <br><small>Vérifiez que le fichier games.csv existe et est accessible</small>
            </div>
        `;
    }
});