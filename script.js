const TAUX_TVA = 0.19;
let listeProduit = [];
const panier = [];
let elements;

function creerElement(nom, options = {}) {
    const element = document.createElement(nom);

    if (options.id) {
        element.id = options.id;
    }
    if (options.className) {
        element.className = options.className;
    }
    if (options.text !== undefined) {
        element.textContent = options.text;
    }

    return element;
}

function creerLigneTotal(libelle, idValeur) {
    const ligne = creerElement("tr");
    const celluleLibelle = creerElement("td", { text: libelle });
    celluleLibelle.colSpan = 2;
    ligne.append(
        celluleLibelle,
        creerElement("td", { id: idValeur, text: "0.00 DT" })
    );
    return ligne;
}

function creerInterface() {
    const racine = document.getElementById("app");
    const entete = creerElement("header", { id: "entete" });
    const titre = creerElement("h1", { text: "Zone d'entête" });
    const boutonPanier = creerElement("button", { id: "panier" });
    boutonPanier.type = "button";
    boutonPanier.append(
        document.createTextNode("Nbre item : "),
        creerElement("span", { id: "idItem", text: "0" })
    );
    entete.append(titre, boutonPanier);

    const zoneProduits = creerElement("section", {
        id: "zoneContenuItem",
        className: "vue"
    });

    const zoneFacture = creerElement("section", {
        id: "zoneContenuFacture",
        className: "vue"
    });
    zoneFacture.hidden = true;

    const tableau = creerElement("table", { id: "tableauFacture" });
    const enteteTableau = creerElement("thead");
    const ligneEntete = creerElement("tr");
    ["Description", "Quantité", "Prix unitaire"].forEach(function (titreColonne) {
        const cellule = creerElement("th", { text: titreColonne });
        cellule.scope = "col";
        ligneEntete.appendChild(cellule);
    });
    enteteTableau.appendChild(ligneEntete);

    const corpsTableau = creerElement("tbody", { id: "corpsTableau" });
    const piedTableau = creerElement("tfoot");
    piedTableau.append(
        creerLigneTotal("Sous-total HT", "idSousTotal"),
        creerLigneTotal("TVA (19 %)", "idTVA"),
        creerLigneTotal("Total TTC", "idTotal")
    );
    tableau.append(enteteTableau, corpsTableau, piedTableau);

    const boutonContinuer = creerElement("button", {
        id: "continuerAchats",
        text: "Continue Shopping"
    });
    boutonContinuer.type = "button";
    zoneFacture.append(tableau, boutonContinuer);
    racine.replaceChildren(entete, zoneProduits, zoneFacture);

    elements = {
        zoneProduits: zoneProduits,
        zoneFacture: zoneFacture,
        corpsTableau: corpsTableau,
        nombreArticles: document.getElementById("idItem"),
        sousTotal: document.getElementById("idSousTotal"),
        tva: document.getElementById("idTVA"),
        total: document.getElementById("idTotal")
    };

    boutonPanier.addEventListener("click", afficheFacture);
    boutonContinuer.addEventListener("click", afficherProduits);
}

async function chargerZoneItem() {
    try {
        const response = await fetch("produits.json");
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des données (Status " + response.status + ")");
        }
        const data = await response.json();
        listeProduit = data.liste;
        afficherListeProduits();
    } catch (error) {
        alert(error.message);
    }
}

function afficherListeProduits() {
    elements.zoneProduits.replaceChildren();

    listeProduit.forEach(function (produit) {
        const article = creerElement("article", { className: "item" });
        article.appendChild(creerElement("h3", { text: produit.description }));

        const image = creerElement("img");
        image.src = produit.image;
        image.alt = produit.description;
        image.width = 150;
        article.appendChild(image);

        article.appendChild(creerElement("p", { text: produit.details }));
        article.appendChild(creerElement("p", {
            text: "Prix : " + produit.prix + " DT"
        }));

        const boutonAjouter = creerElement("button", {
            className: "ajouter",
            text: "Ajouter au panier"
        });
        boutonAjouter.type = "button";
        boutonAjouter.addEventListener("click", function () {
            ajouterItem({ produit: produit, quantite: 1 });
        });

        article.appendChild(boutonAjouter);
        elements.zoneProduits.appendChild(article);
    });
}

function ajouterItem(ligneCommande) {
    panier.push(ligneCommande);
    mettreAJourNombreArticles();
}

function mettreAJourNombreArticles() {
    const nombre = panier.reduce(function (total, ligne) {
        return total + Number(ligne.quantite);
    }, 0);
    elements.nombreArticles.textContent = nombre;
}

function afficherProduits() {
    elements.zoneFacture.hidden = true;
    elements.zoneProduits.hidden = false;
}

function afficheFacture() {
    elements.zoneProduits.hidden = true;
    elements.zoneFacture.hidden = false;
    elements.corpsTableau.replaceChildren();

    let sousTotal = 0;

    panier.forEach(function (ligneCommande, index) {
        const prix = Number(ligneCommande.produit.prix);
        const quantite = Number(ligneCommande.quantite);
        sousTotal += quantite * prix;

        const ligne = creerElement("tr");
        ligne.appendChild(creerElement("td", {
            text: ligneCommande.produit.description
        }));

        const celluleQuantite = creerElement("td");
        const saisieQuantite = creerElement("input");
        saisieQuantite.type = "number";
        saisieQuantite.min = "1";
        saisieQuantite.value = quantite;
        saisieQuantite.setAttribute(
            "aria-label",
            "Quantité pour " + ligneCommande.produit.description
        );
        saisieQuantite.addEventListener("change", function () {
            const nouvelleQuantite = Number(saisieQuantite.value);
            if (!Number.isInteger(nouvelleQuantite) || nouvelleQuantite < 1) {
                saisieQuantite.value = ligneCommande.quantite;
                return;
            }

            ligneCommande.quantite = nouvelleQuantite;
            mettreAJourNombreArticles();
            afficheFacture();
        });
        celluleQuantite.appendChild(saisieQuantite);
        ligne.appendChild(celluleQuantite);

        ligne.appendChild(creerElement("td", {
            text: prix.toFixed(2) + " DT"
        }));
        elements.corpsTableau.appendChild(ligne);
    });

    const totalTVA = sousTotal * TAUX_TVA;
    elements.sousTotal.textContent = sousTotal.toFixed(2) + " DT";
    elements.tva.textContent = totalTVA.toFixed(2) + " DT";
    elements.total.textContent = (sousTotal + totalTVA).toFixed(2) + " DT";
}

document.addEventListener("DOMContentLoaded", function () {
    creerInterface();
    chargerZoneItem();
});
