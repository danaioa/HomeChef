window.addEventListener("load", () => {
    const body = document.body;
    const btn = document.getElementById("toggleTema");
    const icon = btn.querySelector("i");

    // Setează tema la încărcare
    let tema = localStorage.getItem("tema");
    if (tema) {
        body.classList.add(tema);
        if (tema === "dark") icon.classList.replace("fa-sun", "fa-moon");
    }

    // Schimbă tema la click
    btn.addEventListener("click", () => {
        body.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            localStorage.setItem("tema", "dark");
            icon.classList.replace("fa-sun", "fa-moon");
        } else {
            localStorage.removeItem("tema");
            icon.classList.replace("fa-moon", "fa-sun");
        }
    });
});


let tema = localStorage.getItem("tema");
if (tema) {
    body.classList.add(tema);
    if (tema === "dark") icon.classList.replace("fa-sun", "fa-moon");
}
