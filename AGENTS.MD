# JM Boom Project Notes

本文件给后续接手的 Codex 使用，目标是快速理解项目现状、约束和阅读器性能优化的下一步。

## 接手约定

- 项目是 Tauri 2 + React 19 + Vite + TanStack Router/Query + Zustand + shadcn/ui + Rust reqwest。
- 当前优先桌面端体验，小屏适配不是近期重点。
- 不要手动编辑 `src/routeTree.gen.ts`，路由树由 TanStack Router 插件、HMR 或 build 生成。
- 读取或写入包含中文的文件时必须显式使用 UTF-8，避免 Windows 终端默认编码导致乱码。
- 工具调用：可以并行读取文件或搜索；文件编辑必须单次调用 `apply_patch`，不要重复或并行套同一补丁；`cargo check`、`vite build`、`tsc` 等会占用输出目录或 build lock 的验证命令不要并行重复触发。
- 前端和 Rust 通信用 Tauri `invoke`，项目不使用 axios，新接口不要新增 axios 调用。
- UI 优先复用 shadcn/ui 已安装组件；需要新的 shadcn 组件时，告诉用户安装，不要自己重造复杂基础组件。
- 项目已有 `floating-nav`，不要新增传统 sidebar。
- Rust 依赖可直接添加并用 `cargo check` 下载；前端依赖不要直接安装，先告诉用户。
- 用户此前表示暂时不要纠结 `lint` ；不要因为 `lint` 结果扩大无关改动。

## 验证命令

- 常规前端验证优先跑 `bun run build`。
- 如果 Windows 环境没有 `bun`，跑：
  - `node_modules/.bin/tsc.exe --noEmit`
  - `node_modules/.bin/vite.exe build`
- 改 `src-tauri` Rust 代码后跑：
  - 工作目录 `src-tauri`
  - `cargo check`
- 只有在新增或调整测试时再跑相关 `cargo test`；不要并行跑多个 Rust/Vite 构建。

## 参考项目

- API / 数据源主要参考同级 `jm-mobile`。
- 漫画阅读、预览、排版可以参考同级 `jm-mobile`、`Breeze-plugin-JmComic`、`Breeze`。
- 当前判断：`jm-mobile` 更偏移动端；`Breeze` 更适合作为桌面/跨平台阅读器排版与翻页参考。

## 项目结构要点

- 前端路由在 `src/routes`。
- 普通页面在 `_app` 下，阅读页是独立路由 `src/routes/reader/$comicId.tsx`，不挂 `_app`，所以没有 `floating-nav`。
- 全局用户状态在 `src/stores/user-store.ts`。
- 设置状态在 `src/stores/settings-store.ts`，使用 Zustand persist，包含 API endpoint、图片线路、预载数量、缓存上限、代理和封面隐私模式。
- 阅读历史在 `src/stores/reading-history-store.ts`，persist key 是 `jm-boom-reading-history`。
- Rust API 已拆分：
  - `src-tauri/src/api.rs`：远程设置、搜索、首页、每周推荐、详情、评论、登录、签到等普通接口。
  - `src-tauri/src/reader.rs`：阅读 manifest、图片下载、解码、缓存、预取。
  - `src-tauri/src/lib.rs`：Tauri command 包装和 invoke handler 注册。

## 当前功能状态

- 首页：`src/routes/_app/index.tsx`，使用 `getHomeFeed`，信息流纵向展示，右侧轻量导航，含 BackTop。
- 每周推荐：`src/routes/_app/weekly.tsx`，使用 shadcn `Tabs`/`Select`，items 用 `ComicGrid`。
- 详情页：`src/routes/_app/comic/$comicId.tsx`，展示详情、章节、相关推荐、评论 Drawer；章节进入阅读页时传 `title`、`chapter`、`albumId`、`pageIndex: '0'`、`nextId`、`nextChapter`。
- 历史观看：`src/routes/_app/history.tsx`，以作品 `comicId` 为唯一键覆盖历史，`chapterId` 保存当前章节/read id；点击历史进入 `/reader/$comicId` 并带 `pageIndex` 恢复进度。
- 阅读页：`src/routes/reader/$comicId.tsx` + `src/features/reader/*`，`$comicId` 语义是 read/chapter id，作品 id 来自 search `albumId`。
- 设置页：`src/routes/_app/settings.tsx`，动态发现 API endpoint，支持 HTTP/SOCKS5 代理、主题、封面隐私、阅读线路、预载数量、缓存上限和缓存管理。
- 个人中心：`src/routes/_app/me.tsx`，登录态来自 Zustand，支持签到数据和签到操作。

## 阅读器行为

- 阅读页左右方向键翻页，`Esc` 返回，左右透明点击区也可翻页。
- 图片使用 `h-screen w-screen object-contain`，尽量占满视口但不裁切。
- 顶部 toolbar 鼠标移动时出现，短暂后隐藏；键盘操作时隐藏。
- 底部悬浮进度条显示页码；最后一页且存在下一章时显示“下一章”按钮。
- `pageIndex` search 作为初始页，`useReaderPages` 会规范化并在 manifest 返回页数后 clamp。
- 阅读进度只在已有章节标题且 `pageCount > 0` 时写入历史，避免保存无效页数。
- 当前主要优化目标仍是桌面单页阅读的首次准备和连续翻页体感；滚动模式、双页模式、Breeze 风格排版还未落地。

