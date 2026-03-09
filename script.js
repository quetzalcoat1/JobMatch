
let btn;
let list;
let supabaseClient;

window.onload = () => {
    
    btn = document.getElementById('addBtn');
    list = document.getElementById('liste_offre_emploi');
    let count = 1;

    btn.addEventListener('click', () => {
        const li = document.createElement('li');
        li.textContent = `Élément ${count}`;
        li.classList.add("item_offre_emploi")
        list.appendChild(li);
        count++;
    });



      // Récupère ton URL et ta clé publique (anon key) depuis Supabase Dashboard
    const SUPABASE_URL = "https://yxyzcmzjezaechwirlau.supabase.co";   // ton URL de projet
    const SUPABASE_ANON_KEY = "sb_publishable_mrOPsTPNmHR9jwqUcVrJ-Q_pq-y95sI";               // ta clé publique

    // Crée le client Supabase
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    get_offre_emploi();

};



async function get_offre_emploi() {
    const { data, error } = await supabaseClient
    .from('offre_emploi')
    .select('*,employeur!inner(nom) as nom_employeur');

    //console.log(data);
    //console.log(error);
    refresh_liste_offre_emploi(data)
}

function refresh_liste_offre_emploi(data) {
    data.forEach(offre_emploi => {
        add_item_offre_emploi(offre_emploi.employeur.nom, offre_emploi.nom);
    });
}

function add_item_offre_emploi(entreprise = "", nom) {

    const div = document.createElement('div');
    div.classList.add('item_offre_emploi');
    
    const line1 = document.createElement('p');
    line1.classList.add('item_offre_emploi_top');
    line1.textContent = `${nom}`;
    
    const line2 = document.createElement('p');
    line2.classList.add('item_offre_emploi_bottom');
    line2.textContent = `${entreprise}`;

    div.appendChild(line1);
    div.appendChild(line2);

    list.appendChild(div);

};
