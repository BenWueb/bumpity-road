"use client";
import { useState } from "react";
import { prisma } from "@/utils/prisma";
import Form from "next/form";
import { useSession } from "next-auth/react";

interface FormData {
  title: string;
  content: string;
  slug: string;
  author: string;
  published: boolean;
}

export default function Blog() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    slug: "",
    author: "",
    published: true,
  });

  const { data: session } = useSession();
  console.log("Session data:", session);

  const submitBlogPost = async () => {
    if (!session?.user?.email) {
      console.log("No user email found in session.");
      return;
    }
    const postData = {
      title: formData.title,
      content: formData.content,
      slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
      author: {
        connect: { email: session.user.email as string },
      },
      published: formData.published,
    };
    try {
      await prisma.post.create({
        data: postData,
      });
    } catch (error) {
      console.log("Error creating post:", error);
    }
  };
  return (
    <div>
      <Form onSubmit={submitBlogPost} action="/">
        <label htmlFor="title" />
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Title"
          required
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <label htmlFor="content" />
        <textarea
          id="content"
          name="content"
          placeholder="Content"
          required
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
        ></textarea>
        <button>submit</button>
      </Form>
    </div>
  );
}
