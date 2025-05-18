export const onRequestGet: PagesFunction<Env> = async (context) => {
    const file: R2ObjectBody | null = await context.env.R2_BUCKET.get("PreReader_104BauFaK_München.pdf");
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