import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import winston from "winston";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { auth } from "express-oauth2-jwt-bearer";

const port = `${process.env.PORT}`;

const jwtCheck = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  tokenSigningAlg: process.env.TOKEN_SIGNING_ALG,
});

/*
  General use
*/
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: false }));
app.use(jwtCheck);

/*
  Loggers
*/
export const logger = winston.createLogger({
  level: "info",
  transports: [
    // write errors to console
    new winston.transports.Console({
      format: winston.format.simple(),
      level: "info",
    }),
  ],
});

const originLogger = function (req, res, next) {
  logger.log({
    level: "info",
    message: `origin: ${req.headers.origin}, referrer: ${req.headers.referer}, request: ${req.method} ${req.url}`,
  });
  next();
};
app.use(originLogger);

/*
  Limiter for dDOS attack mitigation
*/
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//   standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
//   // store: ... , // Redis, Memcached, etc. See below.
// });
// app.use(limiter);

/* 
  CORS
*/
const corsOptionsDev = {
  credentials: true,
  origin: "http://localhost:5173",
  methods: ["POST", "GET", "OPTIONS"],
};

const corsOptionsProd = {
  credentials: true,
  allowedHeaders: ["Accept", "Content-Type"],
  origin: "https://24.162.65.75",
  methods: ["POST", "GET", "OPTIONS"],
};

app.use(cors(corsOptionsProd));

/*
  Helmet for headers and attack mitigation
*/
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         "default-src": ["'self'"],
//         "base-uri": ["'self'"],
//         "font-src": ["'self'"],
//         "form-action": ["'self'"],
//         "frame-ancestors": ["'self'"],
//         "img-src": ["'self'"],
//         "object-src": ["'none'"],
//         "script-src": ["'self'"],
//         "script-src-attr": ["'none'"],
//         "style-src": ["'self'"],
//       },
//       //reportOnly: true;
//     },
//   })
// );

app.post("/api/external", async (req, res, err) => {
  console.log("in...");
  //  const token = await utils.generateCSRFToken(req.session.id);
  //  req.session.csrfToken = token;
  const token = "Yo mama!";
  console.log("headers: ", req.headers);
  try {
    res.status(200).send({ csrfToken: token });
  } catch (err) {
    console.log("Error is - ", err);
    res.status(500).send({ message: "fail", err: err.message });
  }
});

app.listen(port, () => {
  logger.log({
    level: "info",
    message: `Server started.  Listening on port ${port}`,
  });
});
