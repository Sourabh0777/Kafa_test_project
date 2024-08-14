import bcrypt from "bcrypt"; // Make sure to install bcrypt for password hashing
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../../../lib/db";
import { producer } from "../../../lib/kafkaConfig";
import { initializeProducer } from "../../../lib/kafkaProducer";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signInSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify(result.error.format()), {
        status: 400,
      });
    }

    const { email, password } = result.data;
    await initializeProducer();

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
      });
    }
    await prisma.user.update({
      where: { email },
      data: { loginStatus: true },
    });
    await producer.send({
      topic: "user",
      messages: [
        {
          value: JSON.stringify({
            email,
            status: "login",
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    const JWT_SECRET = process.env.JWT_SECRET || "Hello";
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h", // Adjust the expiration time as needed
    });
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=3600` // Adjust cookie options as needed
    );
    return new Response(
      JSON.stringify({ message: "Sign-in successful", email }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Error during sign-in:", error);
    return new Response("Error Occurred", { status: 500 });
  }
}
