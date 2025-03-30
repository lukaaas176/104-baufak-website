import { StatusGruppe, RegistrationData } from "./registration-types";

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
        if (!authorizationHeader.startsWith("baufak:")) {
            return new Response("Invalid User", { status: 401 });
        }
        authorizationHeader = authorizationHeader.substring(7);
        if (atob(authorizationHeader) != context.env.EXPORT_TOKEN) {
            return new Response("Invalid Token", { status: 401 });
        }
    }
    let response: D1Response = await context.env.DB.prepare("SELECT vorname, nachname, email, telefon, hochschule, statusGruppe, ersteBaufak, wievielteBaufak, bauhelm, sicherheitsschuhe, deutschlandticket, anreisezeitpunkt, anreisezeitpunktKommentar, anreisemittel, abreisezeitpunkt, abreisezeitpunktKommentar, abreisemittel, schlafplatz, kommentarSchlafplatz, schlafplatzAuswahl, schlafplatzPersonen, ernaehrung, allergieLaktose, allergieUniversitaet, allergieGluten, allergieNuesse, allergieArchitekten, allergieSoja, allergien, tshirt, buddy, kommentar, datenschutz, teilnahmegebuehr FROM registrations")
        .all();
    return Response.json(response);
};