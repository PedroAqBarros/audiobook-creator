import { useState, useEffect, useRef } from 'react';

export default function AudiobookCreator() {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [voice, setVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const utteranceRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Selecionar uma voz em português como padrão, se disponível
        const portugueseVoice = voices.find(v => 
          v.lang.includes('pt') || v.lang.includes('PT'));
        setVoice(portugueseVoice || voices[0]);
      }
    };
    
    loadVoices();
    
    // Alguns navegadores carregam as vozes de forma assíncrona
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    setFileName(file.name);
    
    try {
      // Simular processamento do PDF
      // Em um app real, você usaria uma biblioteca como pdf.js
      const text = await simulateTextExtraction(file);
      setText(text);
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      alert("Erro ao processar o arquivo. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função simulada para extrair texto
  const simulateTextExtraction = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (file.name.toLowerCase().includes('pdf')) {
          resolve(`Conteúdo extraído do arquivo ${file.name}. 
          
Este é um exemplo de texto que seria extraído de um arquivo PDF real. Em uma implementação completa, usaríamos uma biblioteca como pdf.js para extrair o conteúdo real do documento.

Este aplicativo permite que você transforme qualquer documento de texto em um audiolivro. Você pode ajustar a velocidade da leitura e escolher entre diferentes vozes disponíveis no seu sistema.

Basta fazer o upload de um arquivo PDF ou de texto, e então clicar em "Iniciar Leitura" para começar a ouvir o conteúdo.`);
        } else {
          resolve(`Conteúdo do arquivo ${file.name}. Este é um texto de exemplo para demonstração do aplicativo de audiolivro.`);
        }
      }, 1500);
    });
  };
  
  const startReading = () => {
    if (!text) return;
    
    // Cancelar qualquer leitura em andamento
    window.speechSynthesis.cancel();
    
    // Criar nova instância de fala
    const utterance = new SpeechSynthesisUtterance();
    utteranceRef.current = utterance;
    
    // Configurar a fala
    utterance.text = text.substring(currentPosition);
    utterance.rate = speed;
    if (voice) utterance.voice = voice;
    
    // Eventos
    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
      setCurrentPosition(0);
    };
    
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    
    // Iniciar leitura
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
    setIsPaused(false);
  };
  
  const pauseReading = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };
  
  const resumeReading = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };
  
  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setCurrentPosition(0);
  };
  
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    
    if (isReading && !isPaused) {
      // Reiniciar a leitura com a nova velocidade
      const currentText = text.substring(currentPosition);
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.rate = newSpeed;
      if (voice) utterance.voice = voice;
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const handleVoiceChange = (e) => {
    const selectedVoice = availableVoices.find(v => v.name === e.target.value);
    setVoice(selectedVoice);
    
    if (isReading && !isPaused) {
      // Reiniciar a leitura com a nova voz
      const currentText = text.substring(currentPosition);
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.rate = speed;
      utterance.voice = selectedVoice;
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Criador de Audiolivro</h1>
      
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Escolher Arquivo
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.txt,.doc,.docx"
          />
          {fileName && (
            <span className="text-gray-600">{fileName}</span>
          )}
        </div>
        
        {isLoading && (
          <div className="text-center mt-4">
            <p className="text-gray-600">Processando arquivo...</p>
            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full animate-pulse w-1/2"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          {!isReading ? (
            <button 
              onClick={startReading}
              disabled={!text || isLoading}
              className={`bg-green-500 text-white px-6 py-2 rounded-lg ${!text || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'} transition duration-300`}
            >
              Iniciar Leitura
            </button>
          ) : isPaused ? (
            <button 
              onClick={resumeReading}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Continuar
            </button>
          ) : (
            <button 
              onClick={pauseReading}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
            >
              Pausar
            </button>
          )}
          
          {isReading && (
            <button 
              onClick={stopReading}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Parar
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Velocidade: {speed}x</label>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={speed} 
              onChange={handleSpeedChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Voz:</label>
            <select 
              value={voice?.name || ''} 
              onChange={handleVoiceChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {availableVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Conteúdo do Documento:</h2>
        {text ? (
          <div className="max-h-64 overflow-y-auto p-4 bg-white rounded border border-gray-200">
            {text.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Nenhum texto carregado.</p>
        )}
      </div>
      
      <div className="mt-8 text-center text-gray-600">
        <p>Este aplicativo utiliza a API Web Speech para converter texto em fala.</p>
        <p className="text-sm mt-2">As vozes disponíveis dependem do seu sistema operacional.</p>
      </div>
    </div>
  );
}