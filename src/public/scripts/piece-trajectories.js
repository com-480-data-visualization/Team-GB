d3.csv("../../data/games.csv").then(function(data) {
    console.log("Données chargées:", data.length, "parties");

    const pieces = [
        {key: 'p', name: 'Pions', color: '#e74c3c'},
        {key: 'n', name: 'Cavaliers', color: '#3498db'},
        {key: 'b', name: 'Fous', color: '#2ecc71'},
        {key: 'r', name: 'Tours', color: '#e67e22'},
        {key: 'q', name: 'Dame', color: '#f39c12'},
        {key: 'k', name: 'Roi', color: '#9b59b6'}
    ];

    const games = data.slice(0, 400);
    const allMoves = [];

    games.forEach(game => {
        const moveString = game.moves || "";
        const moveList = moveString.split(" ");
        const board = createSimpleBoard();

        moveList.forEach((move, index) => {
            if (move && !move.match(/^\d/) && !move.match(/^(1-0|0-1|1\/2)/)) {
                const trajectory = parseMove(move, board, index % 2 === 0 ? 'white' : 'black');
                if (trajectory) {
                    allMoves.push(trajectory);
                    updateBoard(board, trajectory);
                }
            }
        });
    });

    console.log("Trajectoires totales:", allMoves.length);

    let currentFilter = 'p';  // Valeur par défaut = pions
    let currentPawn = null;

    d3.select("#piece-trajectories").selectAll("div").remove();

    createControls();
    drawTrajectories();

    function createControls() {
        const container = d3.select("#piece-trajectories");

        const controls = container.append("div")
            .style("margin-bottom", "20px")
            .style("text-align", "center");

        const pieceButtons = controls.append("div")
            .style("margin-bottom", "15px");

        pieces.forEach(piece => {
            pieceButtons.append("button")
                .attr("id", "btn-" + piece.key)
                .style("margin", "4px")
                .style("padding", "6px 14px")
                .style("border", "1px solid " + piece.color)
                .style("background", currentFilter === piece.key ? piece.color : "transparent")
                .style("color", currentFilter === piece.key ? "white" : piece.color)
                .style("border-radius", "12px")
                .style("cursor", "pointer")
                .style("font-size", "14px")
                .text(piece.name)
                .on("click", () => {
                    currentFilter = piece.key;
                    currentPawn = null;
                    updateControls();
                    drawTrajectories();
                });
        });

        const pawnControls = controls.append("div")
            .attr("id", "pawn-controls")
            .style("display", currentFilter === 'p' ? "block" : "none");

        pawnControls.append("p")
            .style("margin", "10px 0 5px 0")
            .style("color", "#495057")
            .text("Pions individuels :");

        const pawns = ['a','b','c','d','e','f','g','h'];
        pawns.forEach(pawn => {
            pawnControls.append("button")
                .attr("id", "pawn-" + pawn)
                .style("margin", "2px")
                .style("padding", "4px 8px")
                .style("border", "1px solid #e74c3c")
                .style("background", currentPawn === pawn ? "#e74c3c" : "white")
                .style("color", currentPawn === pawn ? "white" : "#e74c3c")
                .style("border-radius", "10px")
                .style("font-size", "12px")
                .style("cursor", "pointer")
                .text(pawn.toUpperCase())
                .on("click", () => {
                    currentPawn = currentPawn === pawn ? null : pawn;
                    updateControls();
                    drawTrajectories();
                });
        });
    }

    function updateControls() {
        pieces.forEach(piece => {
            const btn = d3.select("#btn-" + piece.key);
            btn.style("background", currentFilter === piece.key ? piece.color : "transparent")
               .style("color", currentFilter === piece.key ? "white" : piece.color);
        });

        const showPawns = currentFilter === 'p';
        d3.select("#pawn-controls").style("display", showPawns ? "block" : "none");

        if (showPawns) {
            ['a','b','c','d','e','f','g','h'].forEach(pawn => {
                const btn = d3.select("#pawn-" + pawn);
                btn.style("background", currentPawn === pawn ? "#e74c3c" : "white")
                   .style("color", currentPawn === pawn ? "white" : "#e74c3c");
            });
        }
    }

    function drawTrajectories() {
        d3.select("#trajectory-svg").remove();

        const container = d3.select("#piece-trajectories");
        const width = 600, height = 640, boardSize = 480;
        const margin = (width - boardSize) / 2;
        const squareSize = boardSize / 8;
        const files = ['a','b','c','d','e','f','g','h'];

        const svg = container.append("svg")
            .attr("id", "trajectory-svg")
            .attr("width", width)
            .attr("height", height)
            .style("display", "block")
            .style("margin", "0 auto");

        const board = svg.append("g")
            .attr("transform", `translate(${margin}, 40)`);

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const isLight = (i + j) % 2 === 0;
                board.append("rect")
                    .attr("x", j * squareSize)
                    .attr("y", i * squareSize)
                    .attr("width", squareSize)
                    .attr("height", squareSize)
                    .attr("fill", isLight ? "#fefefe" : "#f4f4f4")
                    .attr("stroke", "#ccc");
            }
        }

        const coord = sq => ({
            x: files.indexOf(sq[0]) * squareSize + squareSize / 2,
            y: (8 - parseInt(sq[1])) * squareSize + squareSize / 2
        });

        let filtered = allMoves.filter(m => m.piece === currentFilter);
        if (currentFilter === 'p' && currentPawn) {
            filtered = filtered.filter(m => m.from[0] === currentPawn || m.to[0] === currentPawn);
        }

        const counts = {};
        filtered.forEach(m => {
            const key = m.from + "-" + m.to;
            counts[key] = (counts[key] || 0) + 1;
        });

        const max = d3.max(Object.values(counts)) || 1;
        const color = pieces.find(p => p.key === currentFilter)?.color || "#888";

        filtered.forEach(m => {
            const key = m.from + "-" + m.to;
            const freq = counts[key];
            if (freq < 2) return;

            const from = coord(m.from);
            const to = coord(m.to);
            const dx = to.x - from.x, dy = to.y - from.y;

            const controlX = (from.x + to.x) / 2 + dy * 0.2;
            const controlY = (from.y + to.y) / 2 - dx * 0.2;

            const opacity = Math.min(freq / max, 0.7);
            const widthStroke = Math.sqrt(freq) * 1.5;

            board.append("path")
                .attr("d", `M${from.x},${from.y} Q${controlX},${controlY} ${to.x},${to.y}`)
                .attr("stroke", color)
                .attr("stroke-width", widthStroke)
                .attr("fill", "none")
                .attr("opacity", opacity)
                .attr("stroke-linecap", "round")
                .append("title")
                .text(`${m.from} → ${m.to} (${freq}x)`);
        });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("fill", "#2d3748")
            .text(getTitleText());

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#6c757d")
            .text(`${filtered.length} mouvements • ${Object.keys(counts).length} trajectoires uniques`);
    }

    function getTitleText() {
        if (currentPawn && currentFilter === 'p') {
            return "Trajectoires du pion " + currentPawn.toUpperCase();
        }
        const map = {'p': 'Pions', 'n': 'Cavaliers', 'b': 'Fous', 'r': 'Tours', 'q': 'Dame', 'k': 'Roi'};
        return "Trajectoires des " + map[currentFilter];
    }

    function createSimpleBoard() {
        const board = {};
        ['a1','b1','c1','d1','e1','f1','g1','h1'].forEach((sq, i) => board[sq] = ['r','n','b','q','k','b','n','r'][i]);
        ['a2','b2','c2','d2','e2','f2','g2','h2'].forEach(sq => board[sq] = 'p');
        ['a7','b7','c7','d7','e7','f7','g7','h7'].forEach(sq => board[sq] = 'P');
        ['a8','b8','c8','d8','e8','f8','g8','h8'].forEach((sq, i) => board[sq] = ['R','N','B','Q','K','B','N','R'][i]);
        return board;
    }

    function parseMove(move, board, color) {
        const squares = move.match(/[a-h][1-8]/g);
        if (!squares || squares.length === 0) return null;

        const to = squares[squares.length - 1];
        let piece = move.match(/^[KQRBN]/) ? move[0].toLowerCase() : 'p';
        let from = null;

        Object.keys(board).forEach(sq => {
            const p = board[sq];
            if (p && ((color === 'white' && p === piece) || (color === 'black' && p === piece.toUpperCase()))) {
                if (canMove(sq, to, piece)) from = sq;
            }
        });

        if (from && from !== to) return { from, to, piece, color, move };
        return null;
    }

    function canMove(from, to, piece) {
        const f1 = from.charCodeAt(0) - 97, r1 = parseInt(from[1]) - 1;
        const f2 = to.charCodeAt(0) - 97, r2 = parseInt(to[1]) - 1;
        const df = Math.abs(f2 - f1), dr = Math.abs(r2 - r1);

        switch (piece) {
            case 'p': return df <= 1 && dr <= 2;
            case 'r': return df === 0 || dr === 0;
            case 'n': return (df === 2 && dr === 1) || (df === 1 && dr === 2);
            case 'b': return df === dr;
            case 'q': return df === 0 || dr === 0 || df === dr;
            case 'k': return df <= 1 && dr <= 1;
            default: return true;
        }
    }

    function updateBoard(board, move) {
        board[move.to] = board[move.from];
        delete board[move.from];
    }

}).catch(function(error) {
    console.error("Erreur de chargement :", error);
});