# Spotr demo video

The 45-second demo linked from the main README, built with [Remotion](https://www.remotion.dev).
The rendered file is committed at [`../public/spotr-demo.mp4`](../public/spotr-demo.mp4), so the
Pages deploy serves it at https://bjyeo.github.io/Team-Friday/spotr-demo.mp4. GitHub's file
view will not play a video this size, so the README links to the Pages URL instead.

```bash
npm i
npm run dev                                         # Studio preview at http://localhost:3000
npx remotion render SpotrDemo out/spotr-demo.mp4    # render (out/ is gitignored)
cp out/spotr-demo.mp4 ../public/spotr-demo.mp4      # then commit the new render
```

## How it is put together

- `src/SpotrDemo.tsx` is the timeline: nine scenes joined by 15-frame transitions.
- `src/scenes/` holds the scenes. `TextScenes.tsx` has the hook, title and outro.
  `AppScenes.tsx` has the six app walkthrough steps.
- `public/shots/` are real screenshots of the live site, captured at 390×844 with a device
  scale factor of 3. Tap and highlight positions in `AppScenes.tsx` are in those
  screenshot pixels (1170 wide), so if the UI changes, recapture the shots and recheck the
  positions.
- Colours and the Archivo typeface match `src/styles/tokens.css` in the app.

Each scene is also registered on its own under **Scenes** in Studio, and its caption text
can be edited there.

Remotion is free for teams of up to three people. Larger teams need a company license
([terms](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)).
