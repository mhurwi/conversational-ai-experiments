import { Link, routes } from '@redwoodjs/router'

const BlogLayout = ({ children }) => {
  return (
    <>
      <header className="bg-gray-600 text-white">
        <nav className="flex items-center justify-between px-4 py-2">
          <Link to={routes.home()}>
            <h1 className="text-lg font-bold">Foobar App</h1>
          </Link>
          <ul className="flex">
            <li className="mr-4">
              <Link to={routes.foobar()} className="hover:text-gray-400">
                Foobar
              </Link>
            </li>
            <li className="mr-4">
              <Link to={routes.talk()} className="hover:text-gray-400">
                Talk
              </Link>
            </li>
            <li className="mr-4">
              <Link to={routes.home()} className="hover:text-gray-400">
                About
              </Link>
            </li>
            <li className="mr-4">
              <Link to={routes.home()} className="hover:text-gray-400">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container mx-auto mt-8">{children}</main>
      <footer className="bg-gray-200 py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-600">
            &copy; 2023 My App. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Built with{' '}
            <a
              href="https://reactjs.org/"
              className="underline hover:text-gray-800"
            >
              React
            </a>{' '}
            and{' '}
            <a
              href="https://tailwindcss.com/"
              className="underline hover:text-gray-800"
            >
              Tailwind CSS
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  )
}

export default BlogLayout
