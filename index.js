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

const directions = ['U', 'D', 'L', 'R']; // Up, Down, Left, Right]

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
    // On parcourt l'ensemble des fantômes pour modifier leur comportement un par un
    for (let ghost of ghosts.values()) {
        // On choisit une direction au hasard parmi les 4 possibles (Haut, Bas, Gauche, Droite)
        // Math.random() donne un nombre entre 0 et 1, multiplié par 4 et arrondi à l'entier inférieur
        const newDirection = directions[Math.floor(Math.random() * 4)];
        // On applique cette nouvelle direction au fantôme pour qu'il change de trajectoire
        ghost.updateDirection(newDirection);
    }

    // Démarre la boucle principale du jeu
    update();
    // Ajoute un écouteur d'événements pour capturer les touches du clavier
    this.document.addEventListener("keyup", movePacman);

  
}


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
    move();
    draw();
    setTimeout(update, 50); //20fps 1 -> 1000/20 = 50ms
    //setInterval, setTimeout,
    
}
/**
 * Fonction responsable du rendu graphique du jeu.
 * Elle est appelée à chaque itération de la boucle update pour redessiner l'écran.
 */
function draw() {
    // Efface l'intégralité du contenu du Canvas.
    // (0, 0) : Coordonnées du coin supérieur gauche.
    // board.width, board.height : Coordonnées du coin inférieur droit (toute la surface).
    context.clearRect(0, 0, board.width, board.height); 
    // 1. DESSINER PAC-MAN
    // On dessine l'image actuelle de Pac-Man à ses coordonnées (x, y)
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);
    // 2. DESSINER LES FANTÔMES
    // On parcourt l'ensemble 'ghosts' pour afficher chaque fantôme
    for (let ghost of ghosts) {
        context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height);
    }
    // 3. DESSINER LES MURS
    // On parcourt l'ensemble 'walls' pour construire la structure du labyrinthe
    for (let wall of walls) {
        context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height);
    }
    // 4. DESSINER LA NOURRITURE
    // On définit la couleur du "pinceau" sur blanc pour les pastilles
    context.fillStyle = "white";
    for (let food of foods) {
        // Comme les pastilles n'ont pas d'image, on dessine des petits rectangles pleins
        context.fillRect(food.x, food.y, food.width, food.height);
    }
}
/**
 * Calcule et applique le déplacement de Pac-Man à chaque image (frame).
 * Cette fonction transforme la vitesse (Velocity) en changement de position réelle.
 */
function move() {
    // On additionne la vitesse horizontale à la position actuelle X.
    // Si velocityX est positif, Pac-Man va à droite. S'il est négatif, il va à gauche.
    pacman.x += pacman.velocityX;
    // On additionne la vitesse verticale à la position actuelle Y.
    // Si velocityY est positif, Pac-Man descend. S'il est négatif, il monte.
    pacman.y += pacman.velocityY;

    for (let wall of walls.values()) {
        if (collision(pacman, wall)) {
            // Collision détectée : on annule le mouvement en inversant la vitesse
            pacman.x -= pacman.velocityX;
            pacman.y -= pacman.velocityY;
            break; // Sort de la boucle dès qu'une collision est trouvée
        }
    }
    for (let ghost of ghosts.values()) {
        if (ghost.y == tileSize * 9 && ghost.direction != 'U' && ghost.direction != 'D') {
            ghost.updateDirection('U')
        }

        ghost.x += ghost.velocityX;
        ghost.y += ghost.velocityY;
        for (let wall of walls.values()) {
            if (collision(ghost, wall) || ghost.x <= 0 || ghost.x + ghost.width >= boardWidth) {
                // Collision détectée : on annule le mouvement en inversant la vitesse
                ghost.x -= ghost.velocityX;
                ghost.y -= ghost.velocityY;
                // Choisit une nouvelle direction aléatoire pour le fantôme
                const newDirection = directions[Math.floor(Math.random() * 4)];
                ghost.updateDirection(newDirection);
            }
        }
    }
}
/**
 * Intercepte les pressions de touches au clavier pour diriger Pac-Man.
 * Supporte à la fois les touches directionnelles et les touches ZQSD (ou WASD).
 * @param {KeyboardEvent} event - L'événement clavier envoyé par le navigateur.
 */
