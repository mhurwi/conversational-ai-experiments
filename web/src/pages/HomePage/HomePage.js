import { Link } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import RobotCoffeeShop from './robot-coffee-shop.png'

const HomePage = () => {
  return (
    <>
      <MetaTags title="Home" description="Home page" />
      <div className="flex min-h-screen flex-col items-center justify-center">
        <img src={RobotCoffeeShop} alt="Robot Coffee Shop" className="w-400" />
        <h1 className="text-4xl font-semibold text-primary">Talk to AI</h1>
        <p className="max-w-md text-center text-lg">
          A new platform for conversational AI interactions.
        </p>
        <div className="grid w-full max-w-md grid-cols-2 gap-4">
          <Link
            to="/signup"
            className="hover:bg-secondary-dark focus:ring-secondary-light rounded-md bg-secondary px-4 py-2 text-center font-semibold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="hover:bg-primary-dark focus:ring-primary-light rounded-md bg-primary px-4 py-2 text-center font-semibold text-white transition-all duration-200 ease-in-out focus:outline-none focus:ring-2"
          >
            Log In
          </Link>
        </div>
      </div>
    </>
  )
}

export default HomePage
