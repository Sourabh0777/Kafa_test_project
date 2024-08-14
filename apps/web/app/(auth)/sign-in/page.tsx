"use client";
import axios from "axios";
import { useState } from "react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signInSchema.safeParse({ email, password });

    if (!result.success) {
      const formErrors = result.error.format();
      setErrors({
        email: formErrors.email?._errors[0],
        password: formErrors.password?._errors[0],
      });
    } else {
      setErrors({});
      setIsSubmitting(true);
      try {
        const response = await axios.post("/api/sign-in", {
          email,
          password,
        });
        console.log("Sign in successful:", response.data);
      } catch (error) {
        console.error("Sign up error:", error);
        // Handle error response from the API (e.g., show error message)
      } finally {
        setIsSubmitting(false);
        setEmail("");
        setPassword("");
      }
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Sign In</h1>

        <div style={styles.inputContainer}>
          <label style={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          {errors.email && <p style={styles.error}>{errors.email}</p>}
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {errors.password && <p style={styles.error}>{errors.password}</p>}
        </div>

        <button type="submit" style={styles.button}>
          Sign In
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f5f5f5",
  },
  form: {
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "24px",
    fontSize: "24px",
    textAlign: "center" as const,
    color: "#333333",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    color: "#666666",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #cccccc",
    outline: "none",
    transition: "border-color 0.3s",
  },
  error: {
    marginTop: "8px",
    color: "red",
    fontSize: "12px",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};
