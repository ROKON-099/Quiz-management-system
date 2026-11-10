package com.quizrank.backend.service;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import java.io.File;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.Locale;

@Service
public class PdfTextExtractionService {
 public String extract(Path path) throws Exception {
  try(PDDocument document=Loader.loadPDF(path.toFile())) {
   if(document.isEncrypted()) throw new IllegalArgumentException("Encrypted PDFs are not supported.");
   String raw=new PDFTextStripper().getText(document);
   if(raw==null || raw.replaceAll("\\s+","").length()<30)
    throw new IllegalArgumentException("This PDF has no extractable text. It may be scanned; OCR is not enabled.");
   return Normalizer.normalize(raw,Normalizer.Form.NFKC).replace('\u0000',' ').replaceAll("[\\p{Cntrl}&&[^\\r\\n\\t]]"," ");
  }
 }
 public String normalize(String text) {
  return Normalizer.normalize(text==null?"":text,Normalizer.Form.NFKC).toLowerCase(Locale.ROOT)
   .replaceAll("[^\\p{L}\\p{N}\\s]"," ").replaceAll("\\s+"," ").trim();
 }
}
