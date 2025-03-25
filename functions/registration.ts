export const onRequestPost: PagesFunction<Env> = async (context) => {
    var form: FormData = await context.request.formData();
    const body = {};
    for (const entry of form.entries()) {
        if (entry[1] instanceof File) {
            var file: File = entry[1];
            var content: Uint8Array = await file.bytes();
            body[entry[0]] = file.name + ": " + btoa(content.reduce((data, byte) => data + String.fromCharCode(byte), ''))
        } else {
            body[entry[0]] = entry[1];
        }
    }
    
    return new Response(JSON.stringify(body), {
        status: 200,
    });
};