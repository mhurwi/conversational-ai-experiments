import { render } from '@redwoodjs/testing/web'

import TalkPage from './TalkPage'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('TalkPage', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<TalkPage />)
    }).not.toThrow()
  })
})
