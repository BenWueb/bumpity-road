"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { CreatePost } from "@/actions/CreatePost";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface FormData {
  title: string;
  content: string;
}

export default function Blog() {
  const { data: session } = useSession();
  console.log("Session data:", session);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
  });

  return (
    <div>
      <form
        className="flex flex-col gap-2 m-auto w-full max-w-md"
        action={CreatePost}
      >
        <label htmlFor="title" />
        <Input
          type="text"
          id="title"
          name="title"
          placeholder="Title"
          required
          onChange={(e) =>
            setFormData({
              ...formData,
              title: e.target.value,
            })
          }
        />
        <label htmlFor="content" />
        <Textarea
          id="content"
          name="content"
          placeholder="Content"
          required
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
        ></Textarea>
        <Button className="cursor-pointer mt-2  ">submit</Button>
      </form>
    </div>
  );
}
