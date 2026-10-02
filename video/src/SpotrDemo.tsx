import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { Browse, Detail, Filter, Nearby, Report, SignIn } from "./scenes/AppScenes";
import { Hook, Outro, Title } from "./scenes/TextScenes";

// 9 scenes, 8 transitions of 15 frames: 1470 - 120 = 1350 frames, 45 s at 30 fps.
export const SpotrDemo = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Hook" durationInFrames={120} premountFor={fps}>
        <Hook line1="You travel 20 minutes." line2="Every seat is taken." />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Title" durationInFrames={105} premountFor={fps}>
        <Title tagline="Know there's a seat before you travel." />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence name="Sign in" durationInFrames={180} premountFor={fps}>
        <SignIn
          step="01 · Sign in"
          title="Students only."
          body="Any Singapore university or polytechnic email. It never leaves your phone."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Location" durationInFrames={150} premountFor={fps}>
        <Nearby
          step="02 · Find spots"
          title="Start from where you are."
          body="Use your location, or type an area, MRT station or postcode."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Browse" durationInFrames={210} premountFor={fps}>
        <Browse
          step="03 · Browse"
          title="Live seat counts."
          body="Reported by students already sitting there. Old reports are marked Unconfirmed, never passed off as fresh."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Filter" durationInFrames={165} premountFor={fps}>
        <Filter
          step="04 · Filter"
          title="Only what you need."
          body="Power sockets, quiet, air-con, open 24/7. One tap each."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Detail" durationInFrames={195} premountFor={fps}>
        <Detail
          step="05 · Decide"
          title="Everything before you go."
          body="Seats, crowd, power and hours, then straight into your maps app."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Report" durationInFrames={180} premountFor={fps}>
        <Report
          step="06 · Report"
          title="Arrived? Tap once."
          body="Your answer updates the spot for the next student."
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
      <TransitionSeries.Sequence name="Outro" durationInFrames={165} premountFor={fps}>
        <Outro
          headline="Find a seat in seconds."
          url="bjyeo.github.io/Team-Friday"
          footnote="Free. No app to install. Works on any phone or laptop."
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
