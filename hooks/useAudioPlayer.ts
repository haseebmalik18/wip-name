import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';

      const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };

      const handleLoadedMetadata = () => {
        setDuration(audioRef.current?.duration || 0);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        audioRef.current?.pause();
        audioRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current?.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const initAudioContext = useCallback(() => {
    if (audioRef.current && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.3;

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
  }, []);

  const loadTrack = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, []);

  const play = useCallback(async () => {
    if (audioRef.current) {
      try {
        if (!audioRef.current.src) {
          return;
        }

        initAudioContext();

        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err: any) {
        if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
          console.error('Error playing audio:', err);
        }
        setIsPlaying(false);
      }
    }
  }, [initAudioContext]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    loadTrack,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
    analyser: analyserRef.current,
    audioContext: audioContextRef.current,
  };
}
