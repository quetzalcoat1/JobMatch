




let supabaseClient;


//données utilisateur
let prenom_utilisateur;
let nom_utilisateur;

let id_utilisateur = 2;
let id_offre_emploi_actuelle = null;

//UI :

//listes
let liste_offre_emploi;
let liste_mes_offres;
let template_offre;

//boutons
let bouton_ajouter_offre_emploi;
let bouton_changer_id_utilisateur;

//menus
let default_menu_id = 2;
let current_menu_id = default_menu_id;
let menu_button_list;
let menu_list = [];









//INITIALISATION


window.onload = () => {
    
    prenom_utilisateur = document.getElementById('prenom_utilisateur');
    nom_utilisateur = document.getElementById('nom_utilisateur');
    
    bouton_ajouter_offre_emploi = document.getElementById('bouton_ajouter_offre');
    liste_offre_emploi = document.getElementById('liste_offre_emploi');
    liste_mes_offres = document.getElementById('liste_mes_offres');
    template_offre = document.getElementById('template_offre');

    bouton_changer_id_utilisateur = document.getElementById('button_id_utilisateur');

    bouton_ajouter_offre_emploi.addEventListener('click', async () => handle_bouton_ajouter_offre_emploi());

    bouton_changer_id_utilisateur.addEventListener('click', async () => {
        id_utilisateur = parseInt(document.getElementById('input_id_utilisateur').value);
        get_all();
    });
    

    // MENUS
    menu_list_unsorted = Array.from(document.getElementsByClassName('menu'));

    menu_list_unsorted.forEach(menu_object => {
        menu_list[menu_object.getAttribute("menu_id")] = menu_object;
    });

    //class="menu" menu_id="0"

    menu_button_list = document.getElementById('navbar').children;
    for (let i = 0; i < menu_button_list.length; i++) {
        let button = menu_button_list[i];
        let button_menu_id = button.getAttribute("menu_id");
        button.addEventListener('click', async () => {
            display_menu(button_menu_id);
        });
    }

    display_menu(default_menu_id);
    
    // URL et clé publique (anon key) depuis Supabase Dashboard
    const SUPABASE_URL = "https://yxyzcmzjezaechwirlau.supabase.co";                // URL du projet
    const SUPABASE_ANON_KEY = "sb_publishable_mrOPsTPNmHR9jwqUcVrJ-Q_pq-y95sI";     // clé publique

    // Crée le client Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    get_all();












    const cards = document.querySelectorAll('.card');
    const button = document.getElementById('bouton_creer_compte');
    const input_entreprise = document.getElementById('input_entreprise');
    const label_input_entreprise = document.getElementById('label_input_entreprise');
    console.log(button);

    let selectedRole = null;

    cards.forEach(card => {
    card.addEventListener('click', () => {
        // reset selection
        cards.forEach(c => c.classList.remove('selected'));

        // select clicked
        card.classList.add('selected');
        selectedRole = card.dataset.role;

        // show input entreprise if employeur
        if (selectedRole == 'employeur') {
            input_entreprise.classList.remove('hidden');
            label_input_entreprise.classList.remove('hidden');
        } else {
            input_entreprise.classList.add('hidden');
            label_input_entreprise.classList.add('hidden');
        }
        console.log("Rôle choisi :", selectedRole);
        // enable button
        button.disabled = false;
    });
    });

    button.addEventListener('click', handle_bouton_creer_compte);
























};

function get_all() {
    get_nom_utilisateur();
    get_offre_emploi();
    get_mes_offres();
    get_photo_profil();
}























//MENU

function display_menu(menu_id) {
    
    current_menu_id = menu_id;
    //console.log(menu_list);
    for (let i = 0; i < menu_list.length; i++) {
        if (menu_list[i] != null) {
            menu_list[i].classList.add('hidden');
        }
        if (menu_button_list[i] != null) {
            menu_button_list[i].classList.add('inactive');
        }
    }
    if (menu_list[menu_id] != null) {
        menu_list[menu_id].classList.remove('hidden');
    }
    if (menu_button_list[menu_id] != null) {
        menu_button_list[menu_id].classList.remove('inactive');
    }
}
















// DB REQUESTS

async function get_photo_profil() {

    const { data, error } = await supabaseClient
        .from('utilisateur')
        .select('url_photo_profil')
        .eq('id_utilisateur', id_utilisateur)
        .single();
    if (data == null) {
        throw new Error("Impossible de récupérer l'url de la photo de profil de l'utilisateur");
    }
    let local_photo_url = data.url_photo_profil;

    if(local_photo_url) {
        
        const { data: publicData, error: publicError } = supabaseClient.storage
        .from('photo_profil')
        .getPublicUrl(local_photo_url);
        if (publicData == null) {
            throw new Error("Impossible de récupérer la photo de profil de l'utilisateur");
        }
        let public_photo_url = publicData.publicUrl;
        refresh_photo_profil(public_photo_url);
    }
    else {
        refresh_photo_profil();
    }
}

/*
pour input une image :

const { data, error } = await supabase
.storage
.from('photo_profil')
.upload('professional-young-man-stockcake.webp', file); // file = File object depuis input
*/



async function get_nom_utilisateur() {
    const { data, error } = await supabaseClient
    .from('utilisateur')
    .select('*')
    .eq('id_utilisateur', id_utilisateur);

    if (data == null) {
        throw new Error("Impossible de récupérer le nom de l'utilisateur");
    }

    refresh_nom_utilisateur(data[0].nom, data[0].prenom);
}


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

    if (data == null) {
        throw new Error("Impossible de récupérer les offres de l'utilisateur");
    }

    refresh_liste_mes_offres(data);
}

