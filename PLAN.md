# Claude Advisor Mod (claude-advisor-mod) - 主計畫與單一事實來源 (SSOT)

> 本文件為專案唯一之計畫、進度與架構單一事實來源（SSOT），遵循可追溯性與三態生命週期規範。

---

## 1. 全域追溯矩陣 (Global Traceability Matrix)

| 序號 | 依據報告 (Report) | 執行計畫 (Plan) | 生命週期狀態 | 進度 (%) | 負責/狀態說明 |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **001** | [001-advisor-model-architecture-analysis.md](reports/001-advisor-model-architecture-analysis.md) | [001-claude-advisor-mod-architecture.md](plans/001-claude-advisor-mod-architecture.md) | **狀態 2 (推進中子計畫)** | 25% | 完成架構調研與完整 7 階段開發規劃，準備啟動專案骨架與套件實作 |

*生命週期狀態定義*：
- **狀態 1**：調研與決策參考（有 report $\to$ 無 plan $\to$ 無 plan 連結）。
- **狀態 2**：推進中子計畫（有 report $\to$ 有 plan $\to$ 有連結，未完成）。
- **狀態 3**：已結案閉環子計畫（有 report $\to$ 有 plan $\to$ 有連結，已完成，測試全綠）。

---

## 2. 專案願景與架構概述 (Project Overview)

`claude-advisor-mod` 是為 Anthropic **Claude Code** 設計的進階顧問擴充套件（Claude Mod / Plugin）。它完美融合了：
1. **Oh My Pi (`omp.sh`)** 的「非同步側肩監督看門狗（Over-the-shoulder Watchdog）」機制：監看執行行為、在背景進行輕量分析與代碼查證。
2. **Claude Code (`code.claude.com`)** 的「非對稱雙模型階層協作（Asymmetric Dual-Model）」與「關鍵門禁（Gated Review）」機制：透過便宜/快速的模型作為日常執行者（Executor），而在規劃期、卡關循環期、交付前調用高階智能模型（Advisor）把關。
3. **Apple Silicon 機器優化**：本機支援透過 MLX Server 執行本地輕量或推理模型（如 DeepSeek-R1 / Qwen 4-bit），兼顧隱私、超低延遲與零 API 費用。

---

## 3. 階段推進與里程碑 (Milestones & Checklist)

- [x] **階段 0：架構調研與方案設計**
  - [x] 調研 `omp.sh/docs/advisor` 的 Watchdog 機制與筆記注入邏輯。
  - [x] 調研 `code.claude.com/docs/en/advisor` 的雙模型分工與門禁觸發點。
  - [x] 調研 `karanb192/awesome-claude-code-mods` 與現有 mod（如 `compact-adviser`）架構。
  - [x] 產出調研分析報告 `reports/001-advisor-model-architecture-analysis.md`。
  - [x] 產出架構推進計畫 `plans/001-claude-advisor-mod-architecture.md`。
- [ ] **階段 1：專案骨架與基礎設施 (Phase 1)**
  - [ ] 初始化 `package.json`、`tsconfig.json`、`.claude-plugin/plugin.json`。
  - [ ] 實作設定管理器 `src/config.ts` 與型別定義 `src/types.ts`。
- [ ] **階段 2：多後端模型適配器 (Phase 2)**
  - [ ] 實作統一介面 `AdvisorProvider`。
  - [ ] 實作 Anthropic、OpenAI、Gemini 與 本地 MLX/OpenAI-compatible 適配器。
- [ ] **階段 3：上下文剪枝與變更擷取器 (Phase 3)**
  - [ ] 實作 `src/pruner/context-pruner.ts`。
  - [ ] 實作 `src/pruner/diff-extractor.ts`。
  - [ ] 制定結構化 Prompt 與 JSON Schema。
- [ ] **階段 4：門禁判定邏輯 (Phase 4)**
  - [ ] 實作 Planning Gate、Error Loop Gate、Pre-Finish Gate。
- [ ] **階段 5：Function Hooks 與 MCP Tool (Phase 5)**
  - [ ] 註冊 Claude Code Function Hooks。
  - [ ] 實作內建 MCP Server 與 `consult_advisor` 工具。
- [ ] **階段 6：CLI 斜線指令與終端狀態 (Phase 6)**
  - [ ] 實作 `/advisor status|mode|toggle|model` 指令。
- [ ] **階段 7：測試與驗證 (Phase 7)**
  - [ ] 單元測試與整合驗證，更新文件並達成閉環（狀態 3）。
