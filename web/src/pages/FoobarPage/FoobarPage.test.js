import { render } from '@redwoodjs/testing/web'

import FoobarPage from './FoobarPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('FoobarPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<FoobarPage />)
    }).not.toThrow()
  })
})
