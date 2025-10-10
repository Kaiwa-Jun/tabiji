// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// .env.localから環境変数を読み込む
import { loadEnvConfig } from '@next/env'

const projectDir = process.cwd()
loadEnvConfig(projectDir)