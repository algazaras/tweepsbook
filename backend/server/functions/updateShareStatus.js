/**
 * @type {import('../utils/schemas/Bookmark').BookmarkModel}
 */
const Bookmark = require('../utils/schemas/Bookmark')

const mixpanel = require('../utils/auth/mixpanelConnect')

const findBookmarkOwner = require('./findBookmarkOwner')

/**
 * A function that updates the share status of a bookmark.
 *
 * @param {String} bookmarkId
 * @param {Boolean} status
 * @param {String} profile_id
 */
const updateShareStatus = async (
	bookmarkId = undefined,
	status,
	profile_id
) => {
	try {
		if (bookmarkId) {
			const ownerId = await findBookmarkOwner(bookmarkId)

			if (ownerId !== profile_id)
				throw new Error(
					'You are not allowed to update a bookmark since you are not the owner of the bookmark.'
				)

			mixpanel.track('Update share status', {
				distinct_id: profile_id,
				bookmark_id: bookmarkId,
			})

			return await Bookmark.findByIdAndUpdate(
				bookmarkId,
				{ share: status },
				{ new: true }
			)
				.lean()
				.exec()
		}
	} catch (error) {
		throw new Error(error)
	}
}

module.exports = updateShareStatus
