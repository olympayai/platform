import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import { AppError } from "./lib/errors.js";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  }
  console.error(err);
  return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
});

export default app;
