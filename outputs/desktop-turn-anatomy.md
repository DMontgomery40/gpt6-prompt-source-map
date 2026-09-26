# What a desktop turn contains

Source: one Codex/ChatGPT desktop session captured on 2026-09-25 (ChatGPT desktop 26.924.20706, build 11431; codex-cli 0.158.0-alpha.2; model `gpt-6-astra`).

The desktop app writes every session to a log on the user's machine. This page is generated from one of those logs and shows what the model received before its first reply, in order: the base instructions, the developer messages, the user's context, the turn settings, and then the user's message. Text that is already on this site links to its page. Text that ships in the app but was not on the site yet is shown in full. Text assembled when the session started is shown with paths and e-mail addresses masked. The user's own memories, installed skills and AGENTS.md files are counted, never shown.

This is one session. Other accounts, models, settings, plugins and projects change parts of it.

## Base instructions

### Base instructions

Source: the session's base instructions, provenance `model` (`gpt-6-astra`), 21,420 characters.

Every line is published on [Astra base instructions](../astra-base-instructions/).

## Developer messages

### 1. App context

Source: developer message 1 of 8, 13,228 characters.

30 lines published on [Codex/ChatGPT helper prompt inventory](../codex-helper-prompt-inventory/).

5 lines published on [Other model-facing text](../desktop-model-facing-text/).

18 lines published on [Codex/ChatGPT helper prompt inventory](../codex-helper-prompt-inventory/).

26 lines published on [Other model-facing text](../desktop-model-facing-text/).

Shipped in the app, not yet on this site:

```text
This projectless thread starts in a generated directory under the user's Documents/Codex folder.
The generated directory name is only a filesystem identifier. Do not infer the user's language, locale, or preferences from its name or path, even if it resembles a language code such as 'ru'.
Prefer answering inline in chat unless using local files would make the result more useful.
```

Assembled at run time (paths and e-mail addresses masked):

```text
Use work/ for intermediate files, scratch analysis, scripts, drafts, and temporary assets. Use <path> only for user-facing deliverables that should appear as outputs.
When referring to saved deliverables in the final response, link only files from <path>
```

One line published on [Other model-facing text](../desktop-model-facing-text/).

### 2. Memory

Source: developer message 2 of 8, 16,821 characters.

15 lines published on [CLI prompt templates](../codex-cli-prompts/).

*3 lines of the user's own content, not shown.*

4 lines published on [CLI prompt templates](../codex-cli-prompts/).

*2 lines of the user's own content, not shown.*

4 lines published on [CLI prompt templates](../codex-cli-prompts/).

*One line of the user's own content, not shown.*

One line published on [CLI prompt templates](../codex-cli-prompts/).

*2 lines of the user's own content, not shown.*

69 lines published on [CLI prompt templates](../codex-cli-prompts/).

*One line of the user's own content, not shown.*

2 lines published on [CLI prompt templates](../codex-cli-prompts/).

*One line of the user's own content, not shown.*

3 lines published on [CLI prompt templates](../codex-cli-prompts/).

*77 lines of the user's own content, not shown.*

3 lines published on [CLI prompt templates](../codex-cli-prompts/).

### 3. Skills

Source: developer message 3 of 8, 22,226 characters.

4 lines published on [CLI prompt templates](../codex-cli-prompts/).

*149 lines of the user's own content, not shown.*

### 4. Permissions

Source: developer message 4 of 8, 362 characters.

One line published on [config.toml reference](../codex-config/).

Assembled at run time (paths and e-mail addresses masked):

```text
Filesystem sandboxing defines which files can be read or written. `sandbox_mode` is `danger-full-access`: No filesystem sandboxing - all commands are permitted. Network access is enabled.
```

One line published on [CLI prompt templates](../codex-cli-prompts/).

Shipped in the app, not yet on this site:

```text
</permissions instructions>
```

### 5. Collaboration mode

Source: developer message 5 of 8, 920 characters.

Assembled at run time (paths and e-mail addresses masked):

```text
<collaboration_mode># Collaboration Mode: Default
```

8 lines published on [Conditional instruction modules](../conditional-instruction-modules/).

### 6. Recommended plugins

Source: developer message 6 of 8, 740 characters.

Shipped in the app, not yet on this site:

```text
<recommended_plugins>
Here is a list of plugins that are available but not installed.
```

Assembled at run time (paths and e-mail addresses masked):

