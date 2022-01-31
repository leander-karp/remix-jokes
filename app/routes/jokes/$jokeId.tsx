import {
  Link,
  useLoaderData,
  LoaderFunction,
  useParams,
  useCatch,
  ActionFunction,
  redirect,
  MetaFunction,
} from "remix";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

type LoaderData = { joke: Joke; isOwner: boolean };
type Joke = {
  id: string;
  name: string;
  content: string;
};

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  const jokeId = params.jokeId;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });

  if (!joke) {
    throw new Response("What a joke! Not found.", {
      status: 404,
    });
  }
  return { joke, isOwner: userId === joke.jokesterId };
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_method") === "delete") {
    const userId = await requireUserId(request);
    console.log("userID", userId);
    const joke = await db.joke.findUnique({
      where: { id: params.jokeId },
    });
    if (!joke) {
      throw new Response("Can't delete what does not exist", { status: 404 });
    }

    if (joke.jokesterId !== userId) {
      const response = new Response("Pssh, nice try. That's not your joke", {
        status: 401,
      });
      throw response;
    }
    await db.joke.delete({ where: { id: params.jokeId } });
    return redirect("/jokes");
  }
};

const JokeId = () => {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to=".">{data.joke.name} Permalink</Link>
      {data.isOwner && (
        <form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button">
            Delete
          </button>
        </form>
      )}
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
  switch (caught.status) {
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.jokeId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
};
