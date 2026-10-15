// Each avatar maps to a video clip and an Azure voice used for TTS.
// Drop your 4 real clips into public/assets/avatars/ using these exact
// file names, or edit the `video` paths below to match your files.
//
// If you have separate idle/talk clips per avatar later, add a `talk`
// field here (e.g. talk: "/assets/avatars/chandra-talk.mp4") — AvatarStage
// already checks for it and will switch clips on speaking state. Without
// it, the single `video` clip just keeps looping and the state pill /
// waveform communicate speaking vs idle instead.
export const AVATARS = [
  {
    id: "chandra",
    name: "Chandra",
    talk: `${import.meta.env.BASE_URL}assets/avatars/chandra-talk.mp4`,
    idle: `${import.meta.env.BASE_URL}assets/avatars/chandra-idle.mp4`,
    voice: "en-US-AvaMultilingualNeural",
  },
  {
    id: "vikas",
    name: "Vikas",
    talk: `${import.meta.env.BASE_URL}assets/avatars/vikas-talk.mp4`,
    idle: `${import.meta.env.BASE_URL}assets/avatars/vikas-idle.mp4`,
    voice: "en-US-AndrewMultilingualNeural",
  },
  // {
  //   id: "meera",
  //   name: "Meera",
  //   video: "/assets/avatars/meera.mp4",
  //   voice: "en-US-EmmaMultilingualNeural",
  // },
  // {
  //   id: "arjun",
  //   name: "Arjun",
  //   video: "/assets/avatars/arjun.mp4",
  //   voice: "en-GB-OllieMultilingualNeural",
  // },
];

export const DEFAULT_AVATAR_ID = AVATARS[0].id;
