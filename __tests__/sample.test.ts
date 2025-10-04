describe('Sample Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle strings', () => {
    expect('hello').toContain('ell')
  })

  it('should handle objects', () => {
    const data = { name: 'test', value: 42 }
    expect(data).toEqual({ name: 'test', value: 42 })
  })
})