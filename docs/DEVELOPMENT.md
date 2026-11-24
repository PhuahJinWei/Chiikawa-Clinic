# Chiikawa Clinic: development notes

How the game is put together, how to replace or add artwork, and the decisions made so far. For
what the game is, see the [README](../README.md).

Paths under `artifacts/` refer to the source artwork and references kept on the author's own
disk; that folder is not part of this repository.

An unofficial, non-commercial fan game. You run a tiny clinic for one day at a time, in first
person, as whoever is on shift. It is more of a help centre than a hospital: people come with a
fever, a cold, a stomach ache, a bruise, or a small disaster of their own, like a broken fork. The rooms are drawn; the
characters and props are placeholder shapes for now.

## Run it

```
npm install
npm run dev
```

Open http://localhost:5173. To try it on a phone on the same Wi-Fi, run `npm run dev:phone`
instead and open the "Network" address it prints.

The game is landscape. A phone held upright shows it turned sideways, so you only turn the phone
itself; rotation lock does not need to be switched off.

Add `?day=60` to the address to make a clinic day last 60 seconds instead of 3 minutes.

## Versions and updates

The title screen shows which build is running in its top-right corner, for example
`v1.0.0  2026-11-24  548f043`: the version from `package.json` (bump it by hand when you want
to), then the date and short id of the commit the build was made from (automatic).

Every build also writes the same stamp to `version.json`. The published game fetches that file
fresh when it loads, when its tab comes back into view, and at the end of each day. If the server
has a different build, the page reloads into it, but only where nothing is lost: on the title
screen, or between two days (the day number is carried across). If a reload comes back with the
old build, which can happen for some minutes after a deploy, it waits five minutes before trying
again. None of this runs under `npm run dev`. The code is in `src/update.ts` and
`vite.config.ts`.

`npm run preview` serves the built game from `dist/`, which is the way to try this locally.

## How it plays

| Room | You are | What you do |
| --- | --- | --- |
| Door | the nurse | The whole screen is the view through the peephole, bent toward the rim. Listen and look, then let them in or send them home. Either is your call; nothing marks it right or wrong. Only three seats inside. |
| Waiting room | the nurse | Tap a patient to bring them forward. Ask what is wrong, take their temperature if they look ill, then sort them: in to the doctor, or straight to the counter when the trouble is plain to see. Tap the dimmed room to step back. |
| Doctor room | the doctor | One instrument: a light to look down the throat, which shows a close-up with no caption. Tap the chart peeking in from the right: the patient stays on the left with the chart beside them. Circle what you saw; tap anywhere off the chart to turn back. The chart names the trouble by itself when it can; or circle a trouble yourself at any time, which ends the exam at once. |
| Help counter | reception | Every visit ends here. Read the paper that came with the patient: the doctor's note, or just the nurse's memo if they skipped the doctor. Put it down, pick the fix from the shelf, hand it over. |

The face in the bottom-right corner is who you are in the current room.

| Trouble | Temperature | Throat | Fix |
| --- | --- | --- | --- |
| ねつ (fever) | high | fine | げねつざい |
| かぜ (cold) | a little | red | かぜぐすり |
| はらいた (stomach ache) | none | fine | いぐすり |
| あざ (bruise) | none | fine | しっぷ |
| こまりごと (a personal trouble) | none | fine | おたすけ |

The chart names the trouble from what is written on it: the throat circle, then the nurse's
temperature, then what the nurse heard. If the nurse skipped a step and several troubles still
fit, they are marked in yellow and the doctor picks one by looking at the patient. Sending
someone the long way round is never punished: a broken fork sent to the doctor still gets helped, only
later, and a fever sent straight to the counter leaves the clerk to judge without a diagnosis.

Time runs in real time from 9:00 to 17:00. Nothing punishes being slow; you simply see fewer
patients. Not everyone at the door says clearly what is wrong, but how they look always shows it.

Everyone talks the way they do in the original, and nobody is given words they would not say.
Lines live in `CHARACTERS` in `src/game/data.ts`: `says` (a line per trouble) for those who
explain things, `cries` for the rest, and `thanks` / `puzzled` for the counter.

