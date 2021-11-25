import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { isCelebrateError } from "celebrate";
import { errorResponse } from "./helpers/response.helper";
import appRoutes from "./routes";

const app = express();
app.use(helmet());
app.use(express.json());
// app.use(cors({origin: 'http://localhost:3000' || process.env.ADMIN_FRONTEND}));

appRoutes(app);


app.use("*", (req, res) => {
  return errorResponse(res, "route not found", 404);
});

app.use((error: any, _req: Request, res: Response, next: any) => {
  if (isCelebrateError(error)) {
    const errorMessage =
      error.details.get("body") ||
      error.details.get("query") ||
      error.details.get("params");
    const message = errorMessage!.message.replace(/"/g, "");
    return errorResponse(res, message);
  }
  next();
});

export default app;
