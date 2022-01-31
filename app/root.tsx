import { LiveReload, Outlet, Links, useCatch, MetaFunction, Meta } from "remix";
import type { LinksFunction } from "remix";
import globalStylesUrl from "./styles/global.css";
import globalMediumStylesUrl from "./styles/global-medium.css";
import globalLargeStylesUrl from "./styles/global-large.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <title>Remix: So great , it's funny! </title>
        <Links />
      </head>
      <body>
        <Outlet />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

export const meta: MetaFunction = () => {
  const description = `Learn Remix and laugh at the same time!`;
  return {
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description,
  };
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <html>
      <head>
        <title>Uh-oh!</title>
      </head>
      <body>
        <div className="error-container">
          <h1>App Error</h1>
          <pre>{error.message}</pre>
        </div>
      </body>
    </html>
  );
};
export const CatchBoundary = () => {
  const caught = useCatch();

  return (
    <html>
      <head>
        <title>{`${caught.status} ${caught.statusText}`}</title>
      </head>
      <body>
        <div className="error-container">
          <h1>
            {caught.status} {caught.statusText}
          </h1>
        </div>
      </body>
    </html>
  );
};
