# Claude Advisor Mod (`claude-advisor-mod`)

> 結合 **Oh My Pi (`omp.sh`)** 側肩監督看門狗與 **Claude Code (`code.claude.com`)** 關鍵門禁雙模型協作的 Claude Code Mod / Plugin。

---

## 核心特色 (Key Features)

1. **雙模型非對稱智能協作 (Asymmetric Dual-Model)**：
   - 保持以快速、低成本的模型（如 Claude Sonnet / Haiku）作為主執行者（Executor）。
   - 策略性在關鍵階段喚醒高階模型（如 Claude Opus、GPT-4o、o3-mini 或 本機 Apple Silicon MLX 模型）擔任顧問（Advisor）。
2. **多重觸發門禁 (Gated Triggers & Watchdog)**：
   - **規劃門禁 (Planning Gate)**：在大型架構變更或複雜任務啟動前進行結構審查。
   - **錯誤循環門禁 (Error Loop Gate)**：連續報錯 $\ge 2$ 次時主動診斷根本原因，避免盲目修改代碼。
   - **交付前門禁 (Pre-Finish Gate)**：在交付完成或 `git commit` 前比對原始需求與 Diff，揪出疏漏。
   - **主動 MCP 諮詢 (`consult_advisor`)**：主代理可隨時透過 MCP Tool 發起主動諮詢。
3. **多模型後端支援**：
   - 支援 Anthropic、OpenAI、Google Gemini 與 本地 MLX/Ollama 端點（Zero-cost, Zero-leakage）。
4. **智慧剪枝與低噪訊設計 (Context Pruner & Anti-Fatigue)**：
   - 僅萃取關鍵變更與錯誤訊息，維持在 1,500 ~ 4,000 Tokens 範圍內。
   - 判定 `pass` 時保持安靜，不產生無謂干擾。

---

## 安裝與載入方式 (Installation & Usage)

### 1. 本地載入 (Local Plugin)

在 Claude Code 中直接指定本專案目錄載入：

```bash
claude --plugin-dir /Volumes/Samsung970EVOPlus/dev-projects/claude-advisor-mod
```

或在 `~/.claude/settings.json` 中加入 plugin 路徑：

```json
{
  "plugins": [
    "/Volumes/Samsung970EVOPlus/dev-projects/claude-advisor-mod"
  ]
}
```

### 2. 斜線指令 (Slash Commands)

可以在 Claude Code 終端對話中隨時控制 Advisor 行為：

- `/advisor status`：檢視目前運行模式、後端模型、門禁開啟狀態與 Token 消耗度量。
- `/advisor mode <advisory|balanced|strict|disabled>`：設定介入嚴格度。
  - `advisory`：僅以提示（hint）注入次輪對話。
  - `balanced`（預設）：出現潛在問題時給出明顯 Warning 建議。
  - `strict`：遇到嚴重架構錯誤或硬編碼金鑰時發出 Blocker 並中斷執行。
- `/advisor provider <anthropic|openai|gemini|local-mlx>`：切換模型提供商。
- `/advisor model <model-name>`：切換指定模型。
- `/advisor toggle`：快速切換開啟/關閉。
- `/advisor test [query]`：立即發起 Advisor 連線與診斷測試。
- `/advisor reset`：重設當前工作階段的錯誤計數與呼叫計數。

### 3. 主動調用 MCP 工具 (MCP Tool)

主代理在需要二次意見時，可主動呼叫：

```json
{
  "name": "consult_advisor",
  "arguments": {
    "question": "這個重構方案是否可能破壞現有向下相容性？",
    "draftPlan": "將使用者認證從 Session 抽換為 JWT",
    "codeSnippet": "export function verifyToken(req) { ... }"
  }
}
```

---

## 設定與環境變數 (Configuration)

支援透過環境變數或設定檔 `~/.claude/advisor.json` 進行微調：

| 環境變數 | 預設值 | 說明 |
| :--- | :--- | :--- |
| `ADVISOR_MODE` | `balanced` | 介入模式 (`advisory`, `balanced`, `strict`, `disabled`) |
| `ADVISOR_PROVIDER` | `anthropic` | 模型後端 (`anthropic`, `openai`, `gemini`, `local-mlx`) |
| `ADVISOR_MODEL` | `claude-3-7-sonnet-20250219` | 顧問模型名稱 |
| `ADVISOR_BASE_URL` | `http://localhost:8080/v1` (MLX) | 本地推論端點位址 |
| `ADVISOR_API_KEY` | - | 獨立 API Key（亦自動採用標準 `ANTHROPIC_API_KEY` 等） |
| `ADVISOR_CONFIDENCE_THRESHOLD` | `0.75` | 信心度門檻（低於此值自動靜音忽略） |
| `ADVISOR_ERROR_THRESHOLD` | `2` | 連續報錯觸發門禁次數 |
| `ADVISOR_MAX_USES_PER_SESSION` | `25` | 單次對話預算上限 |

---

## 專案結構 (Architecture)

```
claude-advisor-mod/
├── .claude-plugin/
│   └── plugin.json                  # Claude Code Plugin 宣告清單
├── package.json                     # NPM 封裝定義
├── tsconfig.json                    # TypeScript 設定
├── src/
│   ├── index.ts                     # Mod 入口點 (register hooks & commands)
│   ├── config.ts                    # 設定檔讀取與狀態管理
│   ├── types.ts                     # 核心資料結構與型別定義
│   ├── gates/                       # 門禁判定器 (Planning, ErrorLoop, PreFinish)
│   ├── pruner/                      # 上下文精簡剪枝與 Diff 萃取
│   ├── providers/                   # 多模型適配器 (Anthropic, OpenAI, Gemini, MLX)
│   ├── mcp/                         # 內建 MCP Server (`consult_advisor`)
│   └── commands/                    # 斜線指令 (/advisor)
├── test/                            # Vitest 單元測試套件 (28/28 tests passed)
├── reports/                         # 分析調研報告 (001-*.md)
└── plans/                           # 執行計畫 (001-*.md)
```

---

## 文件與計畫索引 (Documentation & Plans)

- 核心主計畫 (SSOT)：[PLAN.md](PLAN.md)
- 架構調研分析報告：[001-advisor-model-architecture-analysis.md](reports/001-advisor-model-architecture-analysis.md)
- 實作執行架構計畫：[001-claude-advisor-mod-architecture.md](plans/001-claude-advisor-mod-architecture.md)
