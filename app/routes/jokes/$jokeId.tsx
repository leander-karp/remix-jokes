import {
  Link,
  useLoaderData,
  LoaderFunction,
  useParams,
  useCatch,
} from "remix";
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
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
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

export const ErrorBoundary = () => {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
};

export const CatchBoundary = () => {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <div className="error-container">
        Huh? What the heck is "{params.jokeId}"?
      </div>
    );
  }
  throw new Error(`Unhandled error: ${caught.status}`);
};
