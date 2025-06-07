import Link from "next/link";
import CloudImage from "@/components/CloudImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Search from "@/components/Search";

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

  return (
    <div>
      <Link href="/add-blog-post">
        <Button className="cursor-pointer">Add Post</Button>
      </Link>

      <Search posts={posts} />

      <div className="flex gap-4 m-auto w-full max-w-5xl">
        {posts.map((post: Post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="flex-1 min-w-250px max-w-xs  align-stretch"
          >
            <div className="w-full h-full  rounded-lg flex flex-col">
              <div>
                {post.images && post.images.length > 0 && (
                  <div className="">
                    <CloudImage images={post.images} single />
                  </div>
                )}
                <h2 className="text-xl font-bold">{post.title}</h2>
                <div className="text-sm text-gray-600">
                  <p>
                    by {post.user.name} on{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>Card Action</div>
              </div>
              <div className="p-4 flex-grow"></div>
              <div className="p-4"></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
