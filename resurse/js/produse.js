window.onload = function () {
    const btn = document.getElementById("filtrare");
 btn.onclick = function () {
    if (!validareInputuri()) {
        return;
    }

    let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();

    let vectRadio = document.getElementsByName("gr_rad");
    let inpCalorii = null;
    let minCalorii = null;
    let maxCalorii = null;
    for (let rad of vectRadio) {
        if (rad.checked) {
            inpCalorii = rad.value;
            if (inpCalorii != "toate") {
                [minCalorii, maxCalorii] = inpCalorii.split(":");
                minCalorii = parseInt(minCalorii);
                maxCalorii = parseInt(maxCalorii);
            }
            break;
        }
    }

    let inpPret = document.getElementById("inp-pret").value;
    let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();

    // Condiții suplimentare
    let inpAlergeni = document.getElementById("inp-alergeni").value.trim().toLowerCase();
    let alergeniEvitat = inpAlergeni ? inpAlergeni.split(",").map(a => a.trim()) : [];

    let selectMultiplu = Array.from(document.getElementById("inp-select-multiplu").selectedOptions).map(opt => opt.value);
    let observatii = document.getElementById("inp-observatii").value.trim().toLowerCase();

    let produse = document.getElementsByClassName("produs");
    for (let prod of produse) {
        prod.style.display = "none";

        let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
        let cond1 = nume.startsWith(inpNume);

        let calorii = parseInt(prod.getElementsByClassName("val-calorii")[0].innerHTML.trim());
        let cond2 = (inpCalorii == "toate" || (minCalorii <= calorii && calorii < maxCalorii));

        let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
        let cond3 = (inpPret <= pret);

        let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
        let cond4 = (inpCategorie == "toate" || inpCategorie == categorie);

        
        let ingrediente = prod.getElementsByClassName("val-ingrediente")[0]?.innerHTML.trim().toLowerCase() || "";
        let contineAlergen = alergeniEvitat.some(alergen => ingrediente.includes(alergen));

        let eticheteProdus = prod.getAttribute("data-etichete")?.toLowerCase().split(",") || [];
        let descriereProdus = prod.getElementsByClassName("val-descriere")[0]?.innerHTML.trim().toLowerCase() || "";

        let cond5 = selectMultiplu.length == 0 || selectMultiplu.every(et => eticheteProdus.includes(et));
        let cond6 = !observatii || descriereProdus.includes(observatii);

        if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && !contineAlergen) {
            prod.style.display = "block";
        }
    }
};














    document.getElementById("inp-pret").onchange = function () {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    };

    document.getElementById("resetare").onclick = function () {
        if (!confirm("Sigur vrei să resetezi toate filtrele?")) return;

    
        document.getElementById("inp-nume").value = "";
        document.getElementById("i_rad4").checked = true;  
        document.getElementById("inp-pret").value = 0;
        document.getElementById("infoRange").innerHTML = "(0)";
        document.getElementById("inp-categorie").value = "toate";
        
        document.getElementById("inp-select-multiplu").selectedIndex = -1;
        document.getElementById("inp-observatii").value = "";

        
        let produse = document.getElementsByClassName("produs");
        for (let prod of produse) {
            prod.style.display = "block";
        }

        
        let container = produse[0].parentNode;
        for (let prod of Array.from(produse)) {
            container.appendChild(prod);
        }
    };

    document.getElementById("sortCrescNume").onclick = function () {
        sorteaza(1);
    };

    document.getElementById("sortDescrescNume").onclick = function () {
        sorteaza(-1);
    };

    function sorteaza(semn) {
        let produse = document.getElementsByClassName("produs");
        let vProduse = Array.from(produse);

        vProduse.sort(function (a, b) {
            
            let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            return semn * numeA.localeCompare(numeB);
        });

        for (let prod of vProduse) {
            prod.parentNode.appendChild(prod);
        }
    }
};

window.onkeydown = function (e) {
    if (e.key == "c" && e.altKey) {
        let produse = document.getElementsByClassName("produs");
        let sumaPreturi = 0;

        for (let prod of produse) {
            if (prod.style.display != "none") {
                let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
                sumaPreturi += pret;
            }
        }

        if (!document.getElementById("suma_preturi")) {
            let pRezultat = document.createElement("p");
            pRezultat.innerHTML = `Suma: ${sumaPreturi.toFixed(2)} lei`;
            pRezultat.id = "suma_preturi";

            let p = document.getElementById("p-suma");
            p.parentNode.insertBefore(pRezultat, p.nextElementSibling);

            setTimeout(function () {
                let p1 = document.getElementById("suma_preturi");
                if (p1) {
                    p1.remove();
                }
            }, 2000);
        }
    }
};


function validareInputuri() {
    // 1. Verifică numele să nu conțină cifre
    let inpNume = document.getElementById("inp-nume");
    if (/\d/.test(inpNume.value.trim())) {
        alert("Numele nu poate conține cifre!");
        inpNume.focus();
        return false;
    }

  

    // 3. Verifică să fie selectat un radio din grupul gr_rad
    let vectRadio = document.getElementsByName("gr_rad");
    if (![...vectRadio].some(r => r.checked)) {
        alert("Selectați o opțiune pentru calorii!");
        return false;
    }

    // Dacă ai și alte inputuri de validat, le adaugi aici

    return true; // toate validate corect
}

