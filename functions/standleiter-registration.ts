import { StatusGruppe, StandleiterRegistrationData } from "./registration-types";

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

async function parseRegistration(formData: {[k: string]: string | File}): Promise<StandleiterRegistrationData | Set<string>> {
    let validationErrors: Set<string> = new Set();
    let data: StandleiterRegistrationData = null;
    
    let statusGruppe: StatusGruppe = getStatusGruppe(formData, validationErrors);
    let ersteBauFaK: boolean = "erste-baufak" in formData;
    let wievielteBaufak: number = 1;
    if (!ersteBauFaK) {
        wievielteBaufak = parseInt(checkNotEmpty(formData, validationErrors, "wievielte-baufak", "Die wievielte BauFaK"));
        if (wievielteBaufak == Number.NaN || wievielteBaufak < 1 || 104 < wievielteBaufak) {
            validationErrors.add("Die wievielte BauFaK ist keine gültige Zahl");
        }
    }
    let immatbescheinigung: ArrayBuffer = null;
    if (formData["immatrikulation"] instanceof File) {
        if (10000000 <  formData["immatrikulation"].size) { // 10 MB
            validationErrors.add("Der Immatrikulationsbescheinigung ist zu groß!");
        } else {
            immatbescheinigung = await formData["immatrikulation"].arrayBuffer();
        }
    }
    
    if (!("datenschutz" in formData)) {
        validationErrors.add("Der Datenschutz muss akzeptiert werden!");
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
        ernaehrung: checkNotEmpty(formData, validationErrors, "ernaehrung", "Die Ernährungsform"),
        allergieLaktose: "allergie-laktose" in formData,
        allergieUniversitaet: "allergie-universitaet" in formData,
        allergieGluten: "allergie-gluten" in formData,
        allergieNuesse: "allergie-nuesse" in formData,
        allergieArchitekten: "allergie-architekten" in formData,
        allergieSoja: "allergie-soja" in formData,
        allergien: getAsString(formData, validationErrors, "allergien", "Die sonstigen Allergien"),
        tshirt: checkNotEmpty(formData, validationErrors, "tshirt", "Das T-Shirt"),
        immatbescheinigung: immatbescheinigung,
        kommentar: getAsString(formData, validationErrors, "kommentar", "Der Kommentar"),
        datenschutz: "datenschutz" in formData
    };
    
    if (0 < validationErrors.size)
        return validationErrors;
    else
        return data;
}

function formatMail(template: string, data: StandleiterRegistrationData) {
    return Object.keys(data).reduce((acc, key) => acc.replaceAll(`\$\{${key}\}`, data[key]), template);
}

// @ts-ignore
import mailHTML from "./standleiter-registration.html";
// @ts-ignore
import mailTXT from "./standleiter-registration.txt";

async function sendMail(data: StandleiterRegistrationData, token: string): Promise<boolean> {
    let body: string = JSON.stringify({
        "from": "Anmeldung 104. BauFaK <anmeldung@baufak.santos.dev>",
        "to": data.email,
        "reply_to": "baufak104.fsbgu@ed.tum.de",
        "cc": "baufak104.fsbgu@ed.tum.de",
        subject: "Anmeldung zur 104. BauFaK als Standleitung",
        html: formatMail(mailHTML, data),
        text: formatMail(mailTXT, data),
        attachments: data.immatbescheinigung ? [ {
            "content": Buffer.from(data.immatbescheinigung).toString("base64"),
            "filename": "immatbescheinigung.pdf"
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

async function saveRegistration(data: StandleiterRegistrationData, database: D1Database): Promise<boolean> {
    let result: D1Result = await database.prepare("INSERT INTO standleiterregistrations (vorname, nachname, email, telefon, hochschule, statusGruppe, ersteBaufak, wievielteBaufak, bauhelm, sicherheitsschuhe, deutschlandticket, ernaehrung, allergieLaktose, allergieUniversitaet, allergieGluten, allergieNuesse, allergieArchitekten, allergieSoja, allergien, tshirt, kommentar, datenschutz, immatbescheinigungId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(
            data.vorname,
            data.nachname,
            data.email,
            data.telefon,
            data.hochschule,
            data.statusGruppe,
            data.ersteBaufak,
            data.wievielteBaufak,
            data.bauhelm,
            data.sicherheitsschuhe,
            data.deutschlandticket,
            data.ernaehrung,
            data.allergieLaktose,
            data.allergieUniversitaet,
            data.allergieGluten,
            data.allergieNuesse,
            data.allergieArchitekten,
            data.allergieSoja,
            data.allergien,
            data.tshirt,
            data.kommentar,
            data.datenschutz,
            data.immatbescheinigungId
        )
        .run();

    if (!result.success) {
        console.log("Couldn't save entry: " + JSON.stringify(result.meta));
    }
    console.log("Saved entry to database");

    return result.success;
}

async function uploadImmatrikulation(data: StandleiterRegistrationData, bucket: R2Bucket): Promise<boolean> {
    if (data.immatbescheinigung == null) {
        console.log("No Immatrikulationsfile provided, not uploading!");
        data.immatbescheinigungId = "";
        return true;
    }
    const filename: string = crypto.randomUUID();
    await bucket.put(filename, data.immatbescheinigung, {
        httpMetadata: {
            contentDisposition: `attachment; filename="standleiter_immatrikulationsbescheinigung_${data.nachname}_${data.vorname}.pdf"`,
            contentType: "application/pdf"
    }});
    console.log("Uploaded as file " + filename);
    data.immatbescheinigungId = filename;

    return true;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    let formData: {[k: string]: string | File} = await context.request.formData().then(Object.fromEntries);
    console.log(`Received registration data: ${JSON.stringify(formData)}`);
    let data: StandleiterRegistrationData | Set<string> = await parseRegistration(formData);
    if (data instanceof Set) {
        return new Response([...data].join("\n"), { status: 400 });
    }
    let immatrikulationId: boolean = await uploadImmatrikulation(data, context.env.R2_BUCKET);
    if (!immatrikulationId) {
        return new Response("Konnten die Immatrikulationsbescheinigung nicht speichern. Bitte probiere es später noch einmal!", { status: 400 });
    }
    let saveIntoDatabase: boolean = await saveRegistration(data, context.env.DB);
    if (!saveIntoDatabase) {
        return new Response("Konnten die Anmeldung nicht speichern. Bitte probiere es später noch einmal!", { status: 400 });
    }

    let mailSent: boolean = await sendMail(data, context.env.RESEND_TOKEN);
    
    if (!mailSent) {
        return new Response("Konnten die Anmeldemail nicht verschicken. Bitte probiere es später noch einmal!", { status: 400 });
    }

    return Response.json(data);
};