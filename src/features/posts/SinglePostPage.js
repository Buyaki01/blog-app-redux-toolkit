import { useSelector } from "react-redux"
import { selectPostById } from "./postsSlice"
import PostAuthor from "./PostAuthor"
import TimeAgo from "./TimeAgo"
import ReactionButtons from "./ReactionButtons"

const SinglePostPage = () => {
  // Retrieve postId

  const post = useSelector((state) => selectPostById(state, postId))
  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <p className="postCredit">
        <PostAuthor />
        <TimeAgo />
      </p>
      <ReactionButtons post={post} />
    </article>
  )
}

export default SinglePostPage
