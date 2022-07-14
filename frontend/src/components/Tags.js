import React, { useContext, useEffect, useState } from 'react'
import { IoMdArchive } from 'react-icons/io'
import { MdSystemUpdateAlt } from 'react-icons/md'
import { BookmarksContext } from '../../contexts/BookmarksContext'

const tags = () => {
	const { fetchTags, activeTag, setActiveTag, bookmarks } =
		useContext(BookmarksContext)
	const [tags, setTags] = useState([])

	useEffect(() => {
		importTags()
		console.log(activeTag)
	}, [bookmarks])

	const importTags = async () => {
		const tempTags = await fetchTags()
		setTags([{ tag: 'all', _id: 'all' }, ...tempTags])
		setActiveTag({ tag: 'all', _id: 'all' })
	}

	const handleClick = (tag) => {
		setActiveTag(tag)
	}
	const { importBookmarks } = useContext(BookmarksContext)
	return (
		<div className='flex flex-col justify-between items-start min-h-eigthy overflow-hidden w-full text-white flex-grow '>
			<div className='text-xl px-8 py-10'>
				<h1 className='text-xl font-semibold tracking-wider'>TAGS</h1>
			</div>
			<div className='flex text-md justify-between  w-full flex-col items-start flex-grow overflow-hidden'>
				<div className='flex flex-col items-start w-full px-4 overflow-y-scroll overflow-x-hidden'>
					{tags &&
						tags.map((tag) => {
							console.log('tag', tag.tag)
							return (
								<button
									key={tag._id}
									onClick={() => handleClick(tag)}
									className={
										'my-1 pl-5 py-2 rounded-md w-full flex justify-start ' +
										(activeTag?._id === tag?._id
											? 'bg-hovertagColor'
											: 'bg-transparent hover:bg-hovertagColor hover:bg-opacity-50')
									}
								>
									#{tag.tag}
								</button>
							)
						})}
				</div>

				<div className='flex text-md w-full mt-2 flex-col items-center'>
					<button
						className='flex items-center justify-center py-4 border-t border-[#d8d8d840] hover:bg-gray-900 hover:bg-opacity-10 w-full'
						onClick={importBookmarks}
					>
						<MdSystemUpdateAlt className='mr-2 text-xl' />
						Import
					</button>
					<button
						className='flex items-center justify-center py-4 border-t border-[#d8d8d840] hover:bg-gray-900 hover:bg-opacity-10 w-full'
						onClick={() =>
							(window.location.href = '/app/dashboard/archive')
						}
					>
						<IoMdArchive className='mr-2 text-xl' />
						Archive
					</button>
				</div>
			</div>
		</div>
	)
}

export default tags
