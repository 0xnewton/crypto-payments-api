import { APIResponseErrorPayload } from "./types";

export class APIError extends Error {
  name = "APIError";
  code = 500;
  payload: APIResponseErrorPayload;

  constructor(code: number, payload: APIResponseErrorPayload) {
    super(payload.message); // Pass the message to the parent Error class
    this.code = code;
    this.payload = payload;

    // Set the prototype explicitly to ensure instanceof works correctly
    Object.setPrototypeOf(this, APIError.prototype);
  }
}
