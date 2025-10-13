/**
 * Google Maps JavaScript API の型定義拡張
 * @googlemaps/js-api-loader が google オブジェクトをグローバルに追加するため、
 * Window interface に型定義を追加
 */

declare global {
  interface Window {
    google: typeof google
  }
}

export {}
