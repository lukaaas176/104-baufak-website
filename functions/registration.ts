export const onRequestPost: PagesFunction<Env> = async (context) => {
    var form: FormData = await context.request.formData();
    
    return new Response(JSON.stringify(form), {
        status: 200,
    });
};