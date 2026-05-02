---
title: X DOM Findings
type: note
---

# X DOM Findings

Captured from signed-in `https://x.com/home` with `agent-browser`.

## Main Shell

- Left nav: `header[role="banner"] nav`
- Main feed: `[data-testid="primaryColumn"]`
- Right rail: `[data-testid="sidebarColumn"]`, also exposed in the accessibility tree as `aside[aria-label="Trending"]`
- Timeline cells: `[data-testid="cellInnerDiv"]`
- Tweets: `article[data-testid="tweet"]`
- Composer textbox: `[data-testid="tweetTextarea_0"]`
- Composer toolbar: `[data-testid="toolBar"]`
- Search input: `[data-testid="SearchBox_Search_Input"]`

## More Menu

Clicking `header[role="banner"] [data-testid="AppTabBar_More_Menu"]` opens:

- Popup root: `div[role="menu"]`
- Computed popup style before extension:
  - `position: fixed`
  - `background-color: rgb(0, 0, 0)`
  - `color: rgb(230, 233, 234)`
  - `border: 0px solid rgb(0, 0, 0)`
  - white dark-mode box shadow
- Inner dropdown: `[data-testid="Dropdown"]`
- Links inside include:
  - `a[href$="/lists"]` text `Lists`
  - `a[href$="/communities"]` text `Communities`
  - `a[href="/i/verified-orgs-signup"]` text `Business`
  - `a[href^="https://ads.x.com"]` text `Ads`
  - `a[href="/i/spaces/start"]` text `Create your Space`
  - `a[data-testid="settings"][href="/settings"]` text `Settings and privacy`

Important: the hovered menu row itself can get `background-color: rgb(22, 24, 28)`, so popup row background needs a direct high-specificity override.

## Account Menu

Clicking `button[aria-label="Account menu"]` opens:

- Popup root: `[data-testid="HoverCard"]`
- Text observed: `Add an existing account`, `Log out @DmitryKarg8355`
- Computed popup style before extension:
  - `background-color: rgb(0, 0, 0)`
  - `color: rgb(230, 233, 234)`
  - `border: 0px solid rgb(0, 0, 0)`
  - white dark-mode box shadow

## Tweet More Menu

Clicking the tweet caret (`article[data-testid="tweet"] [data-testid="caret"]`) opens:

- Popup root: `div[role="menu"]`
- Inner dropdown: `[data-testid="Dropdown"]`
- Computed popup style before extension:
  - `position: absolute`
  - `background-color: rgb(0, 0, 0)`
  - `color: rgb(230, 233, 234)`
  - `border: 0px solid rgb(0, 0, 0)`
- Items observed: `Not interested in this post`, `Follow @...`, `Add/remove from Lists`, `Mute`, `Block @...`, `View post activity`, `Embed post`, `Report post`, `Request Community Note`

## Tweet Actions

Live geometry for action buttons shows the count text starts about `18.75px` from the button's left edge:

- Reply example: button width `46.71px`, count starts at `x + 18.75`
- Repost example: button width `49.89px`, count starts at `x + 18.75`
- Like example: button width `55.05px`, count starts at `x + 18.75`

Replacement icons must sit near the left edge of the button, not centered in the whole button, or they overlap counts.

## Right Rail Surfaces

The right rail exposes several card-like sections without stable class names:

- Search form: `form[role="search"]` with `[data-testid="SearchBox_Search_Input"]`
- Premium card: `aside[aria-label="Subscribe to Premium"]`
- News card: heading text `Today’s News`; content is under the trending aside and uses dark class backgrounds
- Trends card: `section[role="region"]` with heading `Trending now` and/or `aria-label="Trending now"`
- Follow card: `aside[aria-label="Who to follow"]`

## Dark Surfaces Seen In Live DOM

- `[data-testid="primaryColumn"]` uses dark class background.
- `[data-testid="primaryColumn"]` has `background-color: rgb(0, 0, 0)` and X border color `rgb(47, 51, 54)`.
- Composer wrappers and `[data-testid="toolBar"]` use dark class background.
- Search wrapper uses dark class background around the input.
- Right rail cards use dark class background:
  - premium subscribe card
  - Today’s News card
  - What’s happening section
  - Who to follow section
- Video elements naturally report black background. Do not force video internals white.

## Extension Rules

- Keep X layout. Do not translate or rebuild nav rows.
- Replace only nav/action glyphs.
- Paper should be white, not cream.
- Menu/popover/dialog roots and menu rows must be white paper with ink text.
- Use visible but not heavy hand-drawn borders on tweets and right-rail sections.

## Border Shape Notes

The CSS Borders 4 draft defines two modes for `border-shape`:

- One shape means stroke mode: the border is drawn as a stroke along that path, with width coming from the relevant border side.
- Two shapes means fill mode: the border is painted as the area between the outer and inner paths.

For this extension, use one polygon/shape only. Two polygons created the heavy black band seen in the timeline cards. A single `polygon(...)` plus `border-width: 1-1.5px` gives the intended wire/sketch line. The fallback is an SVG background stroke in `::after`, also one line, not a second border.
