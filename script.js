














// -----------------------------
// --- 0. VARIABLES GLOBALES ---
// -----------------------------


// - Données utilisateur -
let id_utilisateur = 1;

const TYPE_UTILISATEUR = {
  EMPLOYEUR: "employeur",
  CHERCHEUR: "chercheur"
};
let type_utilisateur = null;



// - User interface -
let id_offre_proposee_swipe = null;
let id_chercheur_propose_swipe = null;
let id_offre_emploi_actuelle = null;

//Données
//let ui_prenom_utilisateur;
//let ui_nom_utilisateur;

//listes
let ui_liste_offre_emploi;
let ui_liste_mes_offres;
let ui_template_offre;

//boutons
let ui_bouton_ajouter_offre_emploi;
let ui_bouton_changer_id_utilisateur;

//menus
let default_menu_id = 1;
let current_menu_id = default_menu_id;
let ui_menu_button_list;
let menu_list = [];



// - Database -
let supabaseClient;
let match_list = [];
let refresh_delay = 2000; //2 seconds



// - Notification -
let notification_default_duration = 2000; //ms



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

    ui_assignation();
    ui_event_listeners();
    //ui_initialisation();
    ui_swipe_initialisation();

    start();
};

function db_initialisation() {
    // URL et clé publique (anon key) depuis Supabase Dashboard
    const SUPABASE_URL = "https://yxyzcmzjezaechwirlau.supabase.co";                // URL du projet
    const SUPABASE_ANON_KEY = "sb_publishable_mrOPsTPNmHR9jwqUcVrJ-Q_pq-y95sI";     // clé publique

    // Crée le client Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function ui_assignation() {
    //ui_prenom_utilisateur = document.getElementById('prenom_utilisateur');
    //ui_nom_utilisateur = document.getElementById('nom_utilisateur');

    //ui_liste_offre_emploi = document.getElementById('liste_offre_emploi');
    ui_liste_mes_offres = document.getElementById('liste-mes-offres');
    ui_template_offre = document.getElementById('template-offre');

    ui_bouton_ajouter_offre = document.getElementById('bouton-ajouter-offre');
    //ui_bouton_changer_id_utilisateur = document.getElementById('button_id_utilisateur');

    //ui_menu_button_list = document.getElementById('navbar').children;
}

function ui_event_listeners() {
    ui_bouton_ajouter_offre.addEventListener('click', async () => handle_bouton_ajouter_offre());
    //ui_bouton_changer_id_utilisateur.addEventListener('click', async () => {
    //    id_utilisateur = parseInt(document.getElementById('input_id_utilisateur').value);
    //    get_all_database();
    //});
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
    card_rect = document.getElementById("carte-offre");
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
    //display_menu(default_menu_id);
    allerA('p-decouvrir');

    get_all_database();
    manage_match_notifications(init=true);
    start_refresh_timer();

    if (type_utilisateur === TYPE_UTILISATEUR.CHERCHEUR) {
        //match_list = await get_match_from_chercheur_emploi();
    }
    else if (type_utilisateur === TYPE_UTILISATEUR.EMPLOYEUR) {
        //match_list = await get_match_from_offre_emploi();
    }

    id_offre_proposee_swipe = 3; //TODO : récupérer une offre dans la database
    id_chercheur_propose_swipe = 1; //TODO : récupérer un chercheur dans la database
    id_offre_emploi_actuelle = 3; //TODO : sauvegarder l'offre actuelle de l'employeur
}















// -----------------------------------------
// --- 2. GESTION DU REFRESH DES DONNEES ---
// -----------------------------------------


function get_all_database() {
    get_nom_utilisateur();
    get_photo_profil();
    //get_offre_emploi();
    get_mes_offres();
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
    //get_offre_emploi();
    console.log("Rafraîchissement des données :");

    await manage_match_notifications();
}

