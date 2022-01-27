import { createCookieSessionStorage, redirect } from "remix";
import { db } from "~/utils/db.server";
import { compare } from "bcryptjs";

type LoginForm = {
  username: string;
  password: string;
};

const existsUser = async (username: string) =>
  db.user.findUnique({ where: { username } });

const isCorrectPassword = async (user, givenPassword: string) =>
  compare(givenPassword, user.passwordHash);

export const login = async ({ username, password }: LoginForm) => {
  const user = await existsUser(username);

  if (user && (await isCorrectPassword(user, password))) {
    return user;
  } else return null;
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
  },
});

export const createUserSession = async (userId: string, route: string) => {
  const session = await storage.getSession();

  session.set("userId", userId);

  return redirect(route, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
};

export const getUserSession = (request: Request) => {
  return storage.getSession(request.headers.get("Cookie"));
};

export const getUserId = async (request: Request) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
};

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
};

export const getUser = async (request: Request) => {
  const userId = await getUserId(request);
  if (!userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    return user;
  } catch {
    throw logout(request);
  }
};

export const logout = async (request: Request) => {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
};
