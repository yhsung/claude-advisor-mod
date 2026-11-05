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

## 文件與計畫索引 (Documentation & Plans)

- 核心主計畫 (SSOT)：[PLAN.md](PLAN.md)
- 架構調研分析報告：[001-advisor-model-architecture-analysis.md](reports/001-advisor-model-architecture-analysis.md)
- 實作執行架構計畫：[001-claude-advisor-mod-architecture.md](plans/001-claude-advisor-mod-architecture.md)