async function get_offre_emploi() {
    const { data, error } = await supabaseClient
    .from('offre_emploi')
    .select(`
    *,
    employeur!inner(
        id_employeur,
        entreprise!inner(nom_entreprise)
    )
    `)
    .neq('id_employeur', id_utilisateur);

    if (data == null) {
        throw new Error("Impossible de récupérer les offres générales");
    }

    refresh_liste_offre_emploi(data);
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

    get_mes_offres();
}
















//REFRESH UI

function refresh_photo_profil(public_photo_url) {
    if (public_photo_url) {
        document.getElementById('photo_profil').src = public_photo_url;
    }
    else {
        document.getElementById('photo_profil').src = "";
    }
}

function refresh_nom_utilisateur(nom, prenom) {
    prenom_utilisateur.textContent = `${prenom}`;
    nom_utilisateur.textContent = `${nom}`;
}

function refresh_liste_offre_emploi(data) {
    liste_offre_emploi.textContent = '';
    data.forEach(offre_emploi => {
        add_item_offre_emploi_to(liste_offre_emploi, offre_emploi.employeur.entreprise.nom_entreprise, offre_emploi.nom_offre, offre_emploi.id_offre_emploi);
    });
}

function refresh_liste_mes_offres(data) {
    liste_mes_offres.textContent = '';
    data.forEach(offre_emploi => {
        add_item_offre_emploi_to(liste_mes_offres, offre_emploi.employeur.entreprise.nom_entreprise, offre_emploi.nom_offre, offre_emploi.id_offre_emploi, true);
    });
}

function add_item_offre_emploi_to(liste, entreprise = "", nom, id_offre_emploi, mon_offre = false) {

    const clone_offre = template_offre.cloneNode(true);
    clone_offre.id = '';
    clone_offre.childNodes[1].childNodes[1].textContent = `${nom}`;
    clone_offre.childNodes[1].childNodes[3].textContent = `${entreprise}`;
    clone_offre.setAttribute("id_offre_emploi", id_offre_emploi);

    if (mon_offre) {
        clone_offre.childNodes[3].classList.remove('hidden');
        
        clone_offre.childNodes[3].addEventListener('click', async () => {
            delete_offre_emploi(id_offre_emploi);
        });
    }

    liste.appendChild(clone_offre);
};

















//BUTTON HANDLERS

function capitalize(text) {
  if (!text) return "";
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}

function handle_bouton_ajouter_offre_emploi () {

    const nom_offre = document.getElementById('input_nom_offre').value;
    //const nom_employeur = document.getElementById('input_nom_employeur').value; plus besoin dcp ? car chaque employeur a une seule entreprise
    add_offre_emploi(nom_offre, refresh=true);
}


async function handle_bouton_creer_compte() {

    const prenom = capitalize(document.getElementById('input_prenom_utilisateur').value);
    const nom = capitalize(document.getElementById('input_nom_utilisateur').value);
    const email = document.getElementById('input_email_utilisateur').value;

    const selectedCard = document.querySelector('.card.selected');
    const role = selectedCard ? selectedCard.dataset.role : null;

    // vérifie que les champs sont remplis
    if (!prenom || !nom || !email || !role) {
        console.log("Champ(s) manquant(s)");
        return;
    }
    if (role == "employeur") {
        const entreprise = document.getElementById('input_entreprise').value;
        if (!entreprise) {
            console.log("Entreprise manquante");
            return;
        }
    }



    // création ligne utilisateur
    const { data: dataUser, error: errorUser } = await supabaseClient
        .from('utilisateur')
        .insert([
            {
                prenom: prenom,
                nom: nom,
                email: email,
                type: role,
            }
        ])
        .select();

    if (errorUser) {
        console.error("Erreur création compte utilisateur :", errorUser);
        return;
    }

    console.log("Compte créé :", dataUser);

    //récupérer id utilisateur
    console.log("ID du nouvel utilisateur :", dataUser[0].id_utilisateur);
    id_utilisateur = dataUser[0].id_utilisateur;



    // création ligne employeur ou chercheur d'emploi
    if (role == "employeur") {
        console.log("Créer compte employeur");
        const { data, error } = await supabaseClient
        .from('employeur')
        .insert([
            {
                id_employeur: id_utilisateur,
                //id_entreprise: entreprise, //lier nom entreprise et son id
            }
        ])
        .select();
        if (error) {
            console.error("Erreur création compte employeur :", error);
            return;
        }
        console.log(data);
    }
    else if (role == "chercheur") {
        console.log("Créer compte chercheur d'emploi");
        const { data, error } = await supabaseClient
        .from('chercheur_emploi')
        .insert([
            {
                id_chercheur_emploi: id_utilisateur,
            }
        ])
        .select();
        if (error) {
            console.error("Erreur création compte chercheur d'emploi :", error);
            return;
        }
        console.log(data);
    }



    display_menu(0);
    get_all();
}








async function handle_aimer_offre(id_offre_emploi) {

    const { data, error } = await supabaseClient
    .from('chercheur_aime_offre')
    .insert([
        {
            id_chercheur_emploi: id_utilisateur,
            id_offre_emploi: id_offre_emploi,
        }
    ])
    .select();
    if (error) {
        console.error("Erreur like d'une offre :", error);
        return;
    }
}




async function handle_aimer_chercheur(id_chercheur_emploi) {

    //id_offre_emploi_actuelle est l'offre actuelle de l'employeur pour laquelle il cherche des candidats

    const { data, error } = await supabaseClient
    .from('chercheur_aime_offre')
    .insert([
        {
            id_chercheur_emploi: id_chercheur_emploi,
            id_offre_emploi: id_offre_emploi_actuelle,
        }
    ])
    .select();
    if (error) {
        console.error("Erreur like d'une offre :", error);
        return;
    }
}