## Rust / Tauri API 要点

- 已注册主要 commands：`discover_api_endpoints`、`search_comics`、`get_home_feed`、`get_week_filters`、`get_week_items`、`get_comic_detail`、`get_comic_comments`、`login`、`get_sign_in_data`、`sign_in`、`clear_session`、`configure_network_proxy`、`get_reader_cache_stats`、`clear_reader_cache`、`open_reader_cache_dir`、`get_comic_read_manifest`、`get_comic_read_page`、`prefetch_comic_read_pages`。
- 移动端 API `tokenparam` 版本对齐 Breeze 插件为 `2.0.20`。
- API endpoint 动态发现从 `newsvr-2025.txt` 解密 host 池，合并本地 fallback 后测速；业务请求只规范化 http/https endpoint，空 endpoint 回退到 `https://www.cdnhth.club`。
- Rust 侧支持全局代理配置，`configure_network_proxy` 会重建共享 reqwest client；HTTP/SOCKS5 依赖 reqwest `socks` feature。
- 登录使用共享 reqwest client + cookie jar 维持会话，重新登录前和退出时调用 `clear_session`。
- 小说分组已过滤，当前只实现漫画图片阅读链路。

## 阅读器 Rust 当前实现

- `get_comic_read_manifest` 读取 `chapter_view_template`，用 `json5` 解析源端宽松 JS/JSON 对象。
- `get_comic_read_page` 下载图片、必要时解扰、写入 app cache 的 `reader` 目录，再通过 Tauri asset protocol 给前端显示。
- `tauri.conf.json` 已允许 `$APPCACHE/reader/**`。
- 缓存上限默认约 512MB，修剪目标约 82%。
- 非扰图直接缓存原始 bytes，不再整图解码；冷缓存返回宽高 `0/0`，前端当前不依赖宽高排版。
- 扰图缓存仍输出 WebP。
- 预取半径来自设置页“预载数量”，语义是当前页两侧各预取 N 张；Rust 预取并发数直接等于 `prefetchCount`，当前页加载不计入预取并发。
- 缓存写入使用同目录 `.tmp` 文件，完成后 rename 为正式缓存文件；缓存统计和清理跳过 `.tmp`，避免并发读取半写文件导致 `failed to fill whole buffer`。
- 扰图修复已改为按 RGBA raw row copy 重排，移除了 `crop_imm(...).to_image()` + `replace()` 的逐分片临时分配。

## 已落地的阅读器优化

- 预取有限并发：`prefetch_comic_read_pages` 使用 `JoinSet` 按近邻优先顺序并发预取，并发数等于 `prefetchCount`；已跑 `cargo check`。
- 非扰图快路径：不需要解扰时直接写原始 bytes；已跑 `cargo check`。
- 单页预热渲染：`useReaderPages` 去掉 120ms 翻页等待，当前页 query 立即跟随 `currentIndex`；当前页 ready 后 query 相邻前后页，并用浏览器 `Image.decode()` 预热本地 asset 图片；已跑 `node_modules/.bin/tsc.exe --noEmit` 和 `node_modules/.bin/vite.exe build`。
- 缓存写入原子化：缓存文件先写 `.tmp` 再 rename；已跑 `cargo check`。
- 扰图 raw buffer 重排：解扰时按 RGBA 行复制，减少临时分配；已跑 `cargo check`。

## 下一步建议

优先做 WebP 编码策略评估。理由：扰图现在已经减少了分片搬运分配，剩下的大头很可能是 WebP 编码耗时。可选方向：

- 降低 WebP quality 或使用更快编码参数，如果当前 image crate 支持有限，需要先确认 API。
- 评估扰图缓存改存 JPEG/PNG/WebP 的耗时和体积差异。
- 先用日志或简单计时拆分下载、解扰、编码、写盘耗时，再决定是否改编码格式。

次优先是当前页优先队列/预取取消：当用户快速翻页时，后台旧预取不应拖慢当前页。但这会引入任务过期判断或取消逻辑，复杂度高于编码策略评估。

后续排版方向参考 Breeze：单页 `contain` 当前已接近；滚动模式可学习 Breeze 的图片尺寸缓存，避免列表高度跳动；双页/RTL/LTR 支持尚未实现。

## 注意事项

- 历史观看依赖 `currentIndex`、`pageCount`、`chapterId`、`albumId` 等前端字段；优化图片解码和缓存时不要改 `get_comic_read_page` 的 `index` 语义、缓存路径命名规则或阅读页 search 参数。
- 阅读缓存路径规则目前是章节 read id 目录下 `0001.ext`；不要随意变更，否则热缓存命中和历史恢复体验会受影响。
- `src/features/reader/reader-bars.tsx` 可能有用户侧小改动，页码显示是 `{current} / {pageCount}`，不要无关回滚。
