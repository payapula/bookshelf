import {formatDate} from '../misc'

describe('format date test', () => {
  it('Preliminary Test', () => {
    expect(formatDate(new Date('October 18, 2012'))).toBe('Oct 12')
  })
  it('Another Test', () => {
    expect(formatDate(new Date('October 22, 2412'))).toBe('Oct 12')
  })
})
