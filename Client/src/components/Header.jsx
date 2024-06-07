import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AiOutlineSearch } from 'react-icons/ai'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import { logout } from '../store/userSlice';

export default function Header() {
    const path = useLocation().pathname;
    const { user } = useSelector(state => state.user);
    const { theme } = useSelector(state => state.theme)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleSignOut = async () => {
        const response = await fetch('/jd/auth/signout');
        if(response.ok){
            navigate('/sign-in');
            setTimeout(() => {
                dispatch(logout());
            }, 20);
        }
    }

    return <Navbar>
        <Link to={'/'} className='self-center whitespace-nowrap text-sm sm:text-xl dark:text-white font-semibold font-serif'>
            <span className='px-2 py-1 bg-gradient-to-r from-blue-600 via-sky-500 to-teal-300 rounded-md font-serif text-white'>Arc</span>
           hive
        </Link>
        <form>
            <TextInput type='text' placeholder='Search...' rightIcon={AiOutlineSearch} className='hidden lg:inline' />
        </form>
        <Button className='w-12 h-10 lg:hidden' color={'gray'} pill>
            <AiOutlineSearch />
        </Button>
        <div className='flex gap-3 md:order-2'>
            <Button onClick={() => { dispatch(toggleTheme()) }} className='w-12 h-10 sm:inline' color={'gray'} pill>
                {theme == 'light' ? <FaMoon /> : <FaSun />}
            </Button>
            {
                user ?
                    <Dropdown arrowIcon={false} inline label={<Avatar alt='displaypicture' img={user.displayPicture} rounded />} >
                        <Dropdown.Header>
                            <span className='block text-sm'>
                                {user.username}
                            </span>
                            <span className='block text-sm font-semibold truncate'>
                                {user.email}
                            </span>
                        </Dropdown.Header>
                        <Link to={'/dashboard?tab=profile'}>
                            <Dropdown.Item className='text-sm font-medium'>
                                Profile
                            </Dropdown.Item>
                        </Link>
                        <Dropdown.Divider />
                        <Dropdown.Item className='text-sm font-medium' onClick={handleSignOut}>
                            Sign-Out
                        </Dropdown.Item>
                    </Dropdown>
                    :
                    <Link to={'/sign-in'}>
                        <Button outline className='bg-gradient-to-r from-blue-600 via-sky-500 to-teal-300 hover:transition-all delay-100 hover:-translate-y-1' pill>Sign-In</Button>
                    </Link>
            }
            <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
            <Navbar.Link active={path === '/'} as={'div'}>
                <Link to={'/'}>
                    Home
                </Link>
            </Navbar.Link>
            <Navbar.Link active={path === '/about'} as={'div'}>
                <Link to={'/about'}>
                    About
                </Link>
            </Navbar.Link>
            <Navbar.Link active={path === '/dashboard'} as={'div'}>
                <Link to={'/dashboard'}>
                    Dashboard
                </Link>
            </Navbar.Link>

        </Navbar.Collapse>
    </Navbar>
}