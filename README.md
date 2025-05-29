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

### Project Structure

- `data/` – Preprocessed dataset used for visualizations  
- `images/` – Images used in the documentation or on the website  
- `src/` – Source code and server setup  
  - `public/` – Main frontend files served to the browser  
    - `images/` – Static assets (icons, logos, etc.)  
    - `models/` – JSON data files used by D3.js  
    - `scripts/` – JavaScript visualizations (built with D3.js)  
    - `styles/` – CSS stylesheets  
    - `views/` – HTML content for additional pages/tabs  
    - `404.html`, `index.html`, `robots.txt`  
- `Dockerfile` – Configuration for Docker deployment  
- `index.js` – Entry point for the Node.js application  
- `server.js` – Express.js server setup  
- `package.json` – Project dependencies and scripts  
- `.gitignore`, `LICENSE`, `README.md`, `captain-definition`







