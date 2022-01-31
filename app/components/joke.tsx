import { Link, Form, LinksFunction } from "remix";
import type { Joke } from "@prisma/client";
import stylesUrl from "../styles/jokes.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesUrl },
];

export function JokeDisplay({
  joke,
  isOwner,
  canDelete = true,
}: {
  joke: Pick<Joke, "content" | "name">;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <div className="joke-action-menue">
        {isOwner && (
          <>
            <Form className="joke-action-menue-item" method="post">
              <input type="hidden" name="_method" value="edit" />
              <button type="submit" className="button">
                Edit
              </button>
            </Form>
            <Form className="joke-action-menue-item" method="post">
              <input type="hidden" name="_method" value="delete" />
              <button type="submit" className="button" disabled={!canDelete}>
                Delete
              </button>
            </Form>
          </>
        )}
        <Link className="joke-action-menue-item" to=".">
          {joke.name} Permalink
        </Link>
      </div>
    </div>
  );
}
