/**
 * @type {import('../utils/schemas/Bookmark').BookmarkModel}
 */
const Bookmark = require('../utils/schemas/Bookmark')

/**
 * @type {import('mixpanel')}
 */
 const mixpanel = require('../utils/auth/mixpanelConnect')

/**
 * A function that fetches bookmarks of a particular user.
 *
 * @param {String} profile_id
 */
const fetchBookmarks = async (profile_id) => {
    try {
        mixpanel.track('Fetch bookmarks', {
            distinct_id: profile_id,
        })

        return await Bookmark.find({ profile_id: profile_id }).lean().exec()
    } catch (error) {
        throw new Error('Error while fetching bookmarks.', {
            statusCode: 502,
            error: error,
        })
    }
}

module.exports = fetchBookmarks
