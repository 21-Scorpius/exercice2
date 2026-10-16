var listeProduit = [];
var panier = new Array();
const TAUX_TVA = 0.19;

// Charger les produits depuis produits.json
/*function chargerZoneItem() {
    const xhr = new XMLHttpRequest();
    const url = "produits.json";
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var reponse = xhr.responseText;
                var objJSON = JSON.parse(reponse);
                listeProduit = objJSON.liste;
                afficherListeProduits();
            } else {
                alert(
                    "Erreur lors de la récupération des données (Status "+ xhr.status + ")"
                );
            }
        }
    };
    xhr.send();
}*/


// Charger les produits depuis produits.json avec Async/Await
async function chargerZoneItem() {
    try {
        const response = await fetch("produits.json");
        if(!response.ok) {
            throw new Error("Erreur  (Status " + response.status + ")");
        }
        const data = await response.json();
        listeProduit = data.liste;
        afficherListeProduits();
    } catch (error) {
        alert(error.message);
    }
}

// Afficher les produits
function afficherListeProduits() {
    var zone = document.getElementById("zoneContenuItem");
    zone.innerHTML = "";

    listeProduit.forEach(function (produit, index) {
        var div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
            <h3>${produit.description}</h3>
            <img src="${produit.image}" alt="${produit.description}" width="150">
            <p>${produit.details}</p>
            <p>Prix : ${produit.prix} DT</p>
        `;

        var bouton = document.createElement("div");
        bouton.className = "ajouter";
        bouton.textContent = "Ajouter au panier";

        bouton.addEventListener("click", function () {
            var ligneCommande = {produit : produit, quantite : "1"};
            ajouterItem(ligneCommande);
        });

        div.appendChild(bouton);
        zone.appendChild(div);
    });
}

function ajouterItem(ligneCommande){
    panier.push(ligneCommande);
    var quantite = ligneCommande.quantite;
    var nbitempannier = document.getElementById("idItem").innerHTML;
    nbitempannier = parseInt(nbitempannier) + parseInt(quantite);
    document.getElementById("idItem").innerHTML = nbitempannier;
}

// Afficher la facture
function afficheFacture() {
    document.getElementById("zoneContenuItem").style.display = "none";

    document.getElementById("zoneContenuFacture").style.display = "block";
    document.getElementById("zoneContenuFacture").style.height = "85%";

    var sousTotal = 0;

    var noeudTBody = document.querySelector("#corpsTableau");
    noeudTBody.innerHTML = "";

    panier.forEach(function(ligneCommande, index) {
        var nomDeProduit = ligneCommande.produit.description;
        var quantite = parseInt(ligneCommande.quantite);
        var prix = parseFloat(ligneCommande.produit.prix);

        sousTotal += quantite * prix;

        var noeudTr = document.createElement("tr");

        // Description du produit
        var noeudTd1 = document.createElement("td");
        var contenuTd1 = document.createTextNode(nomDeProduit);

        noeudTd1.appendChild(contenuTd1);
        noeudTr.appendChild(noeudTd1);

        // Quantité modifiable
        var noeudTd2 = document.createElement("td");
        var noeudInput = document.createElement("input");

        noeudInput.setAttribute("type", "number");
        noeudInput.setAttribute("min", "1");
        noeudInput.setAttribute("value", quantite);

        noeudInput.addEventListener("change", function() {
            var nouvelleQte = parseInt(this.value);

            if (!Number.isInteger(nouvelleQte) || nouvelleQte < 1) {
                this.value = panier[index].quantite;
                return;
            }

            panier[index].quantite = nouvelleQte.toString();

            // Mettre à jour le nombre total d'articles
            var nbArticles = 0;

            panier.forEach(function(article) {
                nbArticles += parseInt(article.quantite);
            });

            document.getElementById("idItem").innerHTML = nbArticles;

            // Recalculer la facture
            afficheFacture();
        });

        noeudTd2.appendChild(noeudInput);
        noeudTr.appendChild(noeudTd2);

        // Prix unitaire
        var noeudTd3 = document.createElement("td");
        var contenuTd3 = document.createTextNode(prix.toFixed(2) + " DT");

        noeudTd3.appendChild(contenuTd3);
        noeudTr.appendChild(noeudTd3);

        noeudTBody.appendChild(noeudTr);
    });

    // Calcul de la TVA et du total TTC
    var totalTVA = sousTotal * TAUX_TVA;
    var total = sousTotal + totalTVA;

    document.getElementById("idSousTotal").innerHTML =sousTotal.toFixed(2) + " DT";

    document.getElementById("idTVA").innerHTML = totalTVA.toFixed(2) + " DT";

    document.getElementById("idTotal").innerHTML =total.toFixed(2) + " DT";
}


// Afficher la facture lors du clic sur le panier
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("panier").addEventListener("click", function() {
        afficheFacture();
    });
});