import { Application } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";

import { router as authRouter } from "./routes/auth.routes.ts";
import { router as uploadRouter } from "./routes/upload.routes.ts";
import { router as profileRouter } from "./routes/profile.routes.ts";
import { router as listingsRouter } from "./routes/listings.routes.ts";
import { router as chatsRouter } from "./routes/chat.routes.ts";
import { router as notificationsRouter } from "./routes/notification.routes.ts";

const app = new Application();

app.use(oakCors());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

app.use(uploadRouter.routes());
app.use(uploadRouter.allowedMethods());

app.use(profileRouter.routes());
app.use(profileRouter.allowedMethods());

app.use(listingsRouter.routes());
app.use(listingsRouter.allowedMethods());

app.use(listingsRouter.routes());
app.use(listingsRouter.allowedMethods());

app.use(notificationsRouter.routes());
app.use(notificationsRouter.allowedMethods());

app.use(chatsRouter.routes());
app.use(chatsRouter.allowedMethods());

console.log("Starting server on http://localhost:3000");
await app.listen({ port: 3000 });