async function manage_match_notifications(init=false) {

    let new_match_list = await get_match_from_chercheur_emploi();

    const set_match_list = new Set(match_list.map(makeKey))
    const new_matches = new_match_list.filter(x => !set_match_list.has(makeKey(x)))

    if (init) {
        console.log("Initialisation des matchs :", new_match_list);
    }
    if (new_matches.length > 0) {
        if (!init) {
            match_notification(new_matches)
        }
        match_list = new_match_list;
    }
}

function makeKey(x) {
    return `${x.id_offre_emploi}-${x.id_chercheur_emploi}`;
}

function match_notification(new_matches) {
    console.log("Nouveau match trouvé :", new_matches);

    //new_matches[0].

    afficher_notification("Vous avez un nouveau match !");
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


async function get_nom_utilisateur() {
    const { data, error } = await supabaseClient
    .from('utilisateur')
    .select('*')
    .eq('id_utilisateur', id_utilisateur);

    if (data == null || error) {
        throw new Error("Impossible de récupérer le nom de l'utilisateur");
    }

    if (data[0].type == "employeur") {
        type_utilisateur = TYPE_UTILISATEUR.EMPLOYEUR;
    } else if (data[0].type == "chercheur") {
        type_utilisateur = TYPE_UTILISATEUR.CHERCHEUR;
    } else {
        type_utilisateur = null;
        console.error("Type d'utilisateur inconnu :", data[0].type);
    }

    refresh_nom_utilisateur(data[0].nom, data[0].prenom);
}

async function get_photo_profil() {

    const { data, error } = await supabaseClient
        .from('utilisateur')
        .select('url_photo_profil')
        .eq('id_utilisateur', id_utilisateur)
        .single();
    if (data == null || error) {
        throw new Error("Impossible de récupérer l'url de la photo de profil de l'utilisateur");
    }
    let local_photo_url = data.url_photo_profil;

    if(local_photo_url) {
        
        const { data: publicData, error: publicError } = supabaseClient.storage
        .from('photo_profil')
        .getPublicUrl(local_photo_url);
        if (publicData == null || publicError) {
            throw new Error("Impossible de récupérer la photo de profil de l'utilisateur");
        }
        let public_photo_url = publicData.publicUrl;
        refresh_photo_profil(public_photo_url);
    }
    else {
        refresh_photo_profil("");
    }
}

/*
pour input une image :

const { data, error } = await supabase
.storage
.from('photo_profil')
.upload('professional-young-man-stockcake.webp', file); // file = File object depuis input
*/

async function get_mes_offres() {
    const { data, error } = await supabaseClient
    .from('offre_emploi')
    .select(`
    *,
    employeur!inner(
        id_employeur,
        entreprise!inner(nom_entreprise)
    )
    `)
    .eq('id_employeur', id_utilisateur);

    if (data == null || error) {
        throw new Error("Impossible de récupérer les offres de l'utilisateur");
    }

    refresh_liste_mes_offres(data);
}

async function add_offre_emploi(nom_offre, refresh=false)
{
    const { data, error } = await supabaseClient
        .from('offre_emploi')
        .insert([{ nom_offre: nom_offre, id_employeur: id_utilisateur }]);

    if (error) {
        console.error(error);
    } else {
        console.log("Offre ajoutée :", nom_offre, ":", data);
    }
    if (refresh) {
        get_mes_offres(); // afficher directement
    }
}

async function delete_offre_emploi(id_offre_emploi) {

    const { error } = await supabaseClient
    .from('offre_emploi')
    .delete()
    .eq('id_offre_emploi', id_offre_emploi);

    console.log("Offre retirée :", id_offre_emploi);

    get_mes_offres();
}

async function chercheur_aime_offre(id_offre_emploi) {

    const { data, error } = await supabaseClient
        .from('chercheur_aime_offre')
        .insert([{ id_offre_emploi: id_offre_emploi, id_chercheur_emploi: id_utilisateur }]);

    if (error) {
        if (error.code === '23505') {
            console.log("Le chercheur a déjà aimé cette offre :", id_offre_emploi, " erreur :", error);
        } else {
            console.error(error);
        }
    } else {
        console.log("Chercheur aime offre :", id_offre_emploi, ":", data);
    }
}

async function offre_aime_chercheur(id_chercheur_emploi, id_offre_emploi) {

    const { data, error } = await supabaseClient
        .from('offre_aime_chercheur')
        .insert([{ id_offre_emploi: id_offre_emploi, id_chercheur_emploi: id_chercheur_emploi }]);

    if (error) {
        if (error.code === '23505') {
            console.log("L'offre a déjà été aimée par ce chercheur :", id_offre_emploi, " erreur :", error);
        } else {
            console.error(error);
        }
    } else {
        console.log("Offre aime chercheur : chercheur ", id_chercheur_emploi, ", offre ", id_offre_emploi, ":", data);
    }
}

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

















// --------------------
// --- 2. UI UPDATE ---
// --------------------


function capitalize(text) {
  if (!text) return "";
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

function refresh_nom_utilisateur(nom, prenom) {

    Array.from(document.getElementsByClassName("nom-profil")).forEach(element => {
        element.textContent = `${capitalize(prenom)} ${capitalize(nom)}`;
    });
}

function refresh_photo_profil(public_photo_url) {

    Array.from(document.getElementsByClassName("photo-profil")).forEach(element => {
        element.src = public_photo_url;
    });
}

function refresh_liste_mes_offres(data) {
    ui_liste_mes_offres.textContent = '';
    data.forEach(offre_emploi => {
        add_item_mes_offres(ui_liste_mes_offres, offre_emploi.nom_offre, offre_emploi.id_offre_emploi, true);
    });
}

function add_item_mes_offres(liste, nom, id_offre_emploi) {

    const clone_offre = ui_template_offre.cloneNode(true);
    clone_offre.id = '';
    clone_offre.childNodes[1].childNodes[1].textContent = `${nom}`;
    clone_offre.childNodes[1].childNodes[3].textContent = `12 matchs en cours`; //TODO : mettre le nombre de matchs réels
    clone_offre.setAttribute("id_offre_emploi", id_offre_emploi);


    clone_offre.classList.remove('hidden');
    clone_offre.childNodes[3].childNodes[1].classList.remove('hidden');
    clone_offre.childNodes[3].childNodes[3].classList.remove('hidden');
    
    clone_offre.childNodes[3].childNodes[3].addEventListener('click', async () => {
        delete_offre_emploi(id_offre_emploi);
    });


    liste.appendChild(clone_offre);
};


















// ---------------------------
// --- 2. HANDLERS BOUTONS ---
// ---------------------------


function handle_bouton_ajouter_offre () {

    const nom_offre = document.getElementById('input-titre-offre').value;
    add_offre_emploi(nom_offre, refresh=true);

    allerA('p-offres')
}

function proposition_aimee() {
    //TODO : animation de like ou d'enregistrement en bas sur la nav bar, notif en cas de match ailleur
    // + charger l'offre suivante

    if (type_utilisateur === TYPE_UTILISATEUR.CHERCHEUR) {
        chercheur_aime_offre(id_offre_proposee_swipe);
    } else if (type_utilisateur === TYPE_UTILISATEUR.EMPLOYEUR) {
        offre_aime_chercheur(id_chercheur_propose_swipe, id_offre_emploi_actuelle);
    } else {
        console.error("Type d'utilisateur inconnu :", type_utilisateur);
    }
}
















// --------------------------
// --- 2. NOTIF ANIMATION ---
// --------------------------

function afficher_notification(text, duration = notification_default_duration) {
  const notif = document.getElementById("notification");

  notif.textContent = text;

  // reset classes
  notif.classList.remove("hide");
  notif.classList.add("show");

  // disparition après duration ms
  setTimeout(() => {
    notif.classList.remove("show");
    notif.classList.add("hide");
  }, duration);
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

    console.log(swipe_direction === "droite" ? "Swipe droite" : "Swipe gauche");
    
    if (swipe_direction === "droite") {
        proposition_aimee();
    }
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
