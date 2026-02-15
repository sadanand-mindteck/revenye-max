import { FastifyReply, FastifyRequest } from "fastify";
import { tokenBlacklist } from "../utils/helper";

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    // Check if the token is in the blacklist
    if (tokenBlacklist.has(token)) {
      return reply
        .status(401)
        .send({ message: "Token is invalidated. Please log in again." });
    }

    const decoded = await request.jwtVerify<{ id: number; name: string; roles: string[] }>();
    request.user = decoded;
  } catch (error) {
    reply.status(401).send({ message: "Unauthorized" });
  }
};
