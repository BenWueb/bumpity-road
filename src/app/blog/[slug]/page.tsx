import { GetPost } from "@/actions/GetPost";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const res = await GetPost(slug);
  const post = await res.json();

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-semibold">Post not found</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 m-auto w-full max-w-5xl">
        <div key={post.id} className="p-4 border rounded-lg">
          <h1 className="text-2xl font-semibold">{post.title}</h1>
          <p className="text-sm text-gray-500">
            by {post.user.name} on{" "}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-2">{post.content}</p>
        </div>
      </div>
    </div>
  );
}
