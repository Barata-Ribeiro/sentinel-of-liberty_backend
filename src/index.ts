// Dependency Imports
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import errorHandler from "errorhandler";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import methodOverride from "method-override";
import logger from "morgan";
import path from "path";
import favicon from "serve-favicon";

// Route Imports
import articlesRoutes from "./router/articlesRoutes";
import authRoutes from "./router/authRoutes";
import commentsRoutes from "./router/commentsRoutes";
import homeRoutes from "./router/homeRoutes";
import suggestionsRoutes from "./router/suggestionsRoutes";
import usersRoutes from "./router/usersRoutes";

// Database Import
import { AppDataSource } from "./database/data-source";

// Middleware Imports
import errorMiddleware from "./middleware/ErrorMiddleware";

// Database Type Check
if (AppDataSource.options.type !== "postgres")
    throw new Error("Invalid DB_TYPE: Only 'postgres' is supported.");

const startServer = async () => {
    try {
        // Database Initialization
        await AppDataSource.initialize();

        // Express App Initialization
        let app = express();
        const PORT = process.env.PORT || 3000;
        let ENV = process.env.NODE_ENV || "development";

        // Express App Middlewares
        app.set("port", PORT);
        app.set("trust proxy", 1);
        const corsOptions: cors.CorsOptions = {
            origin: true,
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            allowedHeaders: [
                "Accept",
                "Authorization",
                "Content-Type",
                "X-Requested-With"
            ],
            credentials: true
        };
        app.use(cors(corsOptions));
        app.use(favicon(path.join(__dirname, "..", "public", "favicon.ico")));
        app.use(logger("dev"));
        app.use(methodOverride());
        app.use(
            session({
                resave: true,
                saveUninitialized: true,
                secret: process.env.SESSION_SECRET_KEY || "test"
            })
        );
        app.use(cookieParser());
        app.use(helmet({ crossOriginResourcePolicy: false }));
        app.use(helmet.noSniff());
        app.use(helmet.xssFilter());
        app.use(helmet.ieNoOpen());
        app.disable("x-powered-by");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(compression({ level: 6, threshold: 100 * 1000 }));
        app.use(express.static(path.join(__dirname, "public")));

        // Routes
        app.use("/api/v1/home", homeRoutes);
        app.use("/api/v1/auth", authRoutes);
        app.use("/api/v1/users", usersRoutes);
        app.use("/api/v1/suggestions", suggestionsRoutes);
        app.use("/api/v1/articles", articlesRoutes);
        app.use("/api/v1/articles", commentsRoutes);

        app.use(errorMiddleware);

        if (app.get("env") === "development") app.use(errorHandler());

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}, enjoy!`);
            if (ENV === "production")
                console.log("Server is running in production mode.");
            else console.log(`Server in running in ${ENV} mode.`);
        });
    } catch (error) {
        console.error("Error while starting the server:", error);
    }
};

startServer().catch((err) => console.error("Failed to start the server:", err));
