window.addEventListener("load", () => {
    const body = document.body;
    const toggle = document.getElementById("toggleTema");
    const icon = document.getElementById("temaIcon");

    let tema = localStorage.getItem("tema");
    if (tema === "dark") {
        body.classList.add("dark");
        toggle.checked = true;
        icon.classList.replace("fa-sun", "fa-moon");
    }

    toggle.addEventListener("change", () => {
        body.classList.toggle("dark");
        const isDark = body.classList.contains("dark");
        localStorage.setItem("tema", isDark ? "dark" : "");
        icon.classList.replace(isDark ? "fa-sun" : "fa-moon", isDark ? "fa-moon" : "fa-sun");
    });
});


let tema = localStorage.getItem("tema");
if (tema) {
    body.classList.add(tema);
    if (tema === "dark") icon.classList.replace("fa-sun", "fa-moon");
}


////partea de calculare 