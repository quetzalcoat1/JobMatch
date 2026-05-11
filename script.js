














// -----------------------------
// --- 0. VARIABLES GLOBALES ---
// -----------------------------


// - Données utilisateur -
let id_utilisateur = 2;

const TYPE_UTILISATEUR = {
  EMPLOYEUR: "employeur",
  CHERCHEUR: "chercheur"
};
let type_utilisateur = null;



// - User interface -
let id_offre_emploi_actuelle = null;

//Données
let ui_prenom_utilisateur;
let ui_nom_utilisateur;

//listes
let ui_liste_offre_emploi;
let ui_liste_mes_offres;
let ui_template_offre;

//boutons
let ui_bouton_ajouter_offre_emploi;
let ui_bouton_changer_id_utilisateur;

//menus
let default_menu_id = 2;
let current_menu_id = default_menu_id;
let ui_menu_button_list;
let menu_list = [];



// - Database -
let supabaseClient;
let match_list = [];
let refresh_delay = 2000; //2 seconds



// - Card Swipe Animation -
let isDragging = false;

let offsetX = 0;
let offsetY = 0;

let currentX = 0;
let currentY = 0;

let angle = 0;

let velocityX = 0;

let lastX = 0;
let lastTime = 0;

let friction = 0.95;
friction = 1;
let speed = 7;

let coeff_angle = 0.05;
let angle_velocity = 1.5;

let velocity_to_swipe = 0.9;

let animateBackDuration = 500; // ms
let animationId = null;
let swipe_direction = null;
let delay_between_swipes = 80; // ms
let resetCardAfterSwipeDuration = 250; // ms














// -------------------------
// --- 1. INITIALISATION ---
// -------------------------


window.onload = () => {
    db_initialisation();

    //ui_assignation();
    //ui_event_listeners();
    //ui_initialisation();
    ui_swipe_initialisation();

    //start();
};

function db_initialisation() {
    // URL et clé publique (anon key) depuis Supabase Dashboard
    const SUPABASE_URL = "https://yxyzcmzjezaechwirlau.supabase.co";                // URL du projet
    const SUPABASE_ANON_KEY = "sb_publishable_mrOPsTPNmHR9jwqUcVrJ-Q_pq-y95sI";     // clé publique

    // Crée le client Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function ui_assignation() {
    ui_prenom_utilisateur = document.getElementById('prenom_utilisateur');
    ui_nom_utilisateur = document.getElementById('nom_utilisateur');

    ui_liste_offre_emploi = document.getElementById('liste_offre_emploi');
    ui_liste_mes_offres = document.getElementById('liste_mes_offres');
    ui_template_offre = document.getElementById('template_offre');

    ui_bouton_ajouter_offre_emploi = document.getElementById('bouton_ajouter_offre');
    ui_bouton_changer_id_utilisateur = document.getElementById('button_id_utilisateur');

    ui_menu_button_list = document.getElementById('navbar').children;
}

function ui_event_listeners() {
    ui_bouton_ajouter_offre_emploi.addEventListener('click', async () => handle_bouton_ajouter_offre_emploi());
    ui_bouton_changer_id_utilisateur.addEventListener('click', async () => {
        id_utilisateur = parseInt(document.getElementById('input_id_utilisateur').value);
        get_all_database();
    });
}

function ui_menu_initialisation() {
    menu_list_unsorted = Array.from(document.getElementsByClassName('menu'));

    menu_list_unsorted.forEach(menu_object => {
        menu_list[menu_object.getAttribute("menu_id")] = menu_object;
    });

    //class="menu" menu_id="0"

    ui_menu_button_list = document.getElementById('navbar').children;
    for (let i = 0; i < ui_menu_button_list.length; i++) {
        let button = ui_menu_button_list[i];
        let button_menu_id = button.getAttribute("menu_id");
        button.addEventListener('click', async () => {
            display_menu(button_menu_id);
        });
    }
}

function ui_swipe_initialisation() {
    card_rect = document.getElementById("carte_offre");
    const rectPos = card_rect.getBoundingClientRect();

    originX = rectPos.left;
    originY = rectPos.top;

    card_rect.addEventListener("mousedown", (e) => {
        carte_offre_down(e);
    });

    card_rect.addEventListener("touchstart", (e) => {
        carte_offre_down(e.touches[0]);
    });
}

async function start() {
    display_menu(default_menu_id);

    get_all_database();
    start_refresh_timer();

    if (type_utilisateur === TYPE_UTILISATEUR.CHERCHEUR) {
        match_list = await get_match_from_chercheur_emploi();
    }
    else if (type_utilisateur === TYPE_UTILISATEUR.EMPLOYEUR) {
        match_list = await get_match_from_offre_emploi();
    }
}















