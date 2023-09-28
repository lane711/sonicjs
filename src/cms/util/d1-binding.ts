
export function getD1Binding(ctx){
        //HACK: for testing while d1 is still in beta, then can be removed
        return ctx.env.D1DATA ?? ctx.env.__D1_BETA__D1DATA;
}