import { Link, useLoaderData, LoaderFunction } from "remix";
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
    throw new Error("joke not found");
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
