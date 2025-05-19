window.onload = function () {
    const btn = document.getElementById("filtrare");
    btn.onclick = function () {

        if (!validareInputuri()) {
        // Dacă validarea nu trece, oprește filtrarea
        return;
    }
    let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();

    let vectRadio = document.getElementsByName("gr_rad");

    let inpAlergeni = document.getElementById("inp-alergeni").value.trim().toLowerCase();
    let alergeniEvitat = inpAlergeni ? inpAlergeni.split(",").map(a => a.trim()) : [];

    let inpCalorii = null;
    let minCalorii = null;
    let maxCalorii = null;

    for (let rad of vectRadio) {
        if (rad.checked) {
            inpCalorii = rad.value;
            if (rad.value != "toate") {
                [minCalorii, maxCalorii] = inpCalorii.split(":");
                minCalorii = parseFloat(minCalorii);
                maxCalorii = parseFloat(maxCalorii);
            }
            break;
        }
    }

    let inpPret = parseFloat(document.getElementById("inp-pret").value.trim());

    let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();

    let produse = document.getElementsByClassName("produs");

    for (let prod of produse) {
        prod.style.display = "none";

        let ingrediente = prod.getElementsByClassName("val-ingrediente")[0].innerHTML.trim().toLowerCase();

        let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
        let calorii = parseFloat(prod.getElementsByClassName("val-calorii")[0].innerHTML.trim());
        let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim());
        let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase();
        let contineAlergen = alergeniEvitat.some(alergen => ingrediente.includes(alergen));

        let cond1 = nume.startsWith(inpNume);
        let cond2 = (!inpCalorii || inpCalorii == "toate" || (minCalorii <= calorii && calorii < maxCalorii));
        let cond3 = (pret >= inpPret);
        let cond4 = (inpCategorie == "toate" || inpCategorie == categorie);

        if (cond1 && cond2 && cond3 && cond4 && !contineAlergen) {
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
        document.getElementById("i_rad4").checked = true;  // presupun că i_rad4 este radio pentru calorii "toate"
        document.getElementById("inp-pret").value = 0;
        document.getElementById("infoRange").innerHTML = "(0)";
        document.getElementById("inp-categorie").value = "toate";

        
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
            let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim());
            let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim());

            if (pretA != pretB) {
                return semn * (pretA - pretB);
            }

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

