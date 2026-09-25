export const categories = [
  {
    label: "Findings",
    files: [
      {
        path: "outputs/security-review-map-2026-09-24.md",
        format: "markdown",
        title: "Key findings",
        defaultOpen: true
      },
      {
        path: "outputs/chatgpt-work-source-check-2026-09-24.md",
        format: "markdown",
        title: "ChatGPT Work",
        defaultOpen: true
      },
      {
        path: "outputs/chatgpt-work-gpt6-client-trace-2026-09-24.json",
        format: "source",
        title: "Sanitized GPT-6 Work client trace",
        defaultOpen: false
      },
      {
        path: "outputs/voice-tool-surface-2026-09-24.md",
        format: "markdown",
        title: "Voice tools",
        defaultOpen: true
      },
      {
        path: "outputs/codex-gpt6-model-prompt-comparison-2026-09-24.json",
        format: "source",
        title: "Three-model prompt comparison",
        defaultOpen: false
      },
      {
        path: "outputs/codex-luna-surface-check-2026-09-24.json",
        format: "source",
        title: "Astra/Luna source check",
        defaultOpen: false
      }
    ]
  },
  {
    label: "Codex GPT-6 instructions",
    files: [
      {
        path: "outputs/aeon-persistent-instructions-2026-09-24.md",
        format: "markdown",
        title: "Persistent mode instructions",
        instructionProfile: "persistent",
        defaultOpen: true
      },
      {
        path: "outputs/gpt-6-astra-base-instructions-2026-09-24.md",
        format: "markdown",
        title: "Astra base instructions",
        instructionProfile: "base",
        defaultOpen: true
      },
      {
        path: "outputs/gpt-6-sol-base-instructions-2026-09-24.md",
        format: "markdown",
        title: "Sol base instructions",
        instructionProfile: "base",
        defaultOpen: false
      },
      {
        path: "outputs/gpt-6-luna-base-instructions-2026-09-24.md",
        format: "markdown",
        title: "Luna base instructions",
        instructionProfile: "base",
        defaultOpen: false
      },
      {
        path: "outputs/gpt-6-astra-instruction-modules-2026-09-24.md",
        format: "markdown",
        title: "Conditional instruction modules",
        instructionProfile: "modules",
        defaultOpen: true
      },
      {
        path: "outputs/gpt-6-astra-model-messages-2026-09-24.json",
        format: "source",
        title: "Raw captured Astra record",
        defaultOpen: false
      },
      {
        path: "outputs/gpt-6-sol-model-messages-2026-09-24.json",
        format: "source",
        title: "Raw captured Sol record",
        defaultOpen: false
      },
      {
        path: "outputs/gpt-6-luna-model-messages-2026-09-24.json",
        format: "source",
        title: "Raw captured Luna record",
        defaultOpen: false
      },
      {
        path: "outputs/gpt-6-astra-instruction-stack-2026-09-24.metadata.json",
        format: "source",
        title: "Capture and verification metadata",
        defaultOpen: false
      }
    ]
  },
  {
    label: "Codex voice prompts",
    files: [
      {
        path: "outputs/codex-voice-prompts-2026-09-24.md",
        format: "markdown",
        title: "Bundled Codex voice prompts",
        instructionProfile: "voice",
        defaultOpen: true
      }
    ]
  },
  {
    label: "Other desktop prompts",
    files: [
      {
        path: "outputs/codex-desktop-helper-prompts-2026-09-24.md",
        format: "markdown",
        title: "Codex helper prompt inventory",
        promptText: true,
        defaultOpen: false
      },
      {
        path: "outputs/codex-prompt-provenance-inventory-2026-09-24.json",
        format: "source",
        title: "Prompt provenance inventory",
        defaultOpen: false
      }
    ]
  },
  {
    label: "Observed runtime and tools",
    files: [
      {
        path: "outputs/aeon-current-responses-2026-09-24.json",
        format: "source",
        title: "Current response samples",
        defaultOpen: false
      },
      {
        path: "outputs/aeon-native-tools-2026-09-24.md",
        format: "markdown",
        title: "Persistent tool signals",
        defaultOpen: false
      },
      {
        path: "outputs/aeon-tools-and-tool-calls.md",
        format: "markdown",
        title: "Tool and call inventory notes",
        defaultOpen: false
      },
      {
        path: "outputs/current-host-tool-manifest-2026-09-24.json",
        format: "source",
        title: "Complete host tool manifest",
        defaultOpen: false
      }
    ]
  },
  {
    label: "Extraction evidence",
    files: [
      {
        path: "outputs/binwalk-aeon-daybreak-report.md",
        format: "markdown",
        title: "Binwalk report",
        defaultOpen: false
      },
      {
        path: "outputs/binwalk-method-diff.json",
        format: "source",
        title: "Protocol method diff",
        defaultOpen: false
      },
      {
        path: "outputs/binwalk-codename-byte-scan.json",
        format: "source",
        title: "Model alias byte scan",
        defaultOpen: false
      }
    ]
  },
  {
    label: "Historical archive",
    files: [
      {
        path: "outputs/aeon-core-instructions.md",
        format: "markdown",
        title: "Earlier Aeon core prompt",
        instructionProfile: "historical-core",
        defaultOpen: false
      },
      {
        path: "outputs/aeon-assembled-instructions.md",
        format: "markdown",
        title: "Earlier assembled prompt",
        instructionProfile: "historical-assembled",
        defaultOpen: false
      }
    ]
  }
];
