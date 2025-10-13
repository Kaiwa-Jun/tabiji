import { GoogleMapWrapper } from '@/components/map/google-map-wrapper'

/**
 * Google Maps テストページ
 * ローカル開発環境で地図表示を確認するためのページ
 */
export default function TestMapPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-3xl font-bold">Google Maps テスト</h1>

      <div className="space-y-8">
        {/* テストケース1: 東京駅 */}
        <section>
          <h2 className="mb-2 text-xl font-semibold">東京駅</h2>
          <p className="mb-4 text-sm text-gray-600">
            緯度: 35.6812, 経度: 139.7671, ズーム: 15
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md">
            <GoogleMapWrapper lat={35.6812} lng={139.7671} zoom={15} height="400px" />
          </div>
        </section>

        {/* テストケース2: 大阪城 */}
        <section>
          <h2 className="mb-2 text-xl font-semibold">大阪城</h2>
          <p className="mb-4 text-sm text-gray-600">
            緯度: 34.6873, 経度: 135.5262, ズーム: 14
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md">
            <GoogleMapWrapper lat={34.6873} lng={135.5262} zoom={14} height="400px" />
          </div>
        </section>

        {/* テストケース3: 札幌時計台 */}
        <section>
          <h2 className="mb-2 text-xl font-semibold">札幌時計台</h2>
          <p className="mb-4 text-sm text-gray-600">
            緯度: 43.0626, 経度: 141.3535, ズーム: 16
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-300 shadow-md">
            <GoogleMapWrapper
              lat={43.0626}
              lng={141.3535}
              zoom={16}
              height="500px"
            />
          </div>
        </section>

        {/* 使用方法の説明 */}
        <section className="rounded-lg bg-blue-50 p-6">
          <h2 className="mb-3 text-xl font-semibold text-blue-900">使用方法</h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>基本的な使い方:</strong>
            </p>
            <pre className="overflow-x-auto rounded bg-white p-3 text-xs">
              {`<GoogleMapWrapper
  lat={35.6812}
  lng={139.7671}
  zoom={15}
  height="400px"
/>`}
            </pre>
            <p className="mt-4">
              <strong>パフォーマンス最適化:</strong>
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>動的インポートで必要なページのみで読み込み</li>
              <li>シングルトンパターンで重複読み込み防止</li>
              <li>SSR無効化でサーバー側エラー防止</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
