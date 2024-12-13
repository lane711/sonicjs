import type { APIContext } from "astro";


export function setSessionTokenCookie(context: APIContext, token: string, expires: number): void {
	context.cookies.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: import.meta.env.PROD,
		expires: new Date(expires * 1000),
		path: "/"
	});
}

export function deleteSessionTokenCookie(context: APIContext): void {
	context.cookies.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: import.meta.env.PROD,
		maxAge: 0,
		path: "/"
	});
}