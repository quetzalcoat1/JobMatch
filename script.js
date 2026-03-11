
let supabaseClient;

let bouton_ajouter_offre_emploi;
let liste_offre_emploi;
let liste_mes_offres;
let template_offre;

let prenom_utilisateur;
let nom_utilisateur;

let id_utilisateur = 2;
let bouton_changer_id_utilisateur;

let menu = 0;
let menu_button_list;
let menu_list = [];

window.onload = () => {
    
    prenom_utilisateur = document.getElementById('prenom_utilisateur');
    nom_utilisateur = document.getElementById('nom_utilisateur');
    
    bouton_ajouter_offre_emploi = document.getElementById('bouton_ajouter_offre');
    liste_offre_emploi = document.getElementById('liste_offre_emploi');
    liste_mes_offres = document.getElementById('liste_mes_offres');
    template_offre = document.getElementById('template_offre');

    bouton_changer_id_utilisateur = document.getElementById('button_id_utilisateur');

    bouton_ajouter_offre_emploi.addEventListener('click', async () => {
        
        const nom_offre = document.getElementById('input_nom_offre').value;
        const nom_employeur = document.getElementById('input_nom_employeur').value;

        const { data, error } = await supabaseClient
            .from('offre_emploi')
            .insert([{ nom: nom_offre, id_employeur: nom_employeur, id_createur: id_utilisateur }]);

        if (error) {
            console.error(error);
        } else {
            console.log("Offre ajoutée :", data);
            get_mes_offres(); // afficher directement
        }
    });

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
        button = menu_button_list[i];
        let button_menu_id = button.getAttribute("menu_id");
        button.addEventListener('click', async () => {
            menu = button_menu_id;
            display_menu(menu);
        });
    }

    display_menu(0);
    
    // Récupère ton URL et ta clé publique (anon key) depuis Supabase Dashboard
    const SUPABASE_URL = "https://yxyzcmzjezaechwirlau.supabase.co";   // ton URL de projet
    const SUPABASE_ANON_KEY = "sb_publishable_mrOPsTPNmHR9jwqUcVrJ-Q_pq-y95sI";               // ta clé publique

    // Crée le client Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    get_all();

};

function display_menu(menu_id) {
    
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

function get_all() {
    get_nom_utilisateur();
    get_offre_emploi();
    get_mes_offres();
    get_photo_profil();
}

async function get_photo_profil() {

    const { data, error } = await supabaseClient
        .from('utilisateur')
        .select('url_photo_profil')
        .eq('id_utilisateur', id_utilisateur)
        .single();
    let local_photo_url = data.url_photo_profil;

    if(local_photo_url) {
        
        const { data: publicData, error: publicError } = supabaseClient.storage
        .from('photo_profil')
        .getPublicUrl(local_photo_url);

        let public_photo_url = publicData.publicUrl;
        refresh_photo_profil(public_photo_url);
    }
    else {
        refresh_photo_profil();
    }
}

async function refresh_photo_profil(public_photo_url) {
    if (public_photo_url) {
        document.getElementById('photo_profil').src = public_photo_url;
    }
    else {
        document.getElementById('photo_profil').src = "";
    }
}

/*
INPUT l image

const { data, error } = await supabase
.storage
.from('photo_profil')
.upload('professional-young-man-stockcake.webp', file); // file = File object depuis input */





async function get_nom_utilisateur() {
    const { data, error } = await supabaseClient
    .from('utilisateur')
    .select('*')
    .eq('id_utilisateur', id_utilisateur);

    refresh_nom_utilisateur(data[0].nom, data[0].prenom);
}

function refresh_nom_utilisateur(nom, prenom) {
    prenom_utilisateur.textContent = `${prenom}`;
    nom_utilisateur.textContent = `${nom}`;
}

async function get_mes_offres() {
    const { data, error } = await supabaseClient
    .from('offre_emploi')
    .select('*,employeur!inner(nom) as nom_employeur')
    .eq('id_createur', id_utilisateur);

    refresh_liste_mes_offres(data);
}

async function get_offre_emploi() {
    const { data, error } = await supabaseClient
    .from('offre_emploi')
    .select('*,employeur!inner(nom) as nom_employeur')
    .neq('id_createur', id_utilisateur);

    //console.log(data);
    //console.log(error);
    refresh_liste_offre_emploi(data);
}

function refresh_liste_offre_emploi(data) {
    liste_offre_emploi.textContent = '';
    data.forEach(offre_emploi => {
        add_item_offre_emploi_to(liste_offre_emploi, offre_emploi.employeur.nom, offre_emploi.nom, offre_emploi.id_offre_emploi);
    });
}

function refresh_liste_mes_offres(data) {
    liste_mes_offres.textContent = '';
    data.forEach(offre_emploi => {
        add_item_offre_emploi_to(liste_mes_offres, offre_emploi.employeur.nom, offre_emploi.nom, offre_emploi.id_offre_emploi, true);
    });
}

function add_item_offre_emploi_to(liste, entreprise = "", nom, id_offre_emploi, son_offre = false) {

    const clone_offre = template_offre.cloneNode(true);
    clone_offre.id = '';
    clone_offre.childNodes[1].childNodes[1].textContent = `${nom}`;
    clone_offre.childNodes[1].childNodes[3].textContent = `${entreprise}`;
    clone_offre.setAttribute("id_offre_emploi", id_offre_emploi);

    if (son_offre) {
        clone_offre.childNodes[3].classList.remove('hidden');
        
        clone_offre.childNodes[3].addEventListener('click', async () => {
            delete_offre_emploi(id_offre_emploi);
        });
    }

    liste.appendChild(clone_offre);
};

async function delete_offre_emploi(id_offre_emploi) {

    const { error } = await supabaseClient
    .from('offre_emploi')
    .delete()
    .eq('id_offre_emploi', id_offre_emploi);

    get_mes_offres();
}



//🗑️
