const express= require("express");
const path= require("path");
const fs = require("fs");   //sterge sau modifica fisiere
const sharp= require("sharp");
const pg= require("pg");
const sass= require("sass");
const AccesBD = require("./module_proprii/accesbd");
const { table } = require("console");
const moment = require('moment');
//const AccesBD= require("./module_proprii/accesbd.js");


// const AccesBD=require("./module_proprii/accessbd.js")
// AccessBD.getInstanta().select({tabel:"prajituri", campuri:["*"]},function(err,rez){
//     console.log("-----------------------Acces BD-------------------------------")
//     console.log(err)
//     console.log(rez)
// })
const Client=pg.Client;

client=new Client({
    database:"tehniciweb",
    user:"dana",
    password:"dana",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from preparate", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})
client.query("select * from unnest(enum_range(null::categ_produs))", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
})

app= express();

// v=[10,27,23,44,15]

// nrImpar=v.find(function(elem){return elem % 100 == 1})
// console.log(nrImpar)

console.log("Folderul proiectului: ", __dirname)
console.log("Calea fisierului index.js: ", __filename)
console.log("Folderul curent de lucru: ", process.cwd())

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"resurse/backup"),
    OptiuneMeniu:null,
}

client.query("select * from unnest(enum_range(null::tipuri_preparate))", function(err, rezultat ){
    console.log(err)    
    console.log(rezultat)
    obGlobal.OptiuneMeniu=rezultat.rows// rows este un vector cu toate liniile din inregistrari 
})

vect_folder=["temp","backup", "temp1"]
for (let folder of vect_folder){
    let cale=path.join(__dirname, folder)
    if (!fs.existsSync(cale)){
        fs.mkdirSync(cale);
    }
}


function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt=path.basename(caleScss);    ///folder1/folder2/ceva.txt -> ceva.  basename=path.extname
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})  ///{recursive:true} =creaza toate folderele intermediare
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", Date.now() + "_" + numeFisCss));

    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)

    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");

// la pornirea serverului, compileaza toate fisierele scss din folderul scss
vFisiere=fs.readdirSync(obGlobal.folderScss);  /// vfisiere este un viector cu toate fisierele scss
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

// fs.watch=function(cale, callback) si se executa de fiecare data cand se intampla un eveniment intr un folder (fodificare fisier, stergere fisier, etc)

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

///ia toate erorile din fisier le afiseaza si concateneaza pt fiecare imagine calea folderului de baza cu imaginea respectiva
function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    console.log(continut)
    obGlobal.obErori=JSON.parse(continut)   ///JSON.parse transforma un sir de caractere intr-un obiect
    console.log(obGlobal.obErori)
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)  //creezi un drum complet spre imagine
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
    }
    console.log(obGlobal.obErori)

}

initErori()



function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");


     obGlobal.obImagini=JSON.parse(continut); //ia sirul si il transforma in obiect -->json.parse
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic"); //adaug director pentru mic

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
         let caleFisAbs=path.join(caleAbs,imag.fisier); //pentru a stii exact ce imagine ea din galerie
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");  //!webp=face o compresie mai buna
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu",numeFis+".webp" )
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier )

        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp"); //cale fisier mic
        sharp(caleFisAbs).resize(150).toFile(caleFisMicAbs);
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis+".webp" )
    }
    console.log(obGlobal.obImagini)
}

initImagini();

// pentru a compila ejs res.render


function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });

    if(eroare){
        if(eroare.status)
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals pt ca am dat render
        titlu: titluCustom,
        text: textCustom,   
        imagine: imagineCustom
})

}

app.use("/*", function(req, res, next){
    res.locals.optiuniMeniu=obGlobal.OptiuneMeniu;
    
    next();// pun next ca sa se duca la urmatorul pagina
})

app.use("/resurse", express.static(path.join(__dirname,"resurse")))
app.use("/node_modules", express.static(path.join(__dirname,"node_modules")))
app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
})

app.get(["/","/index","/home"], function(req, res){
     res.render("pagini/index",{ip:req.ip, imagini: obGlobal.obImagini.imagini});

    
})


// -----------------------------SETURI DE PRODUSE-----------------------------
app.get("/produse/seturi", async function (req, res) {
    console.log("🌐 Ruta /produse/seturi a fost apelată");
    try {
        const seturiQuery = `
            SELECT s.id, s.nume_set, s.descriere_set
            FROM seturi s
            JOIN asociere_set a ON s.id = a.id_set
            JOIN preparate p ON a.id_produs = p.id
            GROUP BY s.id, s.nume_set, s.descriere_set
        `;
        console.log("📝 Interogare seturi pregătită...");

        const produseQuery = `
            SELECT s.id AS id_set, p.id, p.nume, p.pret, p.categorie
            FROM seturi s
            JOIN asociere_set a ON s.id = a.id_set
            JOIN preparate p ON a.id_produs = p.id
        `;
        console.log("📝 Interogare produse pregătită...");

        console.log("🚀 Pornesc execuția interogărilor...");

        const [seturiResult, produseResult] = await Promise.all([
            client.query(seturiQuery),
            client.query(produseQuery)
        ]);

        console.log("✅ Rezultate seturi:", seturiResult.rows);
        console.log("✅ Rezultate produse:", produseResult.rows);

        const seturi = seturiResult.rows.map(set => {
            set.produse = produseResult.rows.filter(p => p.id_set === set.id);
            const nrProduse = set.produse.length;
            const reducere = Math.min(5, nrProduse) * 0.05;

            const pretTotal = set.produse.reduce((acc, p) => acc + Number(p.pret), 0);
            set.pret_final = pretTotal * (1 - reducere);

            return set;
        });

        console.log("🎯 Seturi finale pentru render:", seturi);

        res.render("pagini/seturi", { seturi });

    } catch (err) {
        console.error("💥 Eroare interogare seturi:", err);
        afisareEroare(res, 2, "Eroare interogare seturi.");
    }
});



