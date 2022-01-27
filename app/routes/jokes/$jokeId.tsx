import { Link, useLoaderData, LoaderFunction } from "remix";
import { db } from "~/utils/db.server";

type Joke = {
  id: string;
  name: string;
  content: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const jokeId = params.jokeId;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });

  if (!joke) {
    throw new Error("joke not found");
  }
  return joke;
};

const JokeId = () => {
  const joke = useLoaderData<Joke>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">{joke.name} Permalink</Link>
    </div>
  );
};

export default JokeId;
