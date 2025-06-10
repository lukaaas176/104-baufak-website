import { StatusGruppe, RegistrationData } from "./registration-types";

function escape(field: string): string {
    return `"${field.replace(/"/g, '""')}"`
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!context.request.headers.has("Authorization")) {
        return new Response(null, {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Anmeldungen", charset="UTF-8"'
            }
        });
    } else {
        let authorizationHeader: string = context.request.headers.get("Authorization");
        if (!authorizationHeader.startsWith("Basic ")) {
            return new Response("No Basic Auth", { status: 401 });
        }
        authorizationHeader = atob(authorizationHeader.substring(6));
        if (!authorizationHeader.startsWith("baufak:")) {
            return new Response("Invalid User", { status: 401 });
        }
        authorizationHeader = authorizationHeader.substring(7);
        if (authorizationHeader != context.env.EXPORT_TOKEN) {
            return new Response("Invalid Token", { status: 401 });
        }
    }
    let result: D1Result = await context.env.DB.prepare("SELECT vorname, nachname, email, telefon, hochschule, statusGruppe, ersteBaufak, wievielteBaufak, bauhelm, sicherheitsschuhe, deutschlandticket, anreisezeitpunkt, anreisezeitpunktKommentar, anreisemittel, abreisezeitpunkt, abreisezeitpunktKommentar, abreisemittel, schlafplatz, kommentarSchlafplatz, schlafplatzAuswahl, schlafplatzPersonen, ernaehrung, allergieLaktose, allergieUniversitaet, allergieGluten, allergieNuesse, allergieArchitekten, allergieSoja, allergien, tshirt, buddy, kommentar, datenschutz, teilnahmegebuehr, immatbescheinigungId FROM registrations")
        .all<string>();
    if (!result.success) {
        console.log(result)
        return new Response("Konnte die Anmeldungen nicht abrufen", { status: 500 });
    }
    if (result.results.length == 0) {
        return new Response("Es existieren keine Anmeldungen");
    }
    let firstResult: any = result.results[0];
    let header: string = Object.keys(firstResult).map(escape).join(",");
    let rows: string = result.results.map(row => Object.values(row).map(entry => entry.toString()).map(escape).join(',')).join('\n');
    let body: string = header + "\n" + rows;
    return new Response(body, {
        headers: {
            "Content-Type": "text/csv;charset=UTF-8",
            "Content-Length": body.length.toString(),
            "Content-Disposition": 'attachment; filename="anmeldungen.csv"'
        }
    })
};