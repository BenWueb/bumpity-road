import Link from "next/link";

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
};

const Page = async () => {
  const res = await fetch("http://localhost:3000/api/posts");
  const posts: Post[] = await res.json();

  return (
    <div>
      <div className="flex flex-col gap-4 m-auto w-full max-w-5xl">
        {posts.map((post: Post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <div className="p-4 border rounded-lg">
              <h1 className="text-2xl font-semibold">{post.title}</h1>
              <p className="text-sm text-gray-500">
                by {post.user.name} on{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
