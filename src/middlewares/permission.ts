import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

interface DecodedToken {
  username: string;
  permissions: {
    [entity: string]: string[];
  };
}

export const checkPermissions = (entity: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      const permissions = decoded.permissions;

      if (!permissions || !permissions[entity] || !permissions[entity].includes(action)) {
        return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };
};
