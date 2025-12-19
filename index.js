// --- CONFIGURATION DU PLATEAU DE JEU ---
let board;              // Variable pour stocker l'élément Canvas HTML
const rowCount = 21;    // Nombre de lignes dans le labyrinthe
const colCount = 19;    // Nombre de colonnes dans le labyrinthe
const tileSize = 32;    // Taille de chaque case (tuile) en pixels

// Calcul automatique de la largeur et hauteur totale du canvas
const boardWidth = colCount * tileSize;
const boardHeight = rowCount * tileSize;
let context;    // Le "pinceau" qui permettra de dessiner en 2D sur le canvas

// --- DÉCLARATION DES VARIABLES POUR LES IMAGES ---
// Images des fantômes
let blueGhostImage;
let orangeGhostImage;
let pinkGhostImage;
let redGhostImage;
// Images de Pac-Man (une pour chaque direction)
let pacmanupImage;
let pacmandownImage;
let pacmanleftImage;
let pacmanrightImage;
// Image pour les murs du labyrinthe
let wallImage;

// --- INITIALISATION DU JEU ---
// Cette fonction s'exécute automatiquement quand la page Web a fini de charger
window.onload = function() {
    // On récupère l'élément Canvas par son ID "board"
    board = document.getElementById("board");
    // On définit les dimensions physiques du canvas
    board.width = boardWidth;
    board.height = boardHeight;
    // On initialise le contexte de dessin en 2D
    context = board.getContext("2d");
    // Appel de la fonction pour charger toutes les ressources graphiques
    loadImages();
    // Appelle la fonction qui génère le niveau à partir d'une matrice ou d'un fichier de données
    loadMap();
    // Affiche dans la console le nombre d'éléments stockés dans les collections respectives
    // Utile pour vérifier que tous les objets ont bien été instanciés après le chargement de la carte
    console.log(walls.size);    // Affiche le nombre total de murs (souvent un Set ou une Map)
    console.log(foods.size);    // Affiche le nombre de gommes/pastilles à manger
    console.log(ghosts.size);   // Affiche le nombre de fantômes créés
}
//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX"
];
// --- STOCKAGE DES OBJETS DU JEU ---
// Utilisation de Set() pour stocker les murs (plus performant qu'un tableau pour les recherches)
const walls = new Set();
// Conteneur pour toutes les pastilles de nourriture que Pac-Man doit manger
const foods = new Set();
// Conteneur pour les différents fantômes (Blinky, Pinky, Inky, Clyde)
const ghosts = new Set();
// Variable qui contiendra l'objet unique représentant Pac-Man
let pacman;


// --- CHARGEMENT DES RESSOURCES (ASSETS) ---
function loadImages() {
    // Chargement de l'image des murs
    wallImage = new Image();
    wallImage.src = "./image/wall.png";
    // Chargement des images des fantômes
    blueGhostImage = new Image();
    blueGhostImage.src = "./image/blueGhost.png";
    orangeGhostImage = new Image();
    orangeGhostImage.src = "./image/orangeGhost.png";
    pinkGhostImage = new Image();
    pinkGhostImage.src = "./image/pinkGhost.png";
    redGhostImage = new Image();
    redGhostImage.src = "./image/redGhost.png";
    // Chargement des images de Pac-Man selon sa direction
    pacmanupImage = new Image();
    pacmanupImage.src = "./image/pacmanUp.png";
    pacmandownImage = new Image();
    pacmandownImage.src = "./image/pacmanDown.png";
    pacmanleftImage = new Image();
    pacmanleftImage.src = "./image/pacmanLeft.png";
    pacmanrightImage = new Image();
    pacmanrightImage.src = "./image/pacmanRight.png";
}

function loadMap(){
    // 1. RÉINITIALISATION : On vide les anciennes données pour éviter les doublons
    // si on recharge le niveau ou si on change de niveau.
    walls.clear();
    foods.clear();
    ghosts.clear();
    // 2. PARCOURS DE LA GRILLE : On utilise une double boucle (Lignes/Colonnes)
    // pour lire chaque case de la matrice 'tileMap'.
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            // Récupère le caractère à la position actuelle (ex: '1', '0', 'P')
            const row = tileMap[r];
            const tileMapChar = row[c];
            // 3. CONVERSION EN COORDONNÉES PIXELS :
            // On transforme l'index (ligne/colonne) en position réelle sur l'écran.
            const x = c * tileSize;
            const y = r * tileSize;

            if (tileMapChar === 'X') {
                // Créer un mur et l'ajouter à l'ensemble des murs
                const wall = new Block(wallImage, x, y, tileSize, tileSize);
                walls.add(wall);
            }
            else if (tileMapChar == 'b') {
                // Créer un fantôme bleu et l'ajouter à l'ensemble des fantômes
                const ghost = new Block(blueGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'o') {
                // Créer un fantôme orange et l'ajouter à l'ensemble des fantômes
                const ghost = new Block(orangeGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'p') {
                // Créer un fantôme rose et l'ajouter à l'ensemble des fantômes
                const ghost = new Block(pinkGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'r') {
                // Créer un fantôme rouge et l'ajouter à l'ensemble des fantômes
                const ghost = new Block(redGhostImage, x, y, tileSize, tileSize);
                ghosts.add(ghost);
            }
            else if (tileMapChar == 'P') {
                // Créer un Pac-Man 
                pacman = new Block(pacmanrightImage, x, y, tileSize, tileSize);
            }
            else if (tileMapChar === ' ') {
                // Créer une pastille de nourriture et l'ajouter à l'ensemble des nourritures
                const food = new Block(null, x + 14, y + 14, 4, 4);
                foods.add(food);
            }
        }
    }
}

function update() {
    draw();
    setTimeout(update, 50); //20fps 1 -> 1000/20 = 50ms
    //setInterval, setTimeout,
    
}

function draw() {
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
}

/**
 * Classe représentant un élément graphique du jeu (Mur, Pac-Man ou Fantôme).
 * Elle permet de regrouper toutes les propriétés d'un objet au même endroit.
 */
class Block {
    constructor(image, x, y, width, height) {
        this.image = image;     // L'image assignée au bloc
        this.x = x;             // Position X actuelle (changera pendant le mouvement)
        this.y = y;             // Position Y actuelle (changera pendant le mouvement)
        this.width = width;     // Largeur de l'objet
        this.height = height;   // Hauteur de l'objet
        // On mémorise la position de départ pour pouvoir réinitialiser 
        // le jeu (reset) sans recharger la page
        this.startX = x;
        this.startY = y;
    }
}