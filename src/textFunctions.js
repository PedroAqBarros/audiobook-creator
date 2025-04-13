function cleanText(text) {
  return text.replace(/[_,.:;)(]/g, ' ');
}

export default cleanText;