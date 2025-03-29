enum StatusGruppe {
    VERTRETER = "A: Vertreterinnen, Vertreter und Mitglieder der Fachschaften",
    EHEMALIGE = "B: Ehemalige",
    GAESTE = "C: Gäste"
}

interface RegistrationData {
    readonly vorname: string;
    readonly nachname: string;
    readonly email: string;
    readonly telefon: string;
    readonly hochschule: string;
    readonly statusGruppe: StatusGruppe;
    readonly ersteBaufak: boolean;
    readonly wievielteBaufak: number;
    readonly bauhelm: boolean;
    readonly sicherheitsschuhe: boolean;
    readonly deutschlandticket: boolean;
    readonly anreisezeitpunkt: string;
    readonly anreisezeitpunktKommentar: string;
    readonly anreisemittel: string;
    readonly abreisezeitpunkt: string;
    readonly abreisezeitpunktKommentar: string;
    readonly abreisemittel: string;
    readonly schlafplatz: boolean;
    readonly kommentarSchlafplatz: string;
    readonly schlafplatzAuswahl: string;
    readonly schlafplatzPersonen: string;
    readonly ernaehrung: string;
    readonly allergieLaktose: boolean;
    readonly allergieUniversitaet: boolean;
    readonly allergieGluten: boolean;
    readonly allergieNuesse: boolean;
    readonly allergieArchitekten: boolean;
    readonly allergieSoja: boolean;
    readonly allergien: string;
    readonly tshirt: string;
    readonly buddy: string;
    readonly immatbescheinigung: string;
    readonly kommentar: string;
    readonly datenschutz: boolean;
    readonly teilnahmegebuehr: boolean;
}

function getAsString(formData: {[k: string]: string | File}, validationErrors: Set<string>, name: string, humanName: string): string {
    let entry: string | File = formData[name];
    if (typeof entry === "string") {
        return entry as string;
    }
    return "";
}

function getStatusGruppe(formData: {[k: string]: string | File}, validationErrors: Set<string>): StatusGruppe {
    switch (getAsString(formData, validationErrors, "statusgruppe", "Statusgruppe")) {
        case StatusGruppe.VERTRETER:
            return StatusGruppe.VERTRETER;
        case StatusGruppe.EHEMALIGE:
            return StatusGruppe.EHEMALIGE;
        case StatusGruppe.GAESTE:
            return StatusGruppe.GAESTE;
        default:
            validationErrors.add("Die Statusgruppe hat keine gültige Auswahl");
            return null;
    }
}

function checkNotEmpty(formData: {[k: string]: string | File}, validationErrors: Set<string>, name: string, humanName: string): string {
    let entry: string = getAsString(formData, validationErrors, name, humanName);
    if (entry.trim().length == 0) {
        validationErrors.add(humanName + " darf nicht leer sein!");
        return "";
    }
    return entry;
}

function checkPattern(formData: {[k: string]: string | File}, validationErrors: Set<string>, name: string, humanName: string, pattern: RegExp): string {
    let entry: string = checkNotEmpty(formData, validationErrors, name, humanName);
    if (!entry.match(pattern)) {
        validationErrors.add(humanName + " hat ein ungültiges Format!");
        return "";
    }
    return entry;
}
// @ts-ignore
import { Buffer } from 'node:buffer';

