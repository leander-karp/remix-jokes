import { Link, useLoaderData, LoaderFunction, useCatch } from "remix";
import { db } from "~/utils/db.server";

type Joke = {
  id: string;
  name: string;
  content: string;
};

export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  });

  if (!randomJoke) {
    throw new Response("joke not found", { status: 404 });
  }
  return randomJoke;
};

const JokesIndex = () => {
  const joke = useLoaderData<Joke>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{joke.content}</p>
      <Link to={joke.id}>{joke.name} Permalink</Link>
    </div>
  );
};

export default JokesIndex;

export const ErrorBoundary = () => (
  <div className="error-container">I did a whoopsies.</div>
);

export const CatchBoundary = () => {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">There are no jokes to display.</div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
};
