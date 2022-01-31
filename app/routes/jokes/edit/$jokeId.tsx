import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "remix";
import { redirect } from "remix";
import { JokeDisplay } from "~/components/joke";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

const validateJokeName = (name: string) =>
  name.length < 3 ? "The name is too short" : undefined;
const validateJokeContent = (content: string) =>
  content.length < 10 ? "The content is too short" : undefined;

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const body = await request.formData();
  const name = body.get("name");
  const content = body.get("content");

  if (typeof name !== "string" || typeof content !== "string")
    return badRequest({ formError: "Invalid form" });

  const fields = { name, content };
  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };

  if (fieldErrors.name || fieldErrors.content)
    return badRequest({ fieldErrors, fields });

  const joke = await db.joke.update({
    data: { ...fields, jokesterId: userId },
    where: { id: params.jokeId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  const jokeId = params.jokeId;
  const joke = await db.joke.findUnique({
    where: { id: jokeId },
  });
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return { joke };
};

const EditJoke = () => {
  const actionData = useActionData<ActionData>();
  const loaderData = useLoaderData<{ joke }>();

  const transition = useTransition();

  if (transition.submission) {
    const name = transition.submission.formData.get("name");
    const content = transition.submission.formData.get("content");
    if (
      typeof name === "string" &&
      typeof content === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeDisplay
          joke={{ name, content }}
          isOwner={true}
          canDelete={false}
        />
      );
    }
  }
  return (
    <div>
      <p>Edit your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={actionData?.fieldErrors?.name || undefined}
              aria-describedby={
                actionData?.fieldErrors?.name ? "name-error" : undefined
              }
              value={loaderData?.joke?.name}
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={
                actionData?.fields?.content || loaderData?.joke?.content
              }
              name="content"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) || undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Save
          </button>
        </div>
      </Form>
    </div>
  );
};

export default EditJoke;

export const ErrorBoundary = () => (
  <div className="error-container">Something unexpected went wrong.</div>
);

export const CatchBoundary = () => {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
};
