import Tesseract from "tesseract.js";

export default function Ocr() {
  const extract = async (file) => {
    try {
      if (!file) return;

      const result = await Tesseract.recognize(file, "eng");
      const ocrText = result.data.text;

      return {
        number: extractMobile(ocrText),
        amount: extractAmount(ocrText),
        reference: extractReference(ocrText),
        date: extractDate(ocrText),
      };
    } catch (error) {
      console.error("OCR error:", error);
    }
  };

  return {
    extract: extract,
  };
}

function extractAmount(ocrText) {
  return (
    ocrText.match(/Amount\s+([\d,.]+)/i)?.[1] ||
    ocrText.match(/PHP\s*([\d,]+(?:\.\d+)?)/i)?.[1] ||
    ocrText.match(/-\s*[^0-9\s]*\s*([\d,]+\.\d{2}|\d+)/)?.[1] ||
    ""
  );
}

function extractMobile(ocrText) {
  return ocrText.match(/\+63\s\d{3}\s\d{3}\s?\d{4}/)?.[0] ?? "";
}

function extractReference(ocrText) {
  return (
    ocrText.match(/Ref\s*No\.?\s*([\d\s]+)/i)?.[1] ||
    ocrText.match(/Ref\.\sNo\.\s([\d\s]+)/i)?.[1] ||
    ocrText.match(/Reference\sNumber\s*([\d\s]+)/i)?.[1] ||
    ""
  );
}

function extractDate(ocrText) {
  return (
    ocrText.match(
      /([A-Z][a-z]{2}\s\d{1,2},\s\d{4}\s\d{1,2}:\d{2}\s[AP]M)/g
    )?.[0] ||
    ocrText.match(/Transfer\s*Date[:-]?\s*(.+)/i)?.[1] ||
    ocrText.match(
      /(\d{1,2}\s+[A-Z][a-z]+\s+\d{4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*[AP]M)/i
    )?.[1] ||
    ocrText.match(
      /Pending\s(\d{1,2}\s[A-Z][a-z]{2}\s\d{4},\s\d{1,2}:\d{2}[AP]M)/i
    )?.[1] ||
    ocrText.match(
      /Processing\s([A-Z][a-z]{2}\s\d{1,2},\d{4},\s\d{1,2}:\d{2}[AP]M)/i
    )?.[1] ||
    ""
  );
}
