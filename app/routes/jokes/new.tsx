import type { ActionFunction } from "remix";
import { redirect } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const name = body.get("name");
  const content = body.get("content");

  if (typeof name !== "string" || typeof content !== "string")
    throw new Error("Invalid form submitted");

  const joke = await db.joke.create({
    data: { name, content },
  });
  return redirect(`/jokes/${joke.id}`);
};

const NewJoke = () => (
  <div>
    <p>Add your own hilarious joke</p>
    <form method="post">
      <div>
        <label>
          Name: <input type="text" name="name" />
        </label>
      </div>
      <div>
        <label>
          Content: <textarea name="content" />
        </label>
      </div>
      <div>
        <button type="submit" className="button">
          Add
        </button>
      </div>
    </form>
  </div>
);

export default NewJoke;
