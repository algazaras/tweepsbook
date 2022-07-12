import { useEffect, useState, useContext } from 'react'
import { AiOutlineDown } from 'react-icons/ai'
import { AiOutlinePlus } from 'react-icons/ai'
import Tags from '../../src/components/Tags'
import BookmarkCards from '../../src/components/BookmarkCards'
import DashNavbar from '../../src/components/DashNavbar'
import { BookmarksProvider } from '../../contexts/BookmarksContext'
import { BookmarksContext } from '../../contexts/BookmarksContext'
import { Router, useRouter } from 'next/router'
import Settings from './settings'
import { UserContext } from '../../contexts/UserContext'
import Lottie from 'react-lottie-player'
import Loader from '../../src/components/loader.json';

export default function dashboard({ children }) {
	const router = useRouter()
	const { user, setUser, getUser } = useContext(UserContext)
	const [menuActive, setMenuActive] = useState(false)
	const {
		bookmarks,
		setBookmarks,
		importBookmarks,
		fetchBookmarks,
		activeTag,
	} = useContext(BookmarksContext)
	const menuClick = () => {
		setMenuActive(!menuActive)
	}

	useEffect(() => {
		const verifyUser = async () => {
			try {
				await getUser()
			} catch (err) {
				router.push('/')
			}
		}
		verifyUser()
		fetchBookmarks()
	}, [])
	return (
		<div>
			{router.query.settings === 'true' && <Settings />}
			<div className='overflow-hidden scroll-smooth fixed w-full'>
				<DashNavbar search={true} />

				<div className='flex overflow-hidden h-[88vh]'>
					<div className='flex flex-col h-[88vh] items-start bg-dark-blue pt-10 w-44 fixed'>
						<Tags />
					</div>

					<div className='flex flex-col my-content w-full'>
						<div className='flex border-b items-center justify-between p-2 '>
							<h1 className='pl-2 font-bold text-3xl font-header'>
								{activeTag ? (activeTag.tag[0] == "#" ? <>{activeTag.tag}</> : <>#{activeTag.tag}</>) : (<><Lottie loop
									animationData={Loader}
									play
									className='w-10 h-10 mx-auto' /></>)}
							</h1>
							<div className='flex items-center'>
								<button className='flex text-xs h-8 items-center p-2 mx-3 justify-around opacity-80 border  rounded-xl'>
									Sort By <AiOutlineDown className='ml-2' />
								</button>
								<button className='flex text-xs h-8 items-center p-2 mx-3 justify-around opacity-80 border rounded-xl'>
									Add Filter <AiOutlinePlus className='ml-2' />
								</button>
							</div>
						</div>
						<div className='overflow-y-scroll'>
							{children || <BookmarkCards />}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
