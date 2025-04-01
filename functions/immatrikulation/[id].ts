export const onRequestGet: PagesFunction<Env> = async (context) => {
    if (!("id" in context.params) || (typeof context.params["id"]) != "string") {
        return new Response("Missing or wrong id", { status: 400 });
    }
    const uuid: string = context.params["id"];
    const file: R2ObjectBody | null = await context.env.R2_BUCKET.get(uuid);
    if (file === null) {
        return new Response("Cannot find file", { status: 404 });
    }
    const headers: Headers = new Headers();
    file.writeHttpMetadata(headers);
    headers.set("etag", file.etag);
    return new Response(file.body, {
        headers
    });
}