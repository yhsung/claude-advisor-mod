# 001 - Claude Code Advisor Mod 架構調研與設計分析報告

## 1. 執行摘要 (Executive Summary)

本報告針對 **Oh My Pi (`omp.sh/docs/advisor`)** 與 **Claude Code 官方架構 (`code.claude.com/docs/en/advisor`)** 所體現的 **Advisor Model（顧問/監督模型）** 概念進行深入剖析，並結合社群擴充生態 **`karanb192/awesome-claude-code-mods`**（包括 `compact-adviser`、`claude-flightdeck` 等實作慣例），為建立一個開源、高擴充性、支援多模型後端（含本機 Apple Silicon MLX）的 **`claude-advisor-mod`** 提出完整的架構分析與落地設計。

---

## 2. 核心架構原型對比：`omp` vs `code.claude.com`

| 維度 | Oh My Pi (`omp.sh`) Advisor | Claude Code 官方 Advisor 哲學 | 本 Mod (`claude-advisor-mod`) 整合設計 |
| :--- | :--- | :--- | :--- |
| **主要定位** | **Over-the-shoulder Watchdog**（側肩監督者/看門狗） | **Asymmetric Intelligence Tiering**（非對稱智能與成本平衡器） | **Hybrid Watchdog & On-Demand Gatekeeper**（混合式看門狗與按需諮詢門禁） |
| **觸發模式** | 非同步背景持續審查（每個 turn/工具執行後分析） | 關鍵門禁（Gates）或主代理主動呼叫（Planning, Error, Completion） | 雙軌驅動：自動關鍵門禁（Hooks）+ 主代理主動諮詢工具（MCP Tool） |
| **模型角色分配** | `model_roles.default` + `model_roles.advisor` | Fast/Cheap Executor (Sonnet/Haiku) + High-IQ Advisor (Opus) | 支援混合雲端（Claude, GPT, Gemini）與本地輕量/推理模型（MLX / Ollama） |
| **上下文傳遞** | 剪枝後的高信號上下文（Pruned Turn History + Summary） | 精簡的特定決策情境與 Prompt Caching | 智慧上下文過濾器（Smart Context Pruner），避免重複吞吐巨大 raw outputs |
| **干預強度** | 階梯式干預：Silent $\to$ Nit $\to$ Warning $\to$ Hard Blocker | 指導性建議（Advisory Guidance），不強行奪取執行權限 | 3 種模式可切換：`Strict`（可 block 工具）、`Balanced`（注入 warning）、`Advisory`（僅建議） |
| **驗證能力** | 具備獨立唯讀工具（`read`, `grep`, `git diff`）先行查證 | 由 Executor 自行回饋或單次問答反饋 | 提供 Advisor 專用輕量唯讀探測（避免幻覺告警） |

---

## 3. 現有生態調研 (`awesome-claude-code-mods`)

檢視 `karanb192/awesome-claude-code-mods` 及 Claude Code 近期擴充架構演進：

1. **Claude Code 擴充機制現況**：
   - **Function Hooks (Claude Mods / TypeScript Middleware)**：已成為 Claude Code >= 2.1.287 的標準擴充機制。支援在 JS/TS 中直接註冊生命週期監聽（`PreToolUse`、`PostToolUse`、`PrePrompt`、`Stop`、`SessionStart`）。
   - **MCP Server 整合**：Plugin 結構內可同時夾帶本地 MCP Server，將自訂 Tool（例如 `consult_advisor`）無縫注入主代理的工具列表。
   - **Terminal UI / Status Bar**：Plugin 可呼叫終端 API 自訂狀態列或徽章，顯示目前 Advisor 狀態（例如：`Advisor: [Opus] Idle / Advising / Blocked`）。
2. **代表性案例借鏡**：
   - **`compact-adviser` (`kunchenguid/compact-adviser`)**：利用 Jev 分類模型在背景判定任務邊界與 Context 消耗，支援 `hint` 與 `auto` 模式，證明在 Hook 中調用輕量決策 LLM 的可行性與即時性。
   - **`claude-flightdeck`**：展示即時終端面板與決策 Timeline，監控主代理與子代理行為。

---

## 4. `claude-advisor-mod` 核心子系統架構