function movePacman(event) {
    // Vérifie si la touche pressée est 'Flèche Haut' ou la touche 'W' (Haut en mode WASD)
    if (event.code === "ArrowUp" || event.code === "KeyW") {
        pacman.updateDirection('U');    // Oriente Pac-Man vers le HAUT
    }
    // Vérifie si la touche pressée est 'Flèche Bas' ou la touche 'S' (Bas)
    else if (event.code === "ArrowDown" || event.code === "KeyS") {
        pacman.updateDirection('D');    // Oriente Pac-Man vers le BAS
    }
    // Vérifie si la touche pressée est 'Flèche Gauche' ou la touche 'A' (Gauche)
    else if (event.code === "ArrowLeft" || event.code === "KeyA") {
        pacman.updateDirection('L');    // Oriente Pac-Man vers la GAUCHE
    }
    // Vérifie si la touche pressée est 'Flèche Droite' ou la touche 'D' (Droite)
    else if (event.code === "ArrowRight" || event.code === "KeyD") {
        pacman.updateDirection('R');    // Oriente Pac-Man vers la DROITE
    }
    // --- MISE À JOUR VISUELLE : On change l'image selon la direction choisie ---
        // Si la direction est vers le HAUT, on assigne l'image de Pac-Man qui regarde en haut
    if (pacman.direction == 'U') {
        pacman.image = pacmanupImage;
        // Si la direction est vers le BAS, on assigne l'image correspondante
    }  else if (pacman.direction == 'D') { 
        pacman.image = pacmandownImage;
        // Si la direction est vers la GAUCHE, on change l'image pour le profil gauche
    }  else if (pacman.direction == 'L') {
        pacman.image = pacmanleftImage;
        // Si la direction est vers la DROITE, on utilise l'image du profil droit
    }  else if (pacman.direction == 'R') {
        pacman.image = pacmanrightImage;
    }
}
/** 
* Vérifie s'il y a une collision entre deux objets (AABB - Axis-Aligned Bounding Box)
* @param { Object } a - Le premier objet(ex: Pacman)
* @param { Object } b - Le deuxième objet(ex: un Fantôme ou une Pac - gomme)
* @returns { boolean } - Retourne vrai si les objets se touchent, sinon faux
*/
function collision(a, b){
    return a.x < b.x + b.width &&   // Vérifie si le bord gauche de 'a' est plus à gauche que le bord droit de 'b'
           a.x + a.width > b.x &&   // Vérifie si le bord droit de 'a' est plus à droite que le bord gauche de 'b'
           a.y < b.y + b.height &&  // Vérifie si le bord haut de 'a' est plus haut que le bord bas de 'b'
           a.y + a.height > b.y;    // Vérifie si le bord bas de 'a' est plus bas que le bord haut de 'b'
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
        // Définit l'orientation actuelle du personnage.
        // 'R' (Right) pour Droite, 'L' (Left) pour Gauche, 'U' (Up) pour Haut, 'D' (Down) pour Bas.
        // Utile pour choisir la bonne image à afficher (ex: Pac-Man qui regarde à droite).
        this.direction = 'R'; // Direction initiale (R = droite, L = gauche, U = haut, D = bas)
        // Détermine la vitesse et la direction sur l'axe horizontal (X).
        // Une valeur positive (ex: 2) déplace vers la droite, négative vers la gauche.
        this.velocityX = 0; 
        // Détermine la vitesse et la direction sur l'axe vertical (Y).
        // Une valeur positive déplace vers le bas, négative vers le haut.
        this.velocityY = 0; 
    }

    /**
     * Met à jour la direction du personnage et recalcule immédiatement sa vitesse.
     * @param {string} direction - Nouvelle direction ('U', 'D', 'L', 'R').
     */
    updateDirection(direction) {
        const prevDirection = this.direction; // Mémorise l'ancienne direction
        this.direction = direction;     // Enregistre la nouvelle direction choisie
        this.updateVelocity();          // Met à jour les vecteurs de mouvement X et Y
        this.x += this.velocityX; // Applique immédiatement le mouvement horizontal
        this.y += this.velocityY; // Applique immédiatement le mouvement vertical

        for (let wall of walls.values()) {
            if (collision(this, wall)) {
                // Collision détectée : on annule le mouvement en inversant la vitesse
                this.x -= this.velocityX;
                this.y -= this.velocityY;
                this.direction = prevDirection; // Restaure l'ancienne direction
                this.updateVelocity();          // Restaure l'ancienne vitesse
                return; // Sort de la boucle dès qu'une collision est trouvée
            }
        }

    }
    /**
     * Traduit la direction textuelle en valeurs numériques de vitesse (Velocity).
     * On utilise 'tileSize / 4' pour que la vitesse soit proportionnelle à la taille des cases.
     */
    updateVelocity() {
        if (this.direction == 'U') {     // UP (HAUT)
            this.velocityX = 0;
            this.velocityY = -tileSize / 4; // Valeur négative pour monter vers le haut du canvas
        } else if (this.direction == 'D') {     // DOWN (BAS)
            this.velocityX = 0;
            this.velocityY = tileSize / 4; // Valeur positive pour descendre 
        }
        else if (this.direction == 'L') {   // LEFT (GAUCHE)
            this.velocityX = -tileSize / 4; // Valeur négative pour aller vers la gauche
            this.velocityY = 0;
        } else if (this.direction == 'R') {  // RIGHT (DROITE)
            this.velocityX = tileSize / 4;  // Valeur positive pour aller vers la droite
            this.velocityY = 0;
            //n'oubliez pas dansun canvas HTML l'origine (0,0) est en haut à gauche
            //donc l'axe Y est orienté vers le bas positif donc le haut negatif
            //et donc pour aller a droite c'est positif et a gauche c'est negatif 
        }
    }
}