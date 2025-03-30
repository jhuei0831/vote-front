import { FC } from "react"
import { BrowserRouter } from "react-router"
import RouteConf from "./RouteConf"

// BrowserRouter 就像 redux 的 provider 一樣，必須在最上層來處理
// Routes 裡面包的事處理所有路由導向的頁面
// Route 代表的是該路徑下需要渲染的 components


// 為了方便示範我先生成幾個頁面在 pages 的資料夾內
const App: FC = () => {
  
  return (
    <BrowserRouter>
      <RouteConf/>
    </BrowserRouter>
  )
}

export default App