```text
- Dropbox (app-69b31dc2110c8191b8b47dc98fe5a052@openai-curated-remote)
- Box (box@openai-curated-remote)
- Codex Security (codex-security@openai-curated-remote)
- Figma (figma@openai-curated-remote)
- Google Drive (google-drive@openai-curated-remote)
- Linear (linear@openai-curated-remote)
- Notion (notion@openai-curated-remote)
- OpenAI Developers (openai-developers@openai-curated-remote)
- Outlook Calendar (outlook-calendar@openai-curated-remote)
- Outlook Email (outlook-email@openai-curated-remote)
- SharePoint (sharepoint@openai-curated-remote)
- Slack (slack@openai-curated-remote)
- Teams (teams@openai-curated-remote)
</recommended_plugins>
```

### 7. Multi-agent role

Source: developer message 7 of 8, 2,429 characters.

Assembled at run time (paths and e-mail addresses masked):

```text
<multi_agent_role>You are `/root`, the primary agent in a team of agents collaborating to fulfill the user's goals.
```

16 lines published on [Conditional instruction modules](../conditional-instruction-modules/).

5 lines published on [CLI prompt templates](../codex-cli-prompts/).

Shipped in the app, not yet on this site:

```text
When calling `wait_agent`, prefer longer waits (minutes) to avoid busy polling.
```

Assembled at run time (paths and e-mail addresses masked):

```text
There are 4 available concurrency slots, meaning that up to 4 agents can be active at once, including you.

Full-history forks (`fork_turns` omitted or `"all"`) inherit the parent model and reasoning effort and do not accept overrides. Only set `model` or `reasoning_effort` when explicitly requested by the user, applicable `AGENTS.md` instructions, or skill instructions; when doing so, set `fork_turns` to `"none"` or a positive integer string.</multi_agent_role>
```

### 8. Multi-agent mode

Source: developer message 8 of 8, 271 characters.

Assembled at run time (paths and e-mail addresses masked):

```text
<multi_agent_mode>Any earlier instruction enabling proactive multi-agent delegation no longer applies. Do not spawn sub-agents unless the user or applicable AGENTS.md/skill instructions explicitly ask for sub-agents, delegation, or parallel agent work.</multi_agent_mode>
```

## The user's context

### AGENTS.md instructions

Source: user-role context message, 3,205 characters.

*33 lines of the user's own content, not shown.*

### Environment context

Source: user-role context message, 655 characters.

Fields: `cwd`, `shell`, `current_date`, `timezone`, `filesystem`, `workspace_roots`, `root`. Their values (working directory, date, time zone, file system and workspace roots) describe the user's machine and are not shown.

## Turn settings

### Turn context

Source: the session's turn context for the first turn.

| Setting | Value in this session |
| --- | --- |
| `model` | `gpt-6-astra` |
| `effort` | `high` |
| `summary` | `detailed` |
| `personality` | `pragmatic` |
| `approval_policy` | `never` |
| `approvals_reviewer` | `user` |
| `multi_agent_version` | `v2` |
| `realtime_active` | `false` |
| `sandbox_policy` | `danger-full-access` |
| `collaboration_mode` | `default` |

Also present, values not shown because they may describe the account or machine: `turn_id`, `root_turn_id`, `disabled_plugin_ids`, `cwd`, `workspace_roots`, `current_date`, `timezone`, `permission_profile`, `active_permission_profile`, `comp_hash`, `cyber_access_program`.

### World state

Source: the session's world state, the per-thread record of which context sections are active.

| Section | In this session |
| --- | --- |
| `agents_md` | present |
| `apps_instructions` | off |
| `collaboration_mode` | present |
| `context_window_guidance` | empty |
| `environments` | present |
| `environments_instructions` | off |
| `git_attribution` | off |
| `host_skills` | present |
| `managed_developer_instructions` | empty |
| `model` | `gpt-6-astra` |
| `multi_agent_mode` | present |
| `multi_agent_usage_hint` | set |
| `permissions` | present |
| `persistent_mode` | empty |
| `plugins_instructions` | off |
| `realtime` | present |
| `skills` | present |

## After the first message

### Tools and reasoning

Source: the rest of the session log.

Tools the model called in this session: `exec` (29), `js` (12), `untrusted_input` (2). Their definitions are on [Tool manifest (live)](../tool-manifest/). Arguments and results are not shown.

Reasoning items: 33, all stored encrypted; 9 carry a readable summary, not shown.
