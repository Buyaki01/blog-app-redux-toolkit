import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { sub } from "date-fns"
import { apiSlice } from "../api/apiSlice"

const postsAdapter = createEntityAdapter({
  sortComparer: (a,b) => b.date.localeCompare(a.date)
})

const initialState = postsAdapter.getInitialState()

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getPosts: builder.query({
      query: () => '/posts',
      transformResponse: responseData => {
        let min = 1
        const loadedPosts = responseData.map(post => {
          if (!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString()
          if (!post?.reactions) post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post
        })
        return postsAdapter.setAll(initialState, loadedPosts)
      },
      providesTags: (result, error, arg) => [
        //result comes from the server
        { type: 'Post', id: "LIST" },
        ...result.ids.map(id => ({ type: 'Post', id })) //For each post ID, a cache tag object is created with the type 'Post' and the respective ID
      ]
    }),
    getPostsByUserId: builder.query({
      query: id => `/posts/?userId=${id}`,
      transformResponse: responseData => {
        let min = 1
        const loadedPosts = responseData.map(post => {
          if (!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString()
          if (!post?.reactions) post.reactions = {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post
        })
        return postsAdapter.setAll(initialState, loadedPosts)
      },
      providesTags: (result, error, arg) => {
        console.log(result)
        return [
          ...result.ids.map(id => ({ type: 'Post', id }))
        ]
      }
    }),
    addNewPost: builder.mutation({
      //initialPost refers to the data entered by the user in the form when creating a new post
      query: initialPost => ({
        url: '/posts',
        method: 'POST',
        body: {
          ...initialPost,
          userId: Number(initialPost.userId),
          date: new Date().toISOString(),
          reactions: {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
        }
      }),
      //When the cache tag is invalidated, it indicates that the data in the cache associated with the invalidated tag is no longer valid or up to date. 
      //As a result, the cached list of posts, identified by the tag 'Post' with ID "LIST", will be cleared or updated to reflect the changes made by the mutation. 
      //This ensures that the next time you query the list of posts, the latest data will be fetched from the server and stored in the cache.
      invalidatesTags: [
        { type: 'Post', id: "LIST" }
      ]
    }),
    updatePost: builder.mutation({
      query: initialPost => ({
        url: `/posts/${initialPost.id}`,
        method: 'PUT',
        body: {
          ...initialPost,
          date: new Date().toISOString()
        }
      }),
      //ensures that the cache tag associated with the updated post is invalidated.
      //arg: It represents the input or arguments passed to the function by the user,specifying what needs to be performed or fetched
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.id }
      ]
    })
  })
})

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
} = extendedApiSlice

//Returns the query result object
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select()

//Creates memoized selector
const selectPostsData = createSelector(
  selectPostsResult,
  postsResult = postsResult.data //Normalized state object with ids and entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => selectPostsData(state) ?? initialState) //nullish operator: if selectPostsData(state) is empty return initialState
