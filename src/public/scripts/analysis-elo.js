// Analysis-Elo.js - Distribution des Elo avec d3.csv (Version Corrigée)

// Attendre que le DOM soit prêt avant d'exécuter
document.addEventListener('DOMContentLoaded', function() {
    
    console.log("🚀 Démarrage de l'analyse Elo...");
    
    d3.csv("../../data/games.csv").then(data => {
        console.log(`✅ ${data.length} parties chargées`);
        
        // Vérifier que nous avons des données
        if (!data || data.length === 0) {
            throw new Error("Aucune donnée trouvée dans le fichier CSV");
        }
        
        // Vérifier les colonnes requises
        const firstRow = data[0];
        if (!firstRow.hasOwnProperty('white_rating') || !firstRow.hasOwnProperty('black_rating')) {
            throw new Error("Colonnes white_rating ou black_rating manquantes");
        }
        
        // Extraire tous les Elo valides
        const allElos = [];
        let invalidRatings = 0;
        
        data.forEach(game => {
            const whiteRating = +game.white_rating;
            const blackRating = +game.black_rating;
            
            // Validation plus robuste des ratings
            if (whiteRating && !isNaN(whiteRating) && whiteRating > 600 && whiteRating < 4000) {
                allElos.push(whiteRating);
            } else if (game.white_rating) {
                invalidRatings++;
            }
            
            if (blackRating && !isNaN(blackRating) && blackRating > 600 && blackRating < 4000) {
                allElos.push(blackRating);
            } else if (game.black_rating) {
                invalidRatings++;
            }
        });
        
        console.log(`📊 ${allElos.length} ratings Elo extraits`);
        console.log(`⚠️ ${invalidRatings} ratings invalides ignorés`);
        
        if (allElos.length === 0) {
            throw new Error("Aucun rating Elo valide trouvé");
        }
        
        // Créer l'histogramme par tranches de 100
        const eloRanges = {};
        allElos.forEach(elo => {
            const range = Math.floor(elo / 100) * 100;
            eloRanges[range] = (eloRanges[range] || 0) + 1;
        });
        
        // Préparer les données pour Chart.js
        const sortedRanges = Object.keys(eloRanges).map(Number).sort((a, b) => a - b);
        const labels = sortedRanges.map(range => `${range}-${range + 99}`);
        const counts = sortedRanges.map(range => eloRanges[range]);
        
        console.log("📈 Données préparées:", { labels, counts });
        
        // Vérifier que le canvas existe
        const canvas = document.getElementById('winRateChart');
        if (!canvas) {
            console.error("❌ Canvas 'winRateChart' introuvable !");
            console.error("💡 Assurez-vous que votre HTML contient: <canvas id='winRateChart'></canvas>");
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (window.currentChart) {
            window.currentChart.destroy();
        }
        
        // Créer le graphique
        window.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nombre de joueurs',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution des Niveaux Elo',
                        font: { size: 18, weight: 'bold' },
                        padding: { bottom: 20 }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.parsed.y / allElos.length) * 100).toFixed(1);
                                return `${context.parsed.y} joueurs (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre de joueurs',
                            font: { size: 14 }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tranches Elo',
                            font: { size: 14 }
                        }
                    }
                }
            }
        });
        
        // Calculer et afficher les statistiques
        const totalJoueurs = allElos.length;
        const eloMoyen = Math.round(allElos.reduce((a, b) => a + b, 0) / totalJoueurs);
        const eloMin = Math.min(...allElos);
        const eloMax = Math.max(...allElos);
        
        // Médiane
        const sortedElos = [...allElos].sort((a, b) => a - b);
        const eloMedian = sortedElos[Math.floor(sortedElos.length / 2)];
        
        // Écart-type
        const variance = allElos.reduce((acc, elo) => acc + Math.pow(elo - eloMoyen, 2), 0) / totalJoueurs;
        const eloStdDev = Math.round(Math.sqrt(variance));
        
        // Percentiles
        const percentile25 = sortedElos[Math.floor(sortedElos.length * 0.25)];
        const percentile75 = sortedElos[Math.floor(sortedElos.length * 0.75)];
        
        const statsContainer = document.getElementById('statsContainer');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                    <div class="text-2xl font-bold text-blue-600">${totalJoueurs.toLocaleString()}</div>
                    <div class="text-sm text-gray-600">Joueurs Total</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                    <div class="text-2xl font-bold text-green-600">${eloMoyen}</div>
                    <div class="text-sm text-gray-600">Elo Moyen</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
                    <div class="text-2xl font-bold text-orange-600">${eloMedian}</div>
                    <div class="text-sm text-gray-600">Elo Médian</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                    <div class="text-2xl font-bold text-red-600">${eloMax}</div>
                    <div class="text-sm text-gray-600">Elo Maximum</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                    <div class="text-2xl font-bold text-purple-600">${eloMin}</div>
                    <div class="text-sm text-gray-600">Elo Minimum</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
                    <div class="text-2xl font-bold text-gray-600">±${eloStdDev}</div>
                    <div class="text-sm text-gray-600">Écart-type</div>
                </div>
            `;
        } else {
            console.error("❌ Element 'statsContainer' introuvable !");
            console.error("💡 Assurez-vous que votre HTML contient: <div id='statsContainer'></div>");
        }
        
        console.log("🎉 Graphique Elo créé avec succès !");
        console.log("📊 Stats:", { 
            totalJoueurs, 
            eloMoyen, 
            eloMin, 
            eloMax, 
            eloMedian, 
            eloStdDev,
            percentile25,
            percentile75,
            invalidRatings
        });
        
    }).catch(error => {
        console.error("❌ ERREUR CSV:", error);
        
        // Messages d'erreur plus détaillés
        let errorMessage = error.message;
        if (error.message.includes('404')) {
            errorMessage = "Fichier CSV non trouvé. Vérifiez le chemin '../../data/games.csv'";
        } else if (error.message.includes('network')) {
            errorMessage = "Erreur réseau. Vérifiez votre connexion et le serveur local.";
        }
        
        // Graphique de fallback en cas d'erreur
        const canvas = document.getElementById('winRateChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            if (window.currentChart) {
                window.currentChart.destroy();
            }
            
            window.currentChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Erreur'],
                    datasets: [{
                        label: 'Données indisponibles',
                        data: [1],
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { 
                            display: true, 
                            text: 'ERREUR - Impossible de charger les données',
                            font: { size: 16, weight: 'bold' },
                            color: '#dc2626'
                        },
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
        
        const statsContainer = document.getElementById('statsContainer');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="bg-red-100 p-4 rounded-lg border border-red-300">
                    <div class="text-lg font-bold text-red-600">ERREUR</div>
                    <div class="text-sm text-red-600">${errorMessage}</div>
                    <div class="text-xs text-red-500 mt-2">
                        💡 Vérifications suggérées :<br>
                        • Le fichier games.csv existe-t-il dans ../../data/ ?<br>
                        • Le serveur local est-il démarré ?<br>
                        • Les colonnes white_rating et black_rating sont-elles présentes ?
                    </div>
                </div>
            `;
        }
    });
    
});

// Fonction utilitaire pour diagnostiquer les problèmes
function diagnosticElo() {
    console.log("🔍 DIAGNOSTIC ELO");
    console.log("==================");
    
    // Vérifier les éléments DOM
    const canvas = document.getElementById('winRateChart');
    const stats = document.getElementById('statsContainer');
    
    console.log("Canvas 'winRateChart':", canvas ? "✅ Trouvé" : "❌ Manquant");
    console.log("Div 'statsContainer':", stats ? "✅ Trouvé" : "❌ Manquant");
    
    // Vérifier les dépendances
    console.log("D3.js:", typeof d3 !== 'undefined' ? "✅ Chargé" : "❌ Manquant");
    console.log("Chart.js:", typeof Chart !== 'undefined' ? "✅ Chargé" : "❌ Manquant");
    
    // Test du chemin CSV
    console.log("Test du chemin CSV...");
    d3.text("../../data/games.csv")
        .then(() => console.log("Fichier CSV: ✅ Accessible"))
        .catch(err => console.log("Fichier CSV: ❌", err.message));
}