```
+-----------------------------------------------------------------------------------+
|                                Claude Code Host                                   |
|                                                                                   |
|  +--------------------+       Hooks / Events        +--------------------------+  |
|  |                    | --------------------------> |                          |  |
|  |  Primary Agent     |                             |   claude-advisor-mod     |  |
|  |  (e.g. Sonnet 3.7) | <-------------------------- |   Plugin / Middleware    |  |
|  |                    |    Injected Feedback/Block  |                          |  |
|  +--------------------+                             +--------------------------+  |
|            |                                                     |                |
|            | MCP Tool: `consult_advisor`                         |                |
|            +-----------------------------------------------------+                |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                          Advisor Core Engine                                      |
|                                                                                   |
|  [ 1. Trigger Policy ]         [ 2. Context Pruner ]     [ 3. Model Adapter ]     |
|   - Planning Gate               - Strip Raw Base64/Dumps  - Anthropic (Opus)      |
|   - Loop/Failure Gate           - Extract Git Diffs       - OpenAI (GPT-4o/o3)    |
|   - Pre-commit Gate             - Summarize Tool Errors   - Google Gemini 2.5     |
|   - On-Demand MCP Tool                                    - Apple Silicon MLX/OLL |
|                                                                                   |
|  [ 4. Evaluation Engine ]                                                         |
|   - System Prompt (Critic / Auditor Persona)                                      |
|   - Structured Verdict: { pass, score, category, advice, blocker }                |
|   - Anti-nag Throttle & Deduplication Filter                                      |
+-----------------------------------------------------------------------------------+
```

### 4.1 觸發門禁策略 (Trigger Gates)
1. **Planning Gate (`PrePrompt` / 初始階段)**：
   - 當使用者發布涉及多檔案重構、架構決策的提示詞時觸發。
   - 審查重點：是否有單一事實來源、是否有清晰可驗證驗收標準、是否有潛在破壞性變更。
2. **Error Loop Gate (`PostToolUse` / 連續報錯時)**：
   - 監聽 `bash` 或檔案修改工具的輸出，若同一指令或同類型錯誤連續出現 $\ge 2$ 次，自動啟動 Advisor 診斷「盲點與根本原因」，阻止主代理盲目嘗試修復。
3. **Pre-Completion / Pre-Commit Gate (`Stop` / `git commit` 時)**：
   - 當主代理準備回覆完成或執行 commit 時觸發。
   - 審查重點：比對 `git diff` 與使用者初始需求，檢查未處理邊界、破壞現有測試、未清理 debug 輸出等。
4. **On-Demand Tool (`consult_advisor`)**：
   - 主代理自知遇到不確定之處時主動調用，提問並傳遞草案。

### 4.2 上下文剪枝器 (Context Pruner)
- 避免將全部數十萬 Token 的上下文完整傳送至 Advisor。
- 專注萃取：**使用者原始目標 + 當前階段架構計畫 + 最近 3 輪對話摘要 + 關鍵錯誤/Diff**。
- Token 消耗控制在每輪 1,500 ~ 4,000 Tokens 以內，結合 Prompt Caching 極大化降低成本。

### 4.3 多模型後端適配器 (Multi-Provider Model Adapter)
- 遵循使用者機器慣例（支援 Apple Silicon 64GB 上的本地推論）：
  - 支援雲端 API：Anthropic (`claude-3-7-sonnet`, `claude-3-opus`), OpenAI (`gpt-4o`, `o3-mini`), Gemini (`gemini-2.5-pro`)。
  - 支援本機 API：本機 MLX Server (`http://localhost:8080/v1`) 或 Ollama，讓審查在本地零成本、低延遲運行！

### 4.4 干預控制與反疲勞機制 (Throttle & De-noising)
- 針對建議進行閥值過濾（Thresholding）：唯有信心度 $> 0.8$ 且具有明確可執行的行動時才注入提示。
- 「只說重點」原則：禁止冗長寒暄，輸出必須是明確、精簡的 1~3 點清單。

---

## 5. 結論與建議採行方案
建議將此專案命名為 **`claude-advisor-mod`**，以 Node.js / TypeScript 模組實作，具備：
1. 完整標準 Claude Code Plugin Manifest（相容 `awesome-claude-code-mods` 市集規格）。
2. Function Hooks 與 MCP Server 雙軌整合。
3. 支援 `/advisor` 系列 Slash Commands（`/advisor status`, `/advisor mode`, `/advisor test`）。
4. 預設支援本地 MLX 與雲端頂級 LLM 混合調度。
