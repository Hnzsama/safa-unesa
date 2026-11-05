import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Biarkan halaman login terbuka untuk publik
        if (req.nextUrl.pathname.startsWith("/login")) {
          return true;
        }
        // Proteksi route dashboard & laporan: wajib memiliki token aktif
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

