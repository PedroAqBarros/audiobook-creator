import React, { useState, useRef, useEffect } from 'react';
import speakText from './speechFunctions';
import { pauseReading, resumeReading, stopReading, handleSpeedChange } from './controlsFunctions';
import { readFile } from './pdfFunctions';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const fileInputRef = useRef(null);
  
  const [voices, setVoices] = useState([]);
  const [currentVoice, setCurrentVoice] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [utterance, setUtterance] = useState(null);


    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                setCurrentVoice(availableVoices[0]);
            }
        };
        if (window.speechSynthesis) {
            loadVoices();
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, [window.speechSynthesis]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            readFile(file, setPages);
        }
    };


  return (
    <div>
      <h1>Leitor de PDF</h1>
      <button onClick={() => fileInputRef.current.click()}>Escolher Arquivo</button>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      {selectedFile && <p>Arquivo selecionado: {selectedFile.name}</p>}
      {pages && pages.length > 0 && <button onClick={() => setUtterance(speakText(pages[currentPage], currentVoice, setIsReading, setIsPaused, utterance, speed))}>Iniciar Leitura</button>}
      { voices.length > 0 && (<><p>Selecione uma voz</p>
      <select value={currentVoice ? currentVoice.name : ''} onChange={(e) => {if(utterance) { window.speechSynthesis.cancel() }; setCurrentVoice(voices.find(voice => voice.name === e.target.value)); setUtterance(speakText(pages[currentPage], voices.find(voice => voice.name === e.target.value), setIsReading, setIsPaused, utterance, speed))}}>
        {voices.map(voice => <option key={voice.name} value={voice.name}>{voice.name}</option>)}
      </select></>)}
      {currentVoice && <p>Voz atual: {currentVoice.name}</p>}
      {isReading && !isPaused && <button onClick={() => pauseReading(setIsPaused)}>Pausar</button>}
      {isReading && isPaused && <button onClick={() => resumeReading(setIsPaused)}>Continuar</button>}
      {isReading && <button onClick={() => stopReading(setIsReading, setIsPaused, setPages)}>Parar</button>}
      {pages.length > 0 && (
        <div>
          <p>Velocidade: {speed.toFixed(1)}x</p>
          <input type="range" min="0.2" max="2" step="0.1" value={speed} onChange={(e) => handleSpeedChange(parseFloat(e.target.value), utterance, setUtterance, setSpeed)} />
        </div>
      )}

      {pages.length > 0 && (
        <>
          <button onClick={() => { if (currentPage > 0) setCurrentPage(currentPage - 1) }}>
            Pagina Anterior
          </button>
          <button onClick={() => { if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1) }}>
            Próxima Pagina
          </button>
        </>
      )}
      {pages.length > 0 && <div>{pages[currentPage]}</div>}
    </div>
  )
}

export default App;