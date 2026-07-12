export const THREADS_QUERY = `query ($animeId: Int, $page: Int) {
  Page(page: $page, perPage: 25) {
    pageInfo { currentPage hasNextPage }
    threads(mediaCategoryId: $animeId, categoryId: 5, sort: ID_DESC) {
      id title replyCount viewCount likeCount isLiked createdAt siteUrl
      user { id name avatar { large medium } }
    }
  }
}`

export const COMMENTS_QUERY = `query ($threadId: Int, $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { currentPage hasNextPage nextPage }
    threadComments(threadId: $threadId) {
      id comment createdAt likeCount isLiked
      user { id name avatar { large medium } }
      childComments
    }
  }
}`

export const SEARCH_QUERY = `query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage }
    media(search: $search, type: ANIME) {
      id idMal title { romaji english native } synonyms format episodes
      season seasonYear startDate { year }
      coverImage { large medium }
      nextAiringEpisode { airingAt episode }
    }
  }
}`

export const SAVE_COMMENT_MUTATION = `mutation ($id: Int, $threadId: Int, $parentCommentId: Int, $comment: String) {
  SaveThreadComment(id: $id, threadId: $threadId, parentCommentId: $parentCommentId, comment: $comment) {
    id comment likeCount isLiked createdAt parentCommentId
    user { id name avatar { large medium } }
    childComments
  }
}`

export const TOGGLE_LIKE_MUTATION = `mutation ($id: Int, $type: LikeableType) {
  ToggleLikeV2(id: $id, type: $type) {
    ... on ThreadComment { id likeCount isLiked }
    ... on Thread { id likeCount isLiked }
  }
}`
