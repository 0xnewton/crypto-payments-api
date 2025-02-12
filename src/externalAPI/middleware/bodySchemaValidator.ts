import { logger } from "firebase-functions";
import {
  APIRequest,
  APIResponse,
  APINextFunction,
  BodySchemaValidatorMiddleware,
} from "../types";
import { ZodError } from "zod";
import { APIError } from "../errors";

export const bodySchemaValidator: BodySchemaValidatorMiddleware =
  (validator) => (req: APIRequest, res: APIResponse, next: APINextFunction) => {
    logger.info("Request Body Schema Check Middleware");
    try {
      // Validate the input
      validator.parse(req.body);
    } catch (err: any) {
      if (err instanceof ZodError) {
        logger.info("Invalid input", {
          errors: err.errors,
          message: err.message,
        });

        throw new APIError(400, {
          success: false,
          message: "Invalid request body",
          errors: err.errors.map((e) => ({
            field: e.path.join("."), // Convert array path to a dot-separated string
            message: e.message,
          })),
        });
      }

      // Handle unexpected errors
      logger.error("Unexpected validation error", {
        message: err.message,
      });
      throw new APIError(500, {
        success: false,
        message: "Internal Server Error",
      });
    }

    return next();
  };