// -----------------------------------------
// --- 2. GESTION DU REFRESH DES DONNEES ---
// -----------------------------------------


function get_all_database() {
    get_nom_utilisateur();
    get_offre_emploi();
    get_mes_offres();
    get_photo_profil();
}

function start_refresh_timer() {
    refresh_timer();
}

function refresh_timer() {
    setTimeout(() => {
        refresh();
        refresh_timer();
    }, refresh_delay);
}

async function refresh() {
    get_offre_emploi();
    await manage_match_notifications();
    
    console.log("Rafraîchissement des données");
}

async function manage_match_notifications() {

    let new_match_list = await get_match_from_chercheur_emploi();

    const set_match_list = new Set(match_list.map(makeKey))
    const new_matches = new_match_list.filter(x => !set_match_list.has(makeKey(x)))

    if (new_matches.length > 0) {
        match_notification(new_matches)
        match_list = new_match_list;
    }
}

function makeKey(x) {
    return `${x.id_offre_emploi}-${x.id_chercheur_emploi}`;
}

function match_notification(new_matches) {
    console.log("Nouveau match trouvé :", new_matches);
}















// -----------------------------------
// --- 1. GESTION DE LA NAVIGATION ---
// -----------------------------------


//fonctionnel :

function display_menu(menu_id) {
    
    current_menu_id = menu_id;
    //console.log(menu_list);
    for (let i = 0; i < menu_list.length; i++) {
        if (menu_list[i] != null) {
            menu_list[i].classList.add('hidden');
        }
        if (ui_menu_button_list[i] != null) {
            ui_menu_button_list[i].classList.add('inactive');
        }
    }
    if (menu_list[menu_id] != null) {
        menu_list[menu_id].classList.remove('hidden');
    }
    if (ui_menu_button_list[menu_id] != null) {
        ui_menu_button_list[menu_id].classList.remove('inactive');
    }
}

// ancien code :

function allerA(idPage) {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Afficher la page cible
    const pageCible = document.getElementById(idPage);
    if (pageCible) pageCible.classList.add('active');

    // Gérer l'état visuel des onglets de la barre de navigation
    document.querySelectorAll('.onglet').forEach(o => o.classList.remove('actif'));
    
    // On déduit l'ID de l'onglet à partir de l'ID de la page (ex: p-profil -> n-profil)
    let idOnglet = 'n-' + idPage.split('-')[1];
    let ongletActif = document.getElementById(idOnglet);
    if(ongletActif) ongletActif.classList.add('actif');
}















// ----------------------------
// --- 2. DATABASE REQUESTS ---
// ----------------------------


async function get_match_from_chercheur_emploi() {
    const { data, error } = await supabaseClient
    .from('match')
    .select(`
    *,
    offre_emploi(*)
    `)
    .eq('id_chercheur_emploi', id_utilisateur);

    if (data == null || error) {
        throw new Error("Impossible de récupérer les offres générales");
    }

    return data;
}

async function get_match_from_offre_emploi(id_offre_emploi) {

    if (id_offre_emploi == null) {
        return [];
        //TODO : il faut récup les matchs de toutes les offres ?
    }

    const { data, error } = await supabaseClient
    .from('match')
    .select(`
    *,
    chercheur_emploi(*)
    `)
    .eq('id_offre_emploi', id_offre_emploi);

    if (data == null || error) {
        throw new Error("Impossible de récupérer les offres générales");
    }

    return data;
}

// ancien code :

// --- 3. ENVOI DU FORMULAIRE (VERS LE JAVA) ---
function publierOffre() {
    // Récupération des données des champs simplifiés
    const champs = document.querySelectorAll('.form-champ');
    const nouvelleOffre = {
        titre: champs[0].value,
        missions: champs[1].value,
        date: new Date().toLocaleDateString()
    };

    if (!nouvelleOffre.titre) {
        alert("Veuillez donner un titre à l'offre.");
        return;
    }

    console.log("Données prêtes pour le Java :", nouvelleOffre);

    allerA('p-offres'); // Retour à la liste
}

// On lie le bouton du formulaire à la fonction
const btnPublier = document.querySelector('#p-formulaire bouton-bleu');
if (btnPublier) {
    btnPublier.onclick = publierOffre;
}















// --------------------------
// --- 2. SWIPE ANIMATION ---
// --------------------------


// UPDATE TRANSFORM

