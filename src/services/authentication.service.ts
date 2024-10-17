import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { Buffer } from "buffer";
import { notFound } from "../error/NotFoundError";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export class AuthenticationService {
  public async authenticate(
    username: string,
    password: string
  ): Promise<string> {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw notFound("User");
    }

    const decodedPassword = Buffer.from(user.password, "base64").toString(
      "utf-8"
    );

    if (password === decodedPassword) {

      let permissions;
      switch (username) {
        case "admin":
          permissions = {
            author: ["read", "write", "delete"],
            book: ["read", "write", "delete"],
            bookCollection: ["read", "write", "delete"],
          };
          break;
        case "gerant":
          permissions = {
            author: ["read", "write"],
            book: ["read", "write"],
            bookCollection: ["read"],
          };
          break;
        case "utilisateur":
          permissions = {
            author: ["read"],
            book: ["read"],
            bookCollection: ["read"],
          };
          break;
        default:
          permissions = {};
      }

      const token = jwt.sign({ username: user.username, permissions: permissions }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return token;
    } else {
      let error = new Error("Wrong password");
      (error as any).status = 403;
      throw error;
    }
  }
}

export const authService = new AuthenticationService();