import { Context } from "@oak/oak";
import { hash, verify } from "@ts-rex/bcrypt";
import { encode } from "@gz/jwt";
import db from "../db.ts";

export async function login(ctx: Context) {
  const { username, password }: { username: string; password: string } =
    await ctx.request.body.json();

  const { data: user, error } = await db
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !user) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Username not found." };
    return;
  }

  const isPasswordValid = verify(password, user.password_hash);
  if (!isPasswordValid) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Password is incorrect." };
    return;
  }

  const payload = { username: user.username, ucid: user.ucid };

  const jwt = await encode(payload, Deno.env.get("JWT_SECRET")!, {
    algorithm: "HS256",
  });

  ctx.response.status = 200;
  ctx.response.body = { token: jwt };
}

export async function register(ctx: Context) {
  const {
    username,
    ucid,
    email,
    password,
  }: { username: string; ucid: string; email: string; password: string } =
    await ctx.request.body.json();

  const { data: user, error } = await db
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (user && !error) {
    ctx.response.status = 409;
    ctx.response.body = {
      message: "Account with that username already exists.",
    };
    return;
  }

  const { data: ucidUser, error: ucidError } = await db
    .from("users")
    .select("*")
    .eq("ucid", ucid)
    .single();

  if (ucidUser && !ucidError) {
    ctx.response.status = 409;
    ctx.response.body = { message: "Account with that UCID already exists." };
    return;
  }

  const { data: mailUser, error: mailError } = await db
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (mailUser && !mailError) {
    ctx.response.status = 409;
    ctx.response.body = { message: "Account with that email already exists." };
    return;
  }

  const hashedPassword = hash(password);

  const { error: insertError } = await db.from("users").insert([
    {
      ucid,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: hashedPassword,
    },
  ]);

  if (insertError) {
    ctx.response.status = 500;
    ctx.response.body = { message: "User registration failed" };
    return;
  }

  ctx.response.status = 201;
  ctx.response.body = { message: "User registered successfully" };
}
