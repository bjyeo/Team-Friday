import { Composition, Folder } from "remotion";
import { SpotrDemo } from "./SpotrDemo";
import { Browse, Detail, Filter, Nearby, Report, SignIn } from "./scenes/AppScenes";
import { Hook, Outro, Title } from "./scenes/TextScenes";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SpotrDemo"
        component={SpotrDemo}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Scenes">
        <Composition
          id="Hook"
          component={Hook}
          durationInFrames={120}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ line1: "You travel 20 minutes.", line2: "Every seat is taken." }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={105}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ tagline: "Know there's a seat before you travel." }}
        />
        <Composition
          id="SignIn"
          component={SignIn}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            step: "01 · Sign in",
            title: "Students only.",
            body: "Any Singapore university or polytechnic email. It never leaves your phone.",
          }}
        />
        <Composition
          id="Nearby"
          component={Nearby}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            step: "02 · Find spots",
            title: "Start from where you are.",
            body: "Use your location, or type an area, MRT station or postcode.",
          }}
        />
        <Composition
          id="Browse"
          component={Browse}
          durationInFrames={210}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            step: "03 · Browse",
            title: "Live seat counts.",
            body: "Reported by students already sitting there. Old reports are marked Unconfirmed, never passed off as fresh.",
          }}
        />
        <Composition
          id="Filter"
          component={Filter}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            step: "04 · Filter",
            title: "Only what you need.",
            body: "Power sockets, quiet, air-con, open 24/7. One tap each.",
          }}
        />
        <Composition
          id="Detail"
          component={Detail}
          durationInFrames={195}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            step: "05 · Decide",
            title: "Everything before you go.",
            body: "Seats, crowd, power and hours, then straight into your maps app.",
          }}
        />
        <Composition
          id="Report"
          component={Report}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            step: "06 · Report",
            title: "Arrived? Tap once.",
            body: "Your answer updates the spot for the next student.",
          }}
        />
        <Composition
          id="Outro"
          component={Outro}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            headline: "Find a seat in seconds.",
            url: "bjyeo.github.io/Team-Friday",
            footnote: "Free. No app to install. Works on any phone or laptop.",
          }}
        />
      </Folder>
    </>
  );
};
