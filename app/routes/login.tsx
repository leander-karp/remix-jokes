import {
  ActionFunction,
  json,
  Link,
  LinksFunction,
  useActionData,
  useSearchParams,
} from "remix";
import {
  createUserSession,
  login,
  register,
  userExists,
} from "~/utils/session.server";
import stylesUrl from "../styles/login.css";

type LoginData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    username: string;
    password: string;
    loginType: string;
  };
};

const badRequest = (data: LoginData) => json(data, { status: 401 });

const validateUsername = (name: string) =>
  name.length < 3 ? "Username is too short" : undefined;
const validatePassword = (password: string) =>
  password.length < 6 ? "Password is too short" : undefined;

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/jokes";

  if (
    typeof loginType !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const usernameValidationResult = validateUsername(username);
  const passwordValidationResult = validatePassword(password);
  if (passwordValidationResult || usernameValidationResult)
    return badRequest({
      fieldErrors: {
        username: usernameValidationResult,
        password: passwordValidationResult,
      },
    });
  else if (loginType == "login") {
    const user = await login({ username, password });
    if (!user) {
      return badRequest({
        formError: `Username/Password combination is incorrect`,
      });
    }
    return createUserSession(user.id, redirectTo);
  } else if (loginType == "register") {
    if (await userExists(username)) {
      return badRequest({
        formError: `User with username ${username} already exists`,
      });
    }

    const user = await register({ username, password });

    if (!user) {
      return badRequest({
        formError: `Something went wrong trying to create a new user.`,
      });
    }
    return createUserSession(user.id, redirectTo);
  } else
    return badRequest({
      formError: "Invalid form provided",
    });
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<LoginData>();

  return (
    <div className="container">
      <h1>Login</h1>
      <form
        method="post"
        className="content"
        aria-describedby={
          actionData?.formError ? "form-error-message" : undefined
        }
        data-light
      >
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <fieldset>
          <legend className="sr-only">Login or Register?</legend>
          <label>
            <input
              type="radio"
              name="loginType"
              defaultChecked={
                actionData?.fields?.loginType === undefined ||
                actionData?.fields?.loginType === "login"
              }
              value="login"
            />
            Login
          </label>
          <label>
            <input
              type="radio"
              name="loginType"
              value="register"
              defaultChecked={actionData?.fields?.loginType === "register"}
            />{" "}
            Register
          </label>
        </fieldset>
        <div>
          <label htmlFor="username-input">Username</label>
          <input
            type="text"
            id="username-input"
            name="username"
            defaultValue={actionData?.fields?.username}
            aria-invalid={Boolean(actionData?.fieldErrors?.username)}
            aria-describedby={
              actionData?.fieldErrors?.username ? "username-error" : undefined
            }
          />
          {actionData?.fieldErrors?.username && (
            <p
              className="form-validation-error"
              role="alert"
              id="username-error"
            >
              {actionData.fieldErrors.username}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            name="password"
            defaultValue={actionData?.fields?.password}
            type="password"
            aria-invalid={
              Boolean(actionData?.fieldErrors?.password) || undefined
            }
            aria-describedby={
              actionData?.fieldErrors?.password ? "password-error" : undefined
            }
          />
          {actionData?.fieldErrors?.password && (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.password}
            </p>
          )}
        </div>

        <div id="form-error-message">
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData?.formError}
            </p>
          ) : null}
        </div>
        <button type="submit" className="button">
          Submit
        </button>
      </form>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
