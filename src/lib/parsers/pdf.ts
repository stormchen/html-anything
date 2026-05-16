"use client";

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 * We use the legacy build or direct import that works in browser environments.
 */
export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  console.log("PDF Parsing started...", buffer.byteLength, "bytes");
  try {
    const pdfjs = await import("pdfjs-dist");
    
    // 使用本地 Worker（放在 public/pdf.worker.min.mjs），不依賴外部 CDN
    // 這樣在局域網路或無外網的環境下也能正常解析 PDF
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    console.log("Using local worker: /pdf.worker.min.mjs");

    const loadingTask = pdfjs.getDocument({ 
      data: buffer,
    });
    
    const pdf = await loadingTask.promise;
    console.log("PDF loaded, pages:", pdf.numPages);
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += strings + "\n\n";
    }

    console.log("PDF Parsing finished, length:", fullText.length);
    return fullText.trim();
  } catch (err) {
    console.error("PDF Parsing error:", err);
    throw err;
  }
}
