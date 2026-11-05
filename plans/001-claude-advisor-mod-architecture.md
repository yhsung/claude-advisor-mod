# 001 - Claude Code Advisor Mod 實作架構規劃與開發計畫

> **依據報告**：[001-advisor-model-architecture-analysis.md](../reports/001-advisor-model-architecture-analysis.md)

---

## 1. 計畫目標與驗收標準 (Goals & Acceptance Criteria)

### 1.1 核心目標
融合 **Oh My Pi (`omp.sh`)** 的「側肩監督看門狗（Over-the-shoulder Watchdog）」與 **Claude Code (`code.claude.com`)** 的「關鍵門禁（Gated Review）」哲學，開發一個符合 Claude Code Plugin / Mod 標準的擴充套件 **`claude-advisor-mod`**。

### 1.2 驗收標準 (Acceptance Criteria)
1. **外掛相容性 (Mod/Plugin Parity)**：
   - 具備符合規範的 `.claude-plugin/plugin.json` 與 `package.json`，可透過 Claude Code 插件機制或 `karanb192/awesome-claude-code-mods` 目錄規格安裝並載入。
2. **多模型後端支援 (Multi-Backend Provider)**：
   - 支援 Anthropic (Claude 3.7 / Opus)、OpenAI (GPT-4o / o3-mini)、Google Gemini (2.5 Pro / Flash) 以及本地相容 OpenAI 協定之端點（如 Apple Silicon 上執行的 `mlx-lm.server` 或 `llama-server`）。
3. **雙軌介入機制 (Dual Execution Tracks)**：
   - **主動 MCP 工具**：主代理可調用 `consult_advisor` 詢問架構意見。
   - **自動觸發門禁 (Lifecycle Hooks)**：
     - Planning Gate：初始複雜指令之架構審查。
     - Error Loop Gate：連續 $\ge 2$ 次同類型工具錯誤時自動介入。
     - Pre-Commit / Pre-Finish Gate：在交付前比對變更 diff 與目標。
4. **低噪訊與反疲勞控制 (Anti-Fatigue & Context Pruning)**：
   - 當 Advisor 判定正常 (`pass`) 時不發出無效噪音。
   - 具備 Context Pruner，單次審查 Token 消耗控制在 1,500 ~ 4,000 Tokens 內。
5. **CLI 與互動控制**：
   - 提供 `/advisor` 相關指令（例如 `/advisor status`, `/advisor mode strict|balanced|advisory`, `/advisor model <name>`）。
6. **測試覆蓋**：
   - 單元測試（Vitest / Jest）100% 覆蓋 Context Pruning、觸發判斷邏輯與多模型適配器。

---

## 2. 模組目錄結構 (Repository Structure)

```
claude-advisor-mod/
├── .claude-plugin/
│   └── plugin.json                  # Claude Code Plugin 宣告清單
├── package.json                     # NPM 封裝定義與相依性
├── tsconfig.json                    # TypeScript 設定
├── README.md                        # 使用者指南與安裝說明
├── AGENTS.md                        # Agent 規則與維護指南
├── PLAN.md                          # 全專案 SSOT 計畫與追溯矩陣
├── reports/                         # 分析調研報告 (<3 digit id>-<slug>.md)
│   └── 001-advisor-model-architecture-analysis.md
├── plans/                           # 推進計畫 (<3 digit id>-<slug>.md)
│   └── 001-claude-advisor-mod-architecture.md
├── src/
│   ├── index.ts                     # Mod 入口點 (register hooks & commands)
│   ├── config.ts                    # 設定檔讀取與狀態管理 (~/.claude/advisor.json)
│   ├── types.ts                     # 核心資料結構與型別定義
│   ├── gates/                       # 門禁判定器
│   │   ├── planning-gate.ts         # 初始規劃門禁
│   │   ├── error-loop-gate.ts       # 錯誤循環偵測
│   │   └── pre-finish-gate.ts       # 完成前 diff 稽核
│   ├── pruner/                      # 上下文精簡處理
│   │   ├── context-pruner.ts        # 剪枝邏輯
│   │   └── diff-extractor.ts        # 萃取 git diff 與重要變更
│   ├── providers/                   # 多模型適配器
│   │   ├── provider-factory.ts      # 工廠模式
│   │   ├── anthropic-provider.ts    # Anthropic API
│   │   ├── openai-provider.ts       # OpenAI API
│   │   ├── gemini-provider.ts       # Google Gemini API
│   │   └── local-mlx-provider.ts    # 本機 MLX / OpenAI-compatible
│   ├── mcp/                         # 內建 MCP Server
│   │   └── advisor-server.ts        # 提供 `consult_advisor` 工具
│   └── commands/                    # 斜線指令實作
│       └── advisor-command.ts       # /advisor 子指令處理
└── test/                            # 單元與整合測試
    ├── context-pruner.test.ts
    ├── error-gate.test.ts
    └── provider.test.ts
```

