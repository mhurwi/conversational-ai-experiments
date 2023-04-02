import { Link, routes } from '@redwoodjs/router'

const BlogLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="bg-primary text-white">
        <nav className="flex items-center justify-between px-4 py-2">
          <Link to={routes.home()}>
            <h1 className="text-lg font-bold">Conversational AI Experiments</h1>
          </Link>
          <ul className="flex">
            <li className="mr-4">
              <Link to={routes.talk()} className="hover:text-accent">
                Talk
              </Link>
            </li>
            <li className="mr-4">
              <Link to={routes.home()} className="hover:text-accent">
                About
              </Link>
            </li>
            <li className="mr-4">
              <Link to={routes.home()} className="hover:text-accent">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="container mx-auto mt-8 flex-grow">{children}</main>
      <footer className="bg-secondary py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm text-white">
            &copy; 2023 My App. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-white">
            Built with{' '}
            <a
              href="https://reactjs.org/"
              className="underline hover:text-accent"
            >
              React
            </a>{' '}
            and{' '}
            <a
              href="https://tailwindcss.com/"
              className="underline hover:text-accent"
            >
              Tailwind CSS
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
}

export default BlogLayout
