# AGENTS.md - Agent 維護與協作規範

本文件規範所有參與維護與開發 `claude-advisor-mod` 的 AI Agent 必須遵守之核心準則：

## 1. 單一事實來源與追溯性 (SSOT & Traceability)
1. 專案根目錄的 `PLAN.md` 為全專案唯一之計畫、架構與進度事實來源。
2. 任何架構變更、核心程式碼修改或完成階段任務後，**必須立即回寫 `PLAN.md` 與全域追溯矩陣**。
3. 嚴格遵守 `<3 digit id>-<slug>.md` 循序命名原則（如 `reports/001-*.md`、`plans/001-*.md`），並維護報告與計畫之間的雙向連結。

## 2. 三位一體一致性 (Parity)
提交任何修改時，必須同時檢核：
- **代碼/配置 (Code/Configs)**：`src/`, `package.json`, `.claude-plugin/plugin.json`
- **規範文件 (Docs)**：`README.md`, `AGENTS.md`
- **執行計畫 (Plans)**：`PLAN.md`, `plans/*.md`
三者所記載之架構與狀態必須 100% 同步一致。

## 3. 本機硬體與推論考量
本機為 Apple Silicon 64GB 環境，開發本地推論適配器時：
- 優先相容本地 `mlx-lm.server` 或 `llama-server`（預設監聽 `http://localhost:8080/v1`）。
- 嚴格控制 KV Cache 與 Context 限制，避免產生 memory pressure 或 swap。
