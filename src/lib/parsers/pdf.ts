"use client";

/**
 * Extracts raw text from a PDF file using pdfjs-dist.
 * We use the legacy build or direct import that works in browser environments.
 */
export async function parsePdf(buffer: ArrayBuffer): Promise<string> {
  console.log("PDF Parsing started...", buffer.byteLength, "bytes");
  try {
    const pdfjs = await import("pdfjs-dist");
    
    // Use the official CDN for the worker, matching the local version
    const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log("Using worker from:", workerSrc);

    const loadingTask = pdfjs.getDocument({ 
      data: buffer,
      useWorkerFetch: true,
      isEvalSupported: false,
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
