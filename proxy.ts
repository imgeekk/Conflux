import { NextRequest, NextResponse } from "next/server"

const publicRoutes = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value

  if (!sessionToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionToken && isPublic) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}