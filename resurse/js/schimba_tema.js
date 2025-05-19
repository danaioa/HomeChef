// window.addEventListener("DOMContentLoaded", function() {    
//     document.getElementById("schimba_tema").onClick("click", function() {
//         if(document.body.classList.contains("dark-theme")) {
//             document.body.classList.toggle("dark");
//             localStorage.setItem("tema", "dark");
//         }

//         else {
//              localStorage.removeItem("tema");
//         }
//     }

// })


// window.addEventListener("DOMContentLoaded", function(){
//     document.getElementById("schimba_tema").onclick=function(){
//         if(document.body.classList.toggle("dark")){
//             localStorage.setItem("tema","dark")
//         }
//         else{
//             localStorage.removeItem("tema")
//         }
//     }
// })


// window.addEventListener("DOMContentLoaded", function() {
//     if (localStorage.getItem("tema") === "dark") {
//         document.body.classList.add("dark");
//     }

//     document.getElementById("schimba_tema").onclick = function() {
//         if (document.body.classList.toggle("dark")) {
//             localStorage.setItem("tema", "dark");
//         } else {
//             localStorage.removeItem("tema");
//         }
//     };
// });

// console.log("JS încărcat și funcțional!");



window.addEventListener("DOMContentLoaded", function() {
    // Setează tema dacă e salvată
    if (localStorage.getItem("tema") === "dark") {
        document.body.classList.add("dark");
        document.getElementById("icon_tema").className = "fa-solid fa-moon";
    }

    // Schimbă tema la click pe buton
    document.getElementById("schimba_tema").onclick = function() {
        document.body.classList.toggle("dark");
        
        if (document.body.classList.contains("dark")) {
            localStorage.setItem("tema", "dark");
            document.getElementById("icon_tema").className = "fa-solid fa-moon";
        } else {
            localStorage.setItem("tema", "light");
            document.getElementById("icon_tema").className = "fa-solid fa-sun";
        }
    };
});


///insert ptrebuie sa fc la etapa 7 


///data ultimei accesarari