---

## 3. 開發分期與實施階段 (Implementation Phases)

### 階段 1：專案骨架與設定系統建立 (Foundations & Config)
- [x] 建立 `package.json`（相依：`typescript`, `@modelcontextprotocol/sdk`, `@anthropic-ai/sdk`, `openai`, `@google/genai`, `zod`, `vitest`）。
- [x] 撰寫 `.claude-plugin/plugin.json`，配置 hook 監聽點與 MCP server 啟動命令。
- [x] 實作 `src/config.ts`：支援透過全域設定檔（`~/.claude/advisor.json`）或環境變數（`ADVISOR_MODEL`, `ADVISOR_MODE`, `ADVISOR_PROVIDER`）動態載入。

### 階段 2：多後端模型適配器 (Multi-Provider Engine)
- [x] 定義統一介面 `AdvisorProvider`（包含 `evaluate(prompt, context)`）。
- [x] 實作 Anthropic、OpenAI、Gemini 適配器。
- [x] 實作本機 MLX / OpenAI-compatible 適配器（支援針對 Apple Silicon 本機 `http://localhost:8080/v1` 的零網路呼叫）。
- [x] 實作重試與 Fallback 機制（若 Advisor 失敗，靜默放行而不中斷主代理流程）。

### 階段 3：上下文剪枝與 Git Diff 擷取器 (Context Pruner)
- [x] 實作 `context-pruner.ts`：過濾肥大的 base64、二進制、龐大測試 log，只保留錯誤訊息堆疊（stack traces）與摘要。
- [x] 實作 `diff-extractor.ts`：執行輕量 `git diff --staged` 或 `git status` 抓取現階段關鍵代碼異動。
- [x] 制定結構化 Prompt 樣板（引導 Advisor 輸出嚴格 JSON：`verdict`, `score`, `critique`, `blocker`）。

### 階段 4：門禁判定邏輯 (Trigger Gates)
- [x] **Planning Gate**：檢測使用者 prompt 複雜度，若為多檔案重構或關鍵決策，啟動 Advisor 檢驗架構考量。
- [x] **Error Loop Gate**：追蹤最近執行的 tool 結果，若相同 command 或同模組報錯累計 $\ge 2$ 次，強制觸發診斷建議。
- [x] **Pre-Finish Gate**：攔截 `Stop` 事件或 `git commit`，進行上游需求與最終 diff 的符合度審查。

### 階段 5：Function Hooks 與 MCP Tool 雙向整合
- [x] 在 `src/index.ts` 註冊 Claude Code Function Hooks（`PrePrompt`, `PostToolUse`, `Stop`）。
- [x] 實作 MCP Tool `consult_advisor`，供主代理自願向高階模型發起架構諮詢。
- [x] 實作不同介入等級的反饋：
  - `advisory`：僅以提示（hint）附加於次輪對話。
  - `balanced`：顯著警告（warning），由主代理決定是否遵循。
  - `strict`：發出 blocker，中斷執行並要求主代理重新評估。

### 階段 6：CLI 斜線指令與終端狀態呈現
- [x] 實作 `/advisor` 指令（`/advisor status`, `/advisor mode`, `/advisor toggle`, `/advisor set-model`）。
- [x] 終端提示列整合（若 host 支援，顯示 Advisor 當前監控狀態）。

### 階段 7：全面驗證與測試落盤
- [x] 撰寫單元測試（包含 Mock 模型回應、上下文裁剪邊界條件）。
- [x] 本地測試：透過 Claude Code 載入本地插件進行端到端情境驗證（觸發報錯循環、主動詢問工具）。
- [x] 同步更新 `README.md`、`AGENTS.md` 與 `PLAN.md`。

---

## 4. 驗證與風險對策 (Risk & Mitigation)

| 潛在風險 | 影響程度 | 預防與對策 |
| :--- | :--- | :--- |
| **Advisor 延遲拖慢主代理流暢度** | 中 | 1. 採用非同步並行評估（background evaluation）。<br>2. 僅在關鍵門禁（連續錯誤、完成前）才做同步等待。<br>3. 支援本地 MLX 4-bit 快速模型以達超低延遲。 |
| **Token 成本激增** | 高 | 1. 嚴格剪枝器（Context Pruner），限制輸入上限。<br>2. 設定 `max_uses_per_session` 預算控制。<br>3. 善用 Prompt Caching。 |
| **Advisor 出現幻覺提出無效告警** | 中 | 1. 提供驗證指令與唯讀查證工具。<br>2. 設定信心度門檻（$< 0.8$ 靜默忽略）。<br>3. 輸出採用結構化 JSON，強制條列客觀證據。 |
| **Claude Code 版本差異造成 Hook 介面變動** | 中 | 封裝 Hook Adapter 層，若 Function Hooks 不可用時，自動優雅降級為純 MCP Tool 模式運作。 |