| Character | At the door | Right thing handed over | Wrong thing | Basis |
| --- | --- | --- | --- | --- |
| ちいかわ | cries only: ワッ・・, ヤダッ | ワッ・・! フ! | ・・ヤダッ | Speaks in short words and gestures; those three sounds are the ones listed for the character |
| ハチワレ | explains, casually | ありがとう! たすかったよ! | ・・ってコト!? | The talker of the three; "・・ってコト!?" is the character's own phrase |
| うさぎ | cries only: ウラ, ヤハ, プルルルル, フゥン | ヤハ! | ハァ? | Never thanks anyone in words; all five cries are listed for the character |
| ラッコ | explains, tersely | たすかった | ・・これは ちがうな | Speaks, hunts with a sword. The terse plain wording is ours: no source describes his phrasing |
| シーサー | explains, politely | ありがとうございます! | あれ・・ これで あってますか? | Described as polite and cheerful. No dialect words: only the anime voice has an accent |
| ふるほんや | wordless: ・・・・ | ・・! | ・・? | Does not speak in words, like ちいかわ; no sounds are documented, so none are made up |
| モモンガ | demands attention, says nothing useful, ends in ゾ | やったゾ!! | イーヤーヤダヤダ! | Speaks in bossy plain sentences; both replies are the character's own lines |
| くりまんじゅう | wordless: ・・・・ | ・・! and, for the opened can, ハァーッ! | ・・? | Does not speak; ハァーッ is the sound after a drink |

## Replacing the placeholder art

Drop PNG files with these names into `src/assets/`. Each one replaces its placeholder
automatically; anything missing keeps its placeholder. Backgrounds and close-ups can be JPG
instead, since they need no transparency (a PNG with the same name wins if both exist).
Everything else wants a transparent background.

WebP works too. The room drawings already in the game are stored as WebP, which is about 20 times
smaller than PNG and matters on phones (the seven of them come to about 0.8 MB). To replace one,
drop in the new PNG with the same name, which wins over the WebP, and delete the old `.webp`.

| File | What it is | Canvas |
| --- | --- | --- |
| `characters/<id>.png` | A character cutout as they normally look, standing, feet on the bottom edge, centred | 800 x 920 |
| `characters/<id>.<trouble>.png` | The character with each trouble: `fever`, `cold`, `tummy`, `bruise`, `personal`. Until one exists the game draws a simple mark over the plain drawing instead | 800 x 920 |
| `characters/<id>.sit.png` | The character sitting on the waiting-room bench. There is one per character, the same whatever their trouble, so the trouble only shows once they stand. Same canvas as standing. Without it the standing drawing is used | 800 x 920 |
| `characters/<id>.nurse.png`, `characters/<id>.doctor.png` | The character in uniform, shown while they are on shift: on the title screen, and as their face on the shift card and in the corner. Reception wears the nurse's | 800 x 920 |
| `characters/<id>.happy.png` | Optional. Shown at the counter once they have been helped; falls back to the plain file | 800 x 920 |
| `bg/door.png`, `bg/waiting.png`, `bg/doctor.png`, `bg/counter.png` | Room backgrounds | 2400 x 1350 |
| `bg/title.png` | The title screen: the clinic from outside, with its name on the signboard. The game stands the start signboard on the ground in front of the doors (stage x 730 to 1190, y 800 to 1066) and tapes the language notice to the right-hand door, so keep those plain. The one here is `artifacts/generated/rooms/clinic-exterior-title-day-v2-white-sign.png`. Without it the door view stands in, with the name written on a board | 2400 x 1350 |
| `bg/<room>.day.png`, `bg/<room>.evening.png`, `bg/<room>.night.png` | Optional. The same room at three times of day (below). The door has all three; a missing one falls back to the plain file | 2400 x 1350 |
| `fg/doctor.png`, `fg/counter.png` | Optional. What sits in front of the patient: the edge of the desk, the counter. Leave it out when the background already has it and nobody needs to be behind it, as in the doctor room | 2400 x 1350 |
| `bg/counter-shelf.png` | The cabinet of fixes, as a transparent layer over the counter wall. The one here was made from `artifacts/generated/rooms/medicine-wall-cabinet-2x3-empty.png` (a cabinet filling its own picture), scaled to 42.3% and set at x 1148, y 214 of the layer. Its six cubbies are where `CABINET` in `src/stage/art.tsx` says; the game stands a fix and its name card inside each of the first five. Without the picture the game draws a stand-in | 2400 x 1350 |
| `fg/doctor-clipboard.png` | The board the chart is clipped to, with its clip and a blank sheet of paper, on a transparent background. The game writes straight onto the drawn paper, which it expects at x 42 to 1017, y 90 to 892 of a 1060 x 940 drawing (the top 40 is headroom for the clip). The one here was fitted to that from `artifacts/generated/rooms/chart-clipboard-blank-v2-wide.png`. Without it the game draws its own board, clip and sheet | 1060 x 940 |
| `fg/doctor-desk.png` | Optional. The doctor's side desk seen from above, which slides in from the right behind the chart. Its left edge is the desk's edge; only the left 1120 is on a 16:9 screen, and the chart covers most of that | 1700 x 1350 |
| `icons/<id>.png` | A portrait of the character's head on a transparent background, for the round face icons: the name tab on the speech bubble and the photo on the chart and the counter paper. The ones here come from `artifacts/asset/portraits/` | 256 x 256 |
| `closeups/throat.ok.png`, `closeups/throat.red.png` | The inside of the mouth: healthy (きれい), and red (まっか). The doctor sees it through a round view about 45% as wide as the picture and drags to look around, starting low on the tongue, so put what matters (the throat) away from the bottom edge. Nothing on screen says which one it is | 1400 x 1400 |
| `tools/throat.png` | The doctor's penlight | 256 x 256 |
| `fixes/<id>.png` | Each thing on the counter's shelf, also shown in the bag (ids below) | 320 x 360 |
| `items/<character id>.png` | The thing a character's personal trouble is about, shown large on the counter's card (table below) | 500 x 500 |
| `signs/door.png`, `signs/waiting.png`, `signs/doctor.png`, `signs/counter.png` | The room signs down the left edge | 128 x 128 |
| `ui/ask.png`, `ui/temp.png`, `ui/go.png` | Small pictures for asking and for the thermometer (on the choices, the note strip, the chart and the guide), and the arrow the game lays over a room picture on a choice that sends someone there. Drawn on the same square as the room pictures so the arrow lines up. The ones here, like the room pictures and the penlight, come from `artifacts/generated/buttons/` | 500 x 500 |