app.get("/produs/:id", async (req, res) => {
    try {
        const resultProd = await client.query("SELECT * FROM preparate WHERE id=$1", [req.params.id]);
        if (resultProd.rows.length === 0) return afisareEroare(res, 404);

        const produs = resultProd.rows[0];

        const resultSeturi = await client.query(`
            SELECT s.id, s.nume_set, s.descriere_set,
                   ARRAY_AGG(p.id) AS produse_ids,
                   ARRAY_AGG(p.nume) AS produse_nume,
                   ARRAY_AGG(p.pret) AS produse_preturi
            FROM seturi s
            JOIN asociere_set a ON s.id = a.id_set
            JOIN preparate p ON a.id_produs = p.id
            WHERE s.id IN (
                SELECT id_set FROM asociere_set WHERE id_produs=$1
            )
            GROUP BY s.id
        `, [req.params.id]);

        res.render("pagini/produs", { 
            prod: produs, 
            seturi: resultSeturi.rows
        });
    } catch (e) {
        console.error("Eroare la produs:", e);
        afisareEroare(res, 2);
    }
});






// ----------------------------OFERTE-----------------------------------

// Interval de generare oferte (in milisecunde) - 2 minute pentru testare
const intervalGenerare = 2 * 60 * 1000;
const caleJson = path.join(__dirname, 'resurse/json/oferte.json');

// Generare oferta noua
function genereazaOferta() {
    client.query("SELECT * FROM unnest(enum_range(NULL::tipuri_preparate))", (err, rezultat) => {
        if (err) {
            console.error("Eroare la preluarea tipurilor de preparate:", err);
            return;
        }

        const tipuriPreparate = rezultat.rows.map(row => row.unnest);
        const reduceri = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
        const ofertaNoua = {};

        // Citire oferte existente
        let dateOferte = { oferte: [] };
        if (fs.existsSync(caleJson)) {
            const continutJson = fs.readFileSync(caleJson);
            dateOferte = JSON.parse(continutJson);
        }

        // Generare tip produs si reducere unica
        do {
            ofertaNoua.tipuri_preparate = tipuriPreparate[Math.floor(Math.random() * tipuriPreparate.length)];
        } while (dateOferte.oferte[0] && dateOferte.oferte[0].tipuri_preparate === ofertaNoua.tipuri_preparate);

        ofertaNoua.reducere = reduceri[Math.floor(Math.random() * reduceri.length)];
        ofertaNoua["data-incepere"] = moment().format();
        ofertaNoua["data-finalizare"] = moment().add(intervalGenerare, 'milliseconds').format();

        // Adaugare oferta noua la inceputul vectorului
        dateOferte.oferte.unshift(ofertaNoua);

        // Salvare oferta in fisier
        fs.writeFileSync(caleJson, JSON.stringify(dateOferte, null, 4));
        console.log("Oferta noua generata:", ofertaNoua);
    });
}

// Pornire sistem de oferte
setInterval(genereazaOferta, intervalGenerare);
console.log("Sistemul de oferte a fost pornit.");





const result = sass.compile("resurse/SCSS/galerie.scss"); 
fs.writeFileSync("resurse/css/galerie.css", result.css);

app.get("/retete", function(req, res){
    res.render("pagini/retete");
})


app.get("/index/a", function(req, res){
    res.render("pagini/index");
})


app.get("/cerere", function(req, res){
    res.send("<p style='color:blue'>Buna ziua</p>")
})


app.get("/fisier", function(req, res, next){
    res.sendfile(path.join(__dirname,"package.json"));
})


app.get("/abc", function(req, res, next){
    res.write("Data curenta: ")
    next()
})

app.get("/abc", function(req, res, next){
    res.write((new Date())+"")
    res.end()
    next()
})


app.get("/abc", function(req, res, next){
    console.log("------------")
})


app.get("/despre", function(req, res){
    let nrRandom = Math.floor(Math.random() * (17 - 2)) + 2; // de la 2 la 16
    let nrPutere2 = 1;
    while (nrPutere2 * 2 <= nrRandom) {
        nrPutere2 *= 2;
    }
    res.render("pagini/despre", { ip: req.ip, imagini: obGlobal.obImagini.imagini,nrImagini: nrPutere2 });
    
})

