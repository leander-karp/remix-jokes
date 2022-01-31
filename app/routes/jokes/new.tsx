import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  useActionData,
  useCatch,
} from "remix";
import { redirect } from "remix";
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

export const action: ActionFunction = async ({ request }) => {
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

  const joke = await db.joke.create({
    data: { ...fields, jokesterId: userId },
  });
  return redirect(`/jokes/${joke.id}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return {};
};

const NewJoke = () => {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
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
              defaultValue={actionData?.fields?.content}
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
            Add
          </button>
        </div>
      </Form>
    </div>
  );
};

export default NewJoke;

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
