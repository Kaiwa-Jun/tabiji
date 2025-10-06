/**
 * LIFF SDKのモック
 * テスト環境でLIFF SDKの動作をシミュレート
 */

const mockLiff = {
  init: jest.fn().mockResolvedValue(undefined),
  isLoggedIn: jest.fn().mockReturnValue(true),
  login: jest.fn(),
  logout: jest.fn(),
  isInClient: jest.fn().mockReturnValue(false),
  getOS: jest.fn().mockReturnValue('web'),
  getLanguage: jest.fn().mockReturnValue('ja'),
  getVersion: jest.fn().mockReturnValue('2.26.1'),
  getContext: jest.fn().mockReturnValue({
    type: 'square_chat',
    viewType: 'full',
    userId: 'U1234567890abcdef1234567890abcdef',
    utouId: 'U1234567890abcdef1234567890abcdef',
    roomId: 'R1234567890abcdef1234567890abcdef',
    groupId: 'G1234567890abcdef1234567890abcdef',
  }),
  getProfile: jest.fn().mockResolvedValue({
    userId: 'U1234567890abcdef1234567890abcdef',
    displayName: 'テストユーザー',
    pictureUrl: 'https://example.com/profile.jpg',
    statusMessage: 'テストステータス',
  }),
  sendMessages: jest.fn().mockResolvedValue(undefined),
  closeWindow: jest.fn(),
  getAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  getDecodedIDToken: jest.fn().mockReturnValue({
    iss: 'https://access.line.me',
    sub: 'U1234567890abcdef1234567890abcdef',
    aud: '1234567890',
    exp: 1234567890,
    iat: 1234567890,
    name: 'テストユーザー',
    picture: 'https://example.com/profile.jpg',
  }),
}

export default mockLiff
