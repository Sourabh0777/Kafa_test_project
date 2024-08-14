import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../../../lib/db";
import { producer } from "../../../lib/kafkaConfig";
import { initializeProducer } from "../../../lib/kafkaProducer";
const saltRounds = 10;

async function hashPassword(password: string): Promise<string> {
  // Generate a salt and hash the password
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify(result.error.format()), {
        status: 400,
      });
    }
    await initializeProducer();

    const { username, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User already registered" }),
        { status: 400 }
      );
    }
    const hashedPassword = await hashPassword(password);
    console.log("🚀 ~ POST ~ hashedPassword:", hashedPassword)

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    await producer.send({
      topic: 'user',
      messages: [
        {
          value: JSON.stringify({
            username,
            email,
            status: 'registered',
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });

    return new Response(
      JSON.stringify({ message: "User registered successfully" })
    );

    // return new Response(
    //   JSON.stringify({
    //     message: "User registered successfully",
    //     user: { username, email },
    //   }),
    //   { status: 201 }
    // );
  } catch (error) {
    console.error("Error during sign-up:", error);
    return new Response("Error Occurred", { status: 500 });
  }
}
