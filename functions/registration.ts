export const onRequestPost: PagesFunction<Env> = async (context) => {
    var form: FormData = await context.request.formData();
    const body = {};
    for (const entry of form.entries()) {
        body[entry[0]] = entry[1];
    }
    
    return new Response(JSON.stringify(body), {
        status: 200,
    });
};