async function parseRegistration(formData: {[k: string]: string | File}): Promise<RegistrationData | Set<string>> {
    let validationErrors: Set<string> = new Set();
    let data: RegistrationData = null;
    
    let statusGruppe: StatusGruppe = getStatusGruppe(formData, validationErrors);
    let ersteBauFaK: boolean = "erste-baufak" in formData;
    let wievielteBaufak: number = 1;
    if (!ersteBauFaK) {
        wievielteBaufak = parseInt(checkNotEmpty(formData, validationErrors, "wievielte-baufak", "Die wievielte BauFaK"));
        if (wievielteBaufak == Number.NaN || wievielteBaufak < 1 || 104 < wievielteBaufak) {
            validationErrors.add("Die wievielte BauFaK ist keine gültige Zahl");
        }
    }
    let immatbescheinigung: string = null;
    if (formData["immatrikulation"] instanceof File) {
        if (10000000 <  formData["immatrikulation"].size) { // 10 MB
            validationErrors.add("Der Immatrikulationsbescheinigung ist zu groß!");
        } else {
            immatbescheinigung = Buffer.from(await formData["immatrikulation"].arrayBuffer()).toString("base64");
        }
    }
    
    if (!("datenschutz" in formData)) {
        validationErrors.add("Der Datenschutz muss akzeptiert werden!");
    }
    if (!("teilnahmegebuehr" in formData)) {
        validationErrors.add("Die Teilnahmegebühr muss akzeptiert werden!");
    }

    let telefonNummer: string = getAsString(formData, validationErrors, "telefon", "Die Telefonnummer");
    if (telefonNummer != "" && !telefonNummer.match(/^[\d\-+\s\(\)]{5,}$/)) {
        validationErrors.add("Die Telefonnummer hat ein ungültiges Format!");
    }
    data = {
        vorname: checkPattern(formData, validationErrors, "vorname", "Der Vorname", /^[\p{Letter}\s\-.']+$/v),
        nachname: checkPattern(formData, validationErrors, "nachname", "Der Nachname", /^[\p{Letter}\s\-.']+$/v),
        email: checkPattern(formData, validationErrors, "email", "Die E-Mail", /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,}$/),
        telefon: telefonNummer,
        hochschule: checkPattern(formData, validationErrors, "hochschule", "Die Hochschule", /^[\p{Letter}\s\-.']+$/v),
        statusGruppe: statusGruppe,
        ersteBaufak: ersteBauFaK,
        wievielteBaufak: wievielteBaufak,
        bauhelm: "bauhelm" in formData,
        sicherheitsschuhe: "sicherheitsschuhe" in formData,
        deutschlandticket: "deutschlandticket" in formData,
        anreisezeitpunkt: checkNotEmpty(formData, validationErrors, "anreisezeitpunkt", "Der Anreisezeitpunkt"),
        anreisezeitpunktKommentar: getAsString(formData, validationErrors, "anreisezeitpunkt-kommentar", "Die genaue Zeit der Anreise"),
        anreisemittel: checkNotEmpty(formData, validationErrors, "anreisemittel", "Das Anreisemittel"),
        abreisezeitpunkt: checkNotEmpty(formData, validationErrors, "abreisezeitpunkt", "Der Abreisezeitpunkt"),
        abreisezeitpunktKommentar: getAsString(formData, validationErrors, "abreisezeitpunkt-kommentar", "Die genaue Zeit der Abreise"),
        abreisemittel: checkNotEmpty(formData, validationErrors, "abreisemittel", "Das Abreisemittel"),
        schlafplatz: "schlafplatz" in formData,
        kommentarSchlafplatz: getAsString(formData, validationErrors, "schlafplatz-kommentar", "Der Kommentar zum Schlafplatz"),
        schlafplatzAuswahl: getAsString(formData, validationErrors, "schlafplatz-auswahl", "Die Zimmerpartnerpräferenz"),
        schlafplatzPersonen: getAsString(formData, validationErrors, "schlafplatz-personen", "Die Zimmerpartner"),
        ernaehrung: checkNotEmpty(formData, validationErrors, "ernaehrung", "Die Ernährungsform"),
        allergieLaktose: "allergie-laktose" in formData,
        allergieUniversitaet: "allergie-universitaet" in formData,
        allergieGluten: "allergie-gluten" in formData,
        allergieNuesse: "allergie-nuesse" in formData,
        allergieArchitekten: "allergie-architekten" in formData,
        allergieSoja: "allergie-soja" in formData,
        allergien: getAsString(formData, validationErrors, "allergien", "Die sonstigen Allergien"),
        tshirt: checkNotEmpty(formData, validationErrors, "tshirt", "Das T-Shirt"),
        buddy: getAsString(formData, validationErrors, "buddy", "Das Buddyprogramm"),
        immatbescheinigung: immatbescheinigung,
        kommentar: getAsString(formData, validationErrors, "kommentar", "Der Kommentar"),
        datenschutz: "datenschutz" in formData,
        teilnahmegebuehr: "teilnahmegebuehr" in formData
    };
    
    if (0 < validationErrors.size)
        return validationErrors;
    else
        return data;
}

function formatMail(template: string, data: RegistrationData) {
    return Object.keys(data).reduce((acc, key) => acc.replaceAll(`\$\{${key}\}`, data[key]), template);
}

function calculateFee(data: RegistrationData): number {
    let fee: number = 0;
    switch (data.statusGruppe) {
        case StatusGruppe.VERTRETER:
            fee = 50;
            break;
        case StatusGruppe.EHEMALIGE:
            fee = 100;
            if (!data.schlafplatz) {
                fee -= 10;
            }
            break;
        case StatusGruppe.GAESTE:
            fee = 150;
            break;
    }
    return fee;
}

// @ts-ignore
import mailHTML from "./registration.html";
// @ts-ignore
import mailTXT from "./registration.txt";

async function sendMail(data: RegistrationData, token: string): Promise<boolean> {
    let body: string = JSON.stringify({
        "from": "anmeldung@baufak.santos.dev",
        "to": data.email,
        "reply_to": "baufak104.fsbgu@ed.tum.de",
        subject: "Anmeldung zur 104. BauFaK",
        html: formatMail(mailHTML, data).replace("TEILNEHMERBETRAG", calculateFee(data).toString()),
        text: formatMail(mailTXT, data).replace("TEILNEHMERBETRAG", calculateFee(data).toString()),
        attachments: data.immatbescheinigung ? [ {
            "filename": "immatbescheinigung.pdf",
            "content": data.immatbescheinigung
        }] : []
    });
    let response: Response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: body
    });
    if (response.status != 200) {
        console.log("Couldn't send mail");
        console.log("Body: " + body)
        console.log("Response " + response.status + ": " + JSON.stringify(response));
        return false;
    }

    console.log(`Send mail to ${data.email}!`)

    return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    let formData: {[k: string]: string | File} = await context.request.formData().then(Object.fromEntries);
    console.log(`Received registration data: ${JSON.stringify(formData)}`);
    let data: RegistrationData | Set<string> = await parseRegistration(formData);
    if (data instanceof Set) {
        return new Response([...data].join("\n"), { status: 400 });
    }
    let mailSent: boolean = await sendMail(data, context.env.RESEND_TOKEN);
    
    if (!mailSent) {
        return new Response("Konnten die Anmeldemail nicht verschicken. Bitte probiere es später noch einmal!", { status: 400 });
    }

    return Response.json(data);
};