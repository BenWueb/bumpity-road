import Link from "next/link";
import CloudImage from "@/components/CloudImage";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Post = {
  id: string;
  title: string;
  content: string;
  slug: string;
  userEmail: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    posts: Post[];
  };
  createdAt: string;
  updatedAt?: string;
  comments?: [];
  images?: {
    id: string;
    imageId: string;
    postId: string;
    createdAt: string;
  }[];
};

const Page = async () => {
  const res = await fetch("http://localhost:3000/api/posts");
  const posts: Post[] = await res.json();
  console.log("Posts:", posts);

  return (
    <div>
      <div className="flex gap-4 m-auto w-full max-w-5xl">
        {posts.map((post: Post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <CardAction>Card Action</CardAction>
              </CardHeader>
              <CardContent>
                {post.images && post.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <CloudImage images={post.images} />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <p>
                  by {post.user.name} on{" "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
