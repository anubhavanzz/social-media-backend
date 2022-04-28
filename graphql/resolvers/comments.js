const { AuthenticationError, UserInputError } = require('apollo-server');

const Post = require('./../../models/Post');
const checkAuth = require('../../util/check-auth');

module.exports = {
    Mutation: {
        async createComment(_, { postId, body }, context) {
            const { username } = checkAuth(context);
            if (body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }
            try {
                const post = await Post.findById(postId);
                if (post) {
                    post.comments.unshift({
                        body,
                        username,
                        createdAt: new Date().toISOString()
                    });
                    await post.save();
                    return post;
                } else {
                    throw new UserInputError('Post not found');
                }

            } catch (err) {
                throw new Error(err);
            }
        },
        async deleteComment(_, { postId, commentId }, context) {
            const { username } = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                if (post) {
                    const indexToBeRemoved = post.comments.findIndex(comment => comment.id === commentId);
                    if (post.comments[indexToBeRemoved].username === username) {
                        post.comments.splice(indexToBeRemoved, 1);
                        await post.save();
                        return post;
                    }
                    else throw new AuthenticationError('Action not allowed!');
                }
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}