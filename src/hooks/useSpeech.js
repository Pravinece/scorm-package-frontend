import { useRef, useState, useCallback } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { getSpeechToken } from "../api/chatApi";

// Runs directly in the browser against Azure over the Speech SDK's own
// streaming connection (not proxied through the backend) - the backend's
// /speech-token endpoint just hands this hook a short-lived token.
export default function useSpeech(voiceName) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(null); // null unknown, else true/false

  const tokenRef = useRef(null); // { token, region, voice, fetchedAt }
  const synthesizerRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const recognizerRef = useRef(null);

  const ensureToken = useCallback(async () => {
    if (tokenRef.current && Date.now() - tokenRef.current.fetchedAt < 8 * 60 * 1000) {
      return tokenRef.current;
    }
    const res = await getSpeechToken();
    if (!res.success) throw new Error(res.message);
    tokenRef.current = { ...res.data, fetchedAt: Date.now() };
    return tokenRef.current;
  }, []);

  const makeConfig = useCallback(
    (tok) => {
      const cfg = SpeechSDK.SpeechConfig.fromAuthorizationToken(tok.token, tok.region);
      cfg.speechSynthesisVoiceName = voiceName || tok.voice;
      return cfg;
    },
    [voiceName]
  );

  const speak = useCallback(
    async (text) => {
      if (!text) return;
      try {
        const tok = await ensureToken();
        setVoiceAvailable(true);
        if (synthesizerRef.current) {
          synthesizerRef.current.close();
          synthesizerRef.current = null;
        }
        const cfg = makeConfig(tok);
        const audioPlayer = new SpeechSDK.SpeakerAudioDestination();
        audioPlayerRef.current = audioPlayer;
        audioPlayer.onAudioStart = () => setSpeaking(true);
        audioPlayer.onAudioEnd = () => setSpeaking(false);

        const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(audioPlayer);
        const synthesizer = new SpeechSDK.SpeechSynthesizer(cfg, audioConfig);
        synthesizerRef.current = synthesizer;

        await new Promise((resolve) => {
          synthesizer.speakTextAsync(
            text,
            () => {
              if (synthesizerRef.current) {
                synthesizerRef.current.close();
                synthesizerRef.current = null;
              }
              resolve();
            },
            () => {
              if (synthesizerRef.current) {
                synthesizerRef.current.close();
                synthesizerRef.current = null;
              }
              resolve();
            }
          );
        });
      } catch (err) {
        setVoiceAvailable(false);
        setSpeaking(false);
        console.error("[speech] TTS unavailable:", err.message);
      }
    },
    [ensureToken, makeConfig]
  );

  const skipSpeech = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (synthesizerRef.current) {
      synthesizerRef.current.close();
      synthesizerRef.current = null;
    }
    setSpeaking(false);
  }, []);

  const listenOnce = useCallback(
    (onInterim) =>
      new Promise(async (resolve) => {
        if (recognizerRef.current) {
          resolve("");
          return;
        }
        try {
          const tok = await ensureToken();
          setVoiceAvailable(true);
          const cfg = makeConfig(tok);
          const recognizer = new SpeechSDK.SpeechRecognizer(cfg, SpeechSDK.AudioConfig.fromDefaultMicrophoneInput());
          recognizerRef.current = recognizer;
          setListening(true);

          recognizer.recognizing = (_s, e) => onInterim?.(e.result.text);

          recognizer.recognizeOnceAsync(
            (result) => {
              const text = result.reason === SpeechSDK.ResultReason.RecognizedSpeech ? result.text.trim() : "";
              recognizer.close();
              recognizerRef.current = null;
              setListening(false);
              resolve(text);
            },
            (err) => {
              console.error("[speech] recognition error:", err);
              recognizer.close();
              recognizerRef.current = null;
              setListening(false);
              resolve("");
            }
          );
        } catch (err) {
          setVoiceAvailable(false);
          setListening(false);
          console.error("[speech] STT unavailable:", err.message);
          resolve("");
        }
      }),
    [ensureToken, makeConfig]
  );

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      const r = recognizerRef.current;
      recognizerRef.current = null;
      r.close();
    }
    setListening(false);
  }, []);

  return { listening, speaking, voiceAvailable, speak, skipSpeech, listenOnce, stopListening };
}