Character ids: `chiikawa`, `hachiware`, `usagi`, `rakko`, `shisa`, `furuhonya`, `momonga`,
`kurimanju`. Everyone who is not on shift that day can turn up as a patient.

Standing is used at the door, in the doctor's room, at the counter, and when a waiting patient is
tapped and gets up to talk. Each character needs a plain drawing, one per trouble, and one
sitting. Drawn characters are shown 1.2 times the size of their canvas, about the feet, because
the canvas keeps headroom for tall ears (`.wob > img` in `src/styles.css`). A cutout standing
still does not move.

`personal` is a different small disaster for each character, written in `CHARACTERS` in
`src/game/data.ts`:

| Character | Personal trouble | At the counter | Picture |
| --- | --- | --- | --- |
| ちいかわ | フォークが おれた (fork has snapped) | mend it | `items/chiikawa` |
| ハチワレ | カメラが こわれた (camera is broken) | mend it | `items/hachiware` |
| うさぎ | まゆげが へん (eyebrows look odd) | draw them again with a pencil | `items/usagi` |
| ラッコ | けんに ひび (sword is cracked) | mend it | `items/rakko` |
| シーサー | おなかが すいた (hungry) | a bag of sata-panbin | `items/shisa` |
| 古本屋 | ほんが やぶれた (books are torn) | fresh copies | `items/furuhonya` |
| モモンガ | おなかが すいた (hungry) | a wrapped candy | `items/momonga` |
| くりまんじゅう | かんが あかない (can won't open) | open it | `items/kurimanju` |

At the counter every personal trouble is answered with the toolbox. Taking the toolbox out for a
patient who has one opens a card: the picture above on top, what is wrong, what to do, and a
button that does it.

| Fix id | On the shelf as | For |
| --- | --- | --- |
| `feverMed` | げねつざい | fever |
| `coldMed` | かぜぐすり | cold |
| `stomachMed` | いぐすり | stomach ache |
| `compress` | しっぷ | bruise |
| `toolbox` | おたすけ | a personal trouble |

Backgrounds: the middle 1920 x 1080 of the canvas is always on screen and matches the layout
sketches. The margin around it (240 left and right, 135 top and bottom) shows only on screens
wider or taller than 16:9, so keep anything important out of it. On the 2400 x 1350 canvas, the
game puts the cabinet at x 1166 to 2144, y 255 to 755 of the counter wall, so leave that place plain.

Times of day: the clinic clock runs from 9:00 to 17:00. Evening starts at 14:30 and night at
16:00, and night stays after closing. Each one fades in over four seconds. The times are
`EVENING_MIN` and `NIGHT_MIN` at the top of `src/game/state.ts`.

Where characters stand and where the fixes sit are a few numbers at the top of each file in
`src/scenes/` (`SEATS`, `FRONT`, `SPOT`, `CHAIR`, `NEXT`), and the cabinet's cubbies are `CABINET` in
`src/stage/art.tsx`. They are set for the current
drawings: the bench, the doctor's room and the counter. Move them if a room is redrawn.

The marks the game draws for a trouble (a flush, a sniffle, a bruise) are only stand-ins.
They disappear for a character as soon as that character has their own drawing of the trouble
(`FxArt` in `src/stage/art.tsx`).

## The camera look

- The door is seen through a fisheye: edges are squeezed toward the middle and colours split
  near the rim. Draw the door views flat; the game bends them. The strength is `STRENGTH` at the
  top of `src/stage/lens.tsx`.
- Every room has light film grain and a soft darkening toward the edges.
- Opening the doctor's chart turns the camera toward the side desk: the room slides left and the
  desk comes in from the right (`.cam` and `.sidedesk` in `src/styles.css`).
- "Lens" in the pause menu switches the fisheye and grain off, for phones that struggle with it.

## Where things are

- `src/game/data.ts`: all content. Characters, troubles, fixes, the shift roster.
- `src/game/state.ts`: the rules and the clock. Timing constants are at the top.
- `src/scenes/`: one file per room.
- `src/ui/`: the dialogue note, chart, guide, HUD, title and results screens.
- `src/i18n.ts`: every piece of interface text, Japanese and English.
- `src/stage/`: stage scaling, cutouts, placeholder drawings, art loading, the lens and grain.

## Decisions so far

- 2D with fixed views; no free walking.
- Landscape, 16:9 safe area, styled as an illustrated game rather than an app.
- First person as the staff on shift: nurse at the door and waiting room, doctor in the doctor
  room, reception at the counter. Stand-ins take over on leave days.
- Real-time day, no penalty for slowness.
- A day is three real minutes and at most ten visits: the five who are not on duty, twice each,
  the second time with a different trouble. Knocks are spread over the day, and once the last
  visitor has gone the clock runs on to 17:00 and the clinic closes. The numbers are at the top
  of `src/game/state.ts`.
- Japanese by default, English optional.
- The doctor circles what the throat looked like by hand; close-ups carry no caption.
- Circling it lets the chart name the trouble by itself when the notes allow. Circling a trouble
  directly ends the exam at once. There is no separate stamp button.
- The doctor's chart opens side by side with the patient, like the booth and desk in Papers,
  Please. A full look-down that took the patient off screen was tried and dropped.
- The door is a full-screen peephole view with a fisheye lens; the rooms share a grainy camera
  look. Cute, not creepy: colours stay as drawn.
- Who you are is shown as a face icon in the bottom-right corner, not a label at the top.
- The view from the door follows the clinic clock: day, then evening from 14:30, then night from
  16:00.
- At the counter the patient stands between two layers, the wall behind and the counter in front.
- The clinic is a help centre with five troubles: fever, cold, stomach ache, bruise, and a
  personal trouble that differs by character (a broken fork, a can that will not open). Each has
  one fix.
- The doctor's only examination is the inside of the mouth. Chest and tummy checks were removed.
- Each character gets their own drawing for each trouble, rather than marks added by the game.
- Sending a visitor home at the door is the player's own choice and is not judged.
- The counter is a help counter where every visit ends. The nurse may send a patient straight
  there, past the doctor.
- Characters sit only on the waiting-room bench, with one sitting drawing each whatever the
  trouble. Everywhere else they stand, including in the doctor's room, close to the desk.
- Cutouts do not wobble or sway while standing still.
- Staff are drawn in uniform while on shift. Only characters with drawings are in the game.
- The game's text is set in ちいかフォント by lavsic (https://booth.pm/ja/items/6401206), kept as
  the original file in `src/fonts/`. It has kana, digits and Latin capitals only, so the game's
  text uses no kanji; digits and other symbols are drawn in Yomogi, and so is all English text. Its terms forbid modifying or
  redistributing the file, so check with the author before publishing the repository.
- The title, the morning line-up and the day's log are small scenes built from the rooms and the
  staff in uniform, not plain cards: the clinic sign over the neighbourhood, the three on shift
  behind the counter with name plates, and a taped-up log sheet at night.
- A character talking is a speech bubble with its tail toward them. What you can see, or have found
  out by asking or the thermometer, is on a yellow strip under it. Choices are plain paper buttons in a
  hand-drawn outline: a small picture, then the word, and nothing else. One already done is
  faded and ticked in red pen; one that cannot be chosen is faded with the reason under it.
- The doctor's chart and the counter paper are hand-filled forms. The form is printed in one
  dull ink (headings, captions, rules, pictures); what was written on it is in darker ink on
  ruled lines, with the words slightly askew; the only colour is the doctor's red pen: the
  circles and the seal. Writing only breaks between words. A high temperature is underlined,
  a skipped note is left faint, and troubles the chart cannot choose between are ringed in
  dashed pencil. On the chart the nurse's notes are on the left and the doctor's part (throat,
  then the five troubles, two to a row) on the right. The counter paper leads with the
  doctor's answer: the five troubles in one line, the circled one in ink and the rest faded.
- The guide is a page of the doctor's blue notebook, in the same one-ink hand: column heads
  carry the chart's little pictures, what gives a trouble away is in red pen and underlined,
  and what tells nothing is left faint.
- The pause note and the day's log follow the same hand: no ruled lines or coloured controls.
  On the pause note each setting's choices are written out and the one in force is ringed in
  red pen. The day's log has the three totals in boxes, a red circle beside each spot-on
  visit and a red triangle beside each wrong one, and the doctor's seal in the corner. The
  big green button on each stays a game button, not part of the paper.
- The morning line-up uses the same paper: a taped heading over the three on shift, the day on
  a tear-off wall calendar, a taped memo under it for whoever is off, and a name card on the
  counter for each (job and room sign printed, name written). No coloured role tags.
- The title is the clinic from outside. The four staff stand in a row in front of it, clear
  of each other, with the start button between them as a white signboard standing on the
  ground (only its word moves, a slow nod). The language is a small notice taped high on the
  right-hand door with the current one ringed in red, and the fan-game line is small text in
  the top-left corner.
- The room tabs down the left edge are plain paper: the room's picture and its name. The room
  you are in has its tab pulled out a little and its name ringed in red pen. A count, or a
  "!" for someone at the door, is written in a plain circle at the tab's corner, and the door
  tab wags when someone knocks.
- Pause is a round paper button with two bars in the top-right corner; the counter's cabinet
  hangs low enough to leave it room. Tapping the clock pauses too. The pause
  note is the only way to the settings and to ending the day early.
- In the doctor's room the two things to do are plain buttons low on the right, beside the
  patient: のど (ticked in red once looked at) and カルテ, which turns to the chart. Tapping the
  patient opens and closes the chart too. The throat button under the open chart is the same
  plain paper. The chart button's picture is the game's own until there is a `ui/chart`.
- The day does not just cut in. Before the line-up, the wall calendar hangs large in the middle,
  yesterday's page tears off, the calendar goes to its place and the staff and their cards turn
  up one after another (about three seconds). After かいいん!, the clinic is seen from outside,
  the view moves in on its doors with a chime, and the day starts out of white (under two
  seconds). At closing time the screen comes up out of dusk with a falling chime, a slip says
  the clinic is shut, and then the staff and the day's log arrive (about three seconds). None
  of the three can be skipped.
- In the waiting room the thermometer shows as a slip of plain paper over the patient's head:
  its picture and three dots that ink in while it counts, then the reading. It is there on
  the bench as well as up close, so you can see who has been measured.
- Under the open chart, the throat button and the guide button are the same plain paper; the
  guide's has a small notebook drawn on it until there is a `ui/guide`. The throat view is a
  round window with one ink outline and a plain paper rim, with no label and no hints. The
  room's two buttons stay usable under it, so the chart can be opened straight from looking.
- The name tab on a speech bubble is plain paper. At the door, when nobody is outside, a small
  slip says so.
- On the end-of-day screen the three who were on shift stand side by side on the ground beside
  the log, feet on one line (`standY` in `src/stage/stand.ts` knows where each uniform
  drawing's feet are). The buttons that move the day on (かいいん!, つづける, つぎの ひ へ) are white
  paper with a green stitched line, like the title's start sign.
- Moving about is shown, in the manner of paper cutouts pushed on and off from the side. Walking
  to a room further into the clinic (door, waiting room, doctor, counter), it comes in from
  the right; walking back, from the left. A patient arriving while you watch, or just sent
  in, slides in from the left; one already there when you walk in is simply there. A patient
  sent on slides out to the right, one who is done at the counter back out to the left, and
  the next in line steps up to the desk. Each takes under half a second (`EXIT_MS`).
- At the counter, the chosen fix drops into a paper bag standing on a plain tray: its top half
  shows over the bag's edge, and the bag has the clinic's cross and the patient's name on it.
  The hand-over button beside it is the same plain paper button as every other choice, with the
  go-to arrow. A personal trouble opens a taped sheet in the papers' one ink: the picture, what
  is wrong over a double rule, what to do, and a plain button that does it.
- Looking down the throat is done by hand: a round view opens over the patient and the doctor
  drags to move around inside the mouth. Opening the chart puts the penlight away.
