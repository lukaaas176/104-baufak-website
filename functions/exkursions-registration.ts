export interface ExkursionsRegistration {
    readonly vorname: string;
    readonly nachname: string;
    readonly email: string;
    readonly exkursion1: string;
    readonly exkursion2: string;
    readonly exkursion3: string;
    readonly datenschutz: boolean;
}

function getAsString(formData: {[k: string]: string | File}, name: string): string {
    let entry: string | File = formData[name];
    if (typeof entry === "string") {
        return entry as string;
    }
    return "";
}

function checkNotEmpty(formData: {[k: string]: string | File}, validationErrors: Set<string>, name: string, humanName: string): string {
    let entry: string = getAsString(formData, name);
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

async function parseRegistration(formData: {[k: string]: string | File}): Promise<ExkursionsRegistration | Set<string>> {
    let validationErrors: Set<string> = new Set();
    let data: ExkursionsRegistration = null;
    
    if (!("datenschutz" in formData)) {
        validationErrors.add("Der Datenschutz muss akzeptiert werden!");
    }
    data = {
        vorname: checkPattern(formData, validationErrors, "vorname", "Der Vorname", /^[\p{Letter}\s\-.']+$/v),
        nachname: checkPattern(formData, validationErrors, "nachname", "Der Nachname", /^[\p{Letter}\s\-.']+$/v),
        email: checkPattern(formData, validationErrors, "email", "Die E-Mail", /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,}$/),
        exkursion1: checkPattern(formData, validationErrors, "exkursion-1", "Die erste Exkursion", /^[\p{Letter}\d\s\-!.'\/]+$/v),
        exkursion2: checkPattern(formData, validationErrors, "exkursion-2", "Die zweite Exkursion", /^[\p{Letter}\d\s\-!.'\/]+$/v),
        exkursion3: checkPattern(formData, validationErrors, "exkursion-3", "Die dritte Exkursion", /^[\p{Letter}\d\s\-!.'\/]+$/v),
        datenschutz: "datenschutz" in formData,
    };
    
    if (0 < validationErrors.size)
        return validationErrors;
    else
        return data;
}

function formatMail(template: string, data: ExkursionsRegistration) {
    return Object.keys(data).reduce((acc, key) => acc.replaceAll(`\$\{${key}\}`, data[key]), template);
}

// @ts-ignore
import mailHTML from "./exkursions-registration.html";
// @ts-ignore
import mailTXT from "./exkursions-registration.txt";

async function sendMail(data: ExkursionsRegistration, token: string): Promise<boolean> {
    let body: string = JSON.stringify({
        "from": "Anmeldung 104. BauFaK <anmeldung@baufak.santos.dev>",
        "to": data.email,
        "reply_to": "baufak.exkursionen.fsbgu@ed.tum.de",
        "cc": "baufak.exkursionen.fsbgu@ed.tum.de",
        subject: "Anmeldung zu den Exkursionen der 104. BauFaK",
        html: formatMail(mailHTML, data),
        text: formatMail(mailTXT, data)
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

async function saveRegistration(data: ExkursionsRegistration, database: D1Database): Promise<boolean> {
    let result: D1Result = await database.prepare("INSERT INTO exkursionen (vorname, nachname, email, exkursion1, exkursion2, exkursion3, datenschutz) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(
            data.vorname,
            data.nachname,
            data.email,
            data.exkursion1,
            data.exkursion2,
            data.exkursion3,
            data.datenschutz
        )
        .run();

    if (!result.success) {
        console.log("Couldn't save entry: " + JSON.stringify(result.meta));
    }
    console.log("Saved entry to database");

    return result.success;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    return new Response("Die Anmeldung ist geschlossen", { status: 400 });
    /*
    let formData: {[k: string]: string | File} = await context.request.formData().then(Object.fromEntries);
    console.log(`Received exkursions data: ${JSON.stringify(formData)}`);
    let data: ExkursionsRegistration | Set<string> = await parseRegistration(formData);
    if (data instanceof Set) {
        return new Response([...data].join("\n"), { status: 400 });
    }
    let saveIntoDatabase: boolean = await saveRegistration(data, context.env.DB);
    if (!saveIntoDatabase) {
        return new Response("Konnten die Anmeldung zu den Exkursionen nicht speichern. Bitte probiere es später noch einmal!", { status: 400 });
    }

    let mailSent: boolean = await sendMail(data, context.env.RESEND_TOKEN);
    
    if (!mailSent) {
        return new Response("Konnten die Anmeldemail nicht verschicken. Bitte probiere es später noch einmal!", { status: 400 });
    }

    return Response.json(data);*/
};