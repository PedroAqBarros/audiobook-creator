import * as pdfjsLib from 'pdfjs-dist';
import cleanText from './textFunctions';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/build/pdf.worker.min.mjs`;

const extractTextFromPDF = (pdfFile) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onload = async function () {
            try {
                const typedArray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                let allPagesText = [];
                for(let i = 1; i <= pdf.numPages; i++){
                    pdf.getPage(i).then(function(page){
                      page.getTextContent().then(function(textContent){
                        let pageText = '';
                        for (let j = 0; j < textContent.items.length; j++) {
                          pageText += textContent.items[j].str + ' ';
                        }
                        allPagesText.push(pageText);
                        if(allPagesText.length === pdf.numPages){
                            resolve(allPagesText)
                        }
                      })
                    })
                  }

            } catch (error) {
                reject(error)
            }
        };
        fileReader.onerror = function() {
            reject();
        }
        fileReader.readAsArrayBuffer(pdfFile);
    });
};

const readFile = (file, setPages) => {
    extractTextFromPDF(file).then(allPagesText => {
        setPages(allPagesText)
    });
};

export { readFile };