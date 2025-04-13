export const pauseReading = (setIsPaused) => {
  window.speechSynthesis.pause();
  setIsPaused(true);
};

export const resumeReading = (setIsPaused) => {
  window.speechSynthesis.resume();
  setIsPaused(false);
};

export const stopReading = (setIsReading, setIsPaused, setPages, updateIsReading) => {
  window.speechSynthesis.cancel();
  updateIsReading(current => false);
  setIsPaused(current => false);
  setPages([]);
};

export const handleSpeedChange = (newSpeed, utterance, setUtterance, setSpeed) => {
    if (utterance) {
        window.speechSynthesis.cancel();
        const newUtterance = new SpeechSynthesisUtterance(newSpeed, utterance.text);
        newUtterance.text = utterance.text
        newUtterance.voice = utterance.voice;
        newUtterance.rate = newSpeed;
        newUtterance.onstart = () => { };
        newUtterance.onend = () => { };
        newUtterance.onpause = () => { };
        newUtterance.onresume = () => { };
        window.speechSynthesis.speak(newUtterance);
        setSpeed(newSpeed);
        setUtterance(newUtterance);
    }
};