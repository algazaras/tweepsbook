const tokenFind = require('./tokenFind'),
    twtrUserClient = require('./twtrUserClient')

/**
 * A function that creates a Twitter client for a particular user.
 *
 * @param {String} profile_id
 */
const createTwtrUserClient = async (profile_id) => {
    try {
        const { refreshToken } = await tokenFind(profile_id)

        return twtrUserClient(profile_id, refreshToken)
    } catch (error) {
        throw new Error('Error while creating a user client for Twitter.', {
            statusCode: 500,
            error: error,
        })
    }
}

module.exports = createTwtrUserClient
