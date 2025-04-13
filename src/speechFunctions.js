const speakText = (text, currentVoice, setIsReading, setIsPaused, utterance, speed) => {
    if(!currentVoice){
        currentVoice = window.speechSynthesis.getVoices()[0]
    }
        if (utterance) {
        window.speechSynthesis.cancel();
    }
    const newUtterance = new SpeechSynthesisUtterance(text);
    newUtterance.rate = speed;
    newUtterance.voice = currentVoice;

    newUtterance.onstart = () => {
        setIsReading(true);
        setIsPaused(false);
    };


    newUtterance.onend = () => {
        setIsReading(false);
        setIsPaused(false);
    };

    newUtterance.onpause = () => {
        setIsPaused(true);
    };

    newUtterance.onresume = () => {
        setIsPaused(false);
    };

    window.speechSynthesis.speak(newUtterance);
    return newUtterance;
};
export default speakText;