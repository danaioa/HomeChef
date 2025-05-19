document.addEventListener("DOMContentLoaded", () => {
    fetch("/resurse/json/oferte.json")
        .then(response => response.json())
        .then(data => {
            const oferta = data.oferte[0];
            const tipPreparate = oferta["tipuri_preparate"];
            const reducere = oferta["reducere"];
            const dataFinalizare = new Date(oferta["data-finalizare"]);
            
            document.getElementById("tip-preparat").textContent = `Tipuri preparate: ${tipPreparate}`;
            document.getElementById("reducere").textContent = `Reducere: ${reducere}%`;
            updateTimer(dataFinalizare);
            
            // Porneste timer-ul
            setInterval(() => updateTimer(dataFinalizare), 1000);
        })
        .catch(error => console.error("Eroare la preluarea ofertelor:", error));
});

function updateTimer(dataFinalizare) {
    const now = new Date();
    const timpRamas = dataFinalizare - now;
    const sectiuneOferta = document.getElementById("sectiune-oferta");

    if (timpRamas <= 0) {
        sectiuneOferta.style.display = "none";
        return;
    }

    const secunde = Math.floor((timpRamas / 1000) % 60);
    const minute = Math.floor((timpRamas / 1000 / 60) % 60);
    const ore = Math.floor((timpRamas / 1000 / 60 / 60));

    const timer = `${ore} ore ${minute} minute ${secunde} secunde`;
    const timerElem = document.getElementById("timp-ramas");

    timerElem.textContent = `Timp ramas: ${timer}`;

    if (timpRamas <= 10000) {
        sectiuneOferta.style.backgroundColor = "#ff6666"; // Schimbare culoare pentru ultimele 10 secunde
    } else {
        sectiuneOferta.style.backgroundColor = "white";
    }
}
