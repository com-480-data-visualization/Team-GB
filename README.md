# Project of Data Visualization (COM-480) - exploring chess world

## Team members:

| Student's name | SCIPER |
| -------------- | ------ |
| Fanny Missilier | 346565 |
| Zacharie Bourlard | 329920 |
| Rodrigue de Guerre | 327683 |

## Our website 

This website is the final project of the *Data Visualization* course at EPFL. It is designed to offer an engaging and accessible analysis of a dataset containing **22,000 chess games from Lichess**. Our goal is to present insights that are interesting to players of all levels – from complete beginners to advanced players.

The website is organized into four main sections:

- **Dashboard**: Offers general statistics about the dataset (e.g., game durations, number of moves, players' ratings).
- **Pieces (for beginners)**: Investigates the role and movements of different pieces across games.
- **Game Analysis**: Allows users to explore the game dynamics: openings, closings and best moves.
- **Player analysis**: Displays the interesting statistics of a player from our dataset.

Each section includes interactive and animated visualizations built with D3.js, allowing users to explore the data dynamically.

---

## Technical Setup

Our website is hosted online and publicly accessible at:
👉 https://www.team-gb.org
There is no need to run the project locally to explore the interactive visualizations or access the analysis. Everything is available via the live website.
However, for those interested in the implementation details, the complete codebase is accessible in this GitHub repository. Below is the structure of the main components:

### Project Structure

📁 data/              # Preprocessed dataset
📁 images/            # Images used in the documentation or on the website
📁 src/
│   ├── public/       # Main frontend files served to the browser
│   │   ├── images/   # Static assets
│   │   ├── models/   # JSON models or processed data used by visualizations
│   │   ├── scripts/  # JavaScript files for interactive visualizations (D3.js)
│   │   ├── styles/   # CSS stylesheets
│   │   ├── views/    # HTML content for subpages
│   │   └── index.html, 404.html, robots.txt
│   ├── Dockerfile    # Configuration for containerized deployment
│   ├── index.js      # Entry point for the Node.js server
│   ├── server.js     # Server setup for hosting static files
│   └── package.json  # Node project dependencies
📄 .gitignore
📄 LICENSE
📄 README.md
📄 captain-definition (server configuration metadata)





