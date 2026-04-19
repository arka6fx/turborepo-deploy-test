import express from "express";
import { prisma } from "@repo/prisma";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/postsignup", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email) {
    res.status(400).json({ message: "email is required" });
    return;
  }

  try {
    const user = await prisma.user.create({
      data: { email, name, password },
    });

    res.status(201).json({ user });
  } catch {
    res.status(500).json({ message: "failed to create user" });
  }
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`http-server listening on ${port}`);
});