// app.get("/produse", function(req, res){
//     console.log(req.query)
//     var conditieQuery=""; // TO DO where din parametri
//     if (req.query.tip){
//         conditieQuery=` where tip_produs='${req.query.tip}'`

//     }

//     queryOptiuni="select * from unnest(enum_range(null::categ_produs))"
//     client.query(queryOptiuni, function(err, rezOptiuni){
//         console.log(rezOptiuni)


//         queryProduse="select * from preparate" +conditieQuery
//         client.query(queryProduse, function(err, rez){
//             if (err){
//                 console.log(err);
//                 afisareEroare(res, 2);
//             }
//             else{
//                 res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows})
//             }
//         })
//     });
// })

app.get("/produse", function(req, res){
    console.log(req.query);
    var conditieQuery=""; // TO DO where din parametri
    if (req.query.tip){
        conditieQuery=` where tip_produs='${req.query.tip}'`
    }

    // 1. Citim ofertele din fisier JSON
    const ofertePath = path.join(__dirname, "resurse/json/oferte.json");
    fs.readFile(ofertePath, "utf8", (err, data) => {
        let ofertaActiva = null;
        if (!err) {
            try {
                const oferteJson = JSON.parse(data);
                const oferte = oferteJson.oferte || [];
                const acum = Date.now();

                ofertaActiva = oferte.find(o => {
                    const start = new Date(o["data-incepere"]).getTime();
                    const end = new Date(o["data-finalizare"]).getTime();
                    return acum >= start && acum <= end;
                });
            } catch(e) {
                console.error("Eroare parsare oferte.json", e);
            }
        }

        // 2. Interogăm opțiunile categorii
        const queryOptiuni = "select * from unnest(enum_range(null::categ_produs))";
        client.query(queryOptiuni, function(err, rezOptiuni){
            if (err) {
                console.log(err);
                afisareEroare(res, 2);
                return;
            }

            // 3. Interogăm produsele
            const queryProduse = "select * from preparate" + conditieQuery;
            client.query(queryProduse, function(err, rez){
                if (err){
                    console.log(err);
                    afisareEroare(res, 2);
                    return;
                }

                // 4. Dacă există o ofertă activă, aplicăm reducerea pe produsele din categoria respectivă
                let produseAfisare = rez.rows;
                if (ofertaActiva) {
                    produseAfisare = produseAfisare.map(p => {
                        // Verifică dacă tipul produsului este același cu cel al ofertei active
                        if (p.tip_produs.toLowerCase() === ofertaActiva.tipuri_preparate.toLowerCase()) {
                            let pretInitial = Number(p.pret);
                            if (!isNaN(pretInitial)) {
                                // Calculează și setează prețul redus
                                p.pret_reducere = +(pretInitial * (100 - ofertaActiva.reducere) / 100).toFixed(2);
                            }
                        }
                        return p;
                    });
                }


                

                res.render("pagini/produse", {
                    produse: produseAfisare,
                    optiuni: rezOptiuni.rows,
                    ofertaActiva: ofertaActiva
                });
            });
        });
    });
});


// app.get("/produs/:id", function(req, res){
//     console.log(req.params)
//     client.query(`select * from preparate where id=${req.params.id}`, function(err, rez){
//         if (err){
//             console.log(err);
//             afisareEroare(res, 2);
//         }
//         else{
//             if (rez.rowCount==0){
//                 afisareEroare(res, 404);
//             }
//             else{
//                 res.render("pagini/produs", {prod: rez.rows[0]})
//             }
//         }
//     })
// })




app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res,403);
})


// app.get("/produse", function(req, res){
//     console.log("Cerere produse ------------------------------------")
//     console.log(req.query)
//     var conditieQuery=""; // TO DO where din parametri
//     if (req.query.tip){
//         conditieQuery=` where tipuri_preparate='${req.query.tip}'`;
//     }

//     queryOptiuni="select * from unnest(enum_range(null::categ_produs))"+conditieQuery;
//     client.query(queryOptiuni, function(err, rezOptiuni){
//         console.log("-------",rezOptiuni)
//         console.log(err)


//         queryProduse="select * from preparate"
//         client.query(queryProduse, function(err, rez){
//             console.log("++++++",rez);
//             if (err){
//                 console.log(err);
//                 afisareEroare(res, 2);
//             }
//             else{
//                 console.log(rezOptiuni.rows)
//                 res.render("pagini/produse", {produse: rez.rows, optiuni:rezOptiuni.rows})
//             }
//         })
//     });
// })


app.get("/*.ejs", function(req, res, next){
    afisareEroare(res,400);
})

app.get("/*", function(req, res, next){
    try{
        res.render("pagini"+req.url,function (err, rezultatRandare){
            if (err){
                if(err.message.startsWith("Failed to lookup view")){
                    afisareEroare(res,404);
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                console.log(rezultatRandare);
                res.send(rezultatRandare)
            }
        });
    }
    catch(errRandare){
        if(errRandare.message.startsWith("Cannot find module")){
            afisareEroare(res,404);
        }
        else{
            afisareEroare(res);
        }
    }
})



app.listen(8080);
console.log("Serverul a pornit")