function updateCardTransform() {

    card_rect.style.transform =
        `translate(-50%, -50%) 
         translate(${currentX}px, ${currentY}px) 
         rotate(${angle}deg)`;
}


// MOUSE DOWN

function carte_offre_down(e) {

    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    isDragging = true;

    const rect = card_rect.getBoundingClientRect();

    // ⚠️ IMPORTANT : conversion en coordonnées relatives au centre
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const transformX = currentX;
    const transformY = currentY;

    offsetX = e.clientX - (centerX + transformX);
    offsetY = e.clientY - (centerY + transformY);

    lastX = e.clientX;
    lastTime = performance.now();
}


// MOVE

function carte_offre_move(e) {

    if (!isDragging) return;

    currentX = e.clientX - window.innerWidth / 2 - offsetX;
    currentY = e.clientY - window.innerHeight / 2 - offsetY;

    angle = currentX * coeff_angle;

    updateCardTransform();

    // velocity
    const now = performance.now();

    const dx = e.clientX - lastX;
    const dt = now - lastTime;

    if (dt > 0) {
        velocityX = dx / dt;
    }

    lastX = e.clientX;
    lastTime = now;
}


// MOUSE UP

function carte_offre_up() {

    if (!isDragging) return;

    isDragging = false;

    if (Math.abs(velocityX) > velocity_to_swipe) {

        animateSwipe();

    } else {

        animateBack();
    }
}


// SWIPE ANIMATION

function animateSwipe() {

    swipe_direction = velocityX > 0 ? "droite" : "gauche";
    const startTime = performance.now();

    function frame() {

        velocityX *= friction;
        currentX += velocityX * speed;
        angle += velocityX * angle_velocity;
        

        updateCardTransform();

        const out = isElementOutsideScreen(card_rect, 150);
        const time = performance.now();
        const dt = time - startTime;

        if (dt < 2000 && !out && Math.abs(velocityX) > 0.05) {
            animationId = requestAnimationFrame(frame);
        } else {
            animationId = null;
            setTimeout(() => {
                resetCardAfterSwipe();
            }, delay_between_swipes);
        }
    }
    frame();

    //TODO : gérer le match ou le refus de l'offre selon la direction du swipe
    // + charger l'offre suivante
    console.log(swipe_direction === "droite" ? "Swipe droite" : "Swipe gauche");
}

function resetCardAfterSwipe() {

    isDragging = false;
    //card_rect.style.pointerEvents = "none";
    
    velocityX = 0;
    angle = 0;
    currentX = 0;
    currentY = 0;

    updateCardTransform();

    const startScale = 0.9;
    const endScale = 1;

    const startTime = performance.now();

    function frame(time) {

        let t = (time - startTime) / resetCardAfterSwipeDuration;
        if (t > 1) t = 1;

        const ease = 1 - Math.pow(1 - t, 3);

        const scale = startScale + (endScale - startScale) * ease;

        card_rect.style.opacity = ease;
        card_rect.style.transform =
            `translate(-50%, -50%) translate(${currentX}px, ${currentY}px) rotate(${angle}deg) scale(${scale})`;

        if (t < 1) {
            requestAnimationFrame(frame);
        }
        else {
            card_rect.style.pointerEvents = "auto";
        }
    }

    requestAnimationFrame(frame);
}


// RETURN ANIMATION

function animateBack() {

    const startX = currentX;
    const startY = currentY;
    const startAngle = angle;

    const startTime = performance.now();

    function frame(time) {

        let t = (time - startTime) / animateBackDuration;
        if (t > 1) t = 1;

        const ease = easeOutCubic(t);

        currentX = startX + (0 - startX) * ease;
        currentY = startY + (0 - startY) * ease;
        angle = startAngle + (0 - startAngle) * ease;

        updateCardTransform();

        if (t < 1) {
            animationId = requestAnimationFrame(frame);
        } else {
            animationId = null;

            currentX = 0;
            currentY = 0;
            angle = 0;

            updateCardTransform();
        }
    }
    animationId = requestAnimationFrame(frame);
}


// UTILS

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function isElementOutsideScreen(element, margin = 0) {

    const rect = element.getBoundingClientRect();
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;

    return (
        rect.right < -margin ||
        rect.left > w + margin ||
        rect.bottom < -margin ||
        rect.top > h + margin
    );
}


// EVENTS

document.addEventListener("mousemove", carte_offre_move);
document.addEventListener("mouseup", carte_offre_up);

document.addEventListener("touchmove", (e) => {
    carte_offre_move(e.touches[0]);
}, { passive: true });

document.addEventListener("touchend", carte_offre_up);
