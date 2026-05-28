# <Feature Name>

> **Version:** v1.0 | v1.1 | v1.2-Pro | v2.0 | DEFERRED
> **Tier:** Free | Pro
> **Page:** <page name + link to page README>
> **Status:** designed | in-progress | shipped | dropped
> **Owner section in PLAN.md:** §X.Y

## Purpose

One sentence: what problem this feature solves.

## User story

"As a `<user type>`, I want `<action>` so that `<outcome>`."

## Behaviour

What the feature does, step by step or as a bulleted spec. No code; describe rules.

- Behaviour rule 1
- Behaviour rule 2

## Inputs

- **IPC calls consumed:** `<method>` (PLAN §4.3) — describe arguments + when fired
- **User input:** what the user clicks / types / drops
- **State read:** which Zustand stores or service state this depends on

## Outputs

- **IPC calls fired:** `<method>` (PLAN §4.3)
- **State written:** which stores updated
- **Events emitted:** which `event.*` IPC events the service may emit back

## UI states

| State | When | What user sees |
|---|---|---|
| Empty | <condition> | <ui> |
| Loading | <condition> | <ui> |
| Success | <condition> | <ui> |
| Error | <condition> | <ui> |
| Disabled | <condition> | <ui> |

## Edge cases

- Edge case 1: how it's handled
- Edge case 2: ...

## Accessibility

- Keyboard reachable: yes / no
- ARIA roles / labels
- Screen reader announcements

## Telemetry (opt-in only)

- Event name: `<event-name>` (if any)
- Properties: list of fields
- When emitted

## Cross-links

- Related features: [[other-feature]]
- PLAN.md: §X.Y
- PROJECT.md: §X
- IPC methods: `<method>` (§4.3)

## Open questions

- Anything unresolved that the implementer must decide before coding.
