import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  filename?: string;
  onProgress?: (step: string) => void;
}

/**
 * Captures an HTML element and converts it into a multi-page, professional A4 PDF.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename = 'financial-report.pdf',
  onProgress?: (step: string) => void
): Promise<void> {
  onProgress?.('Preparing document for capture...');

  // Ensure element is visible and styled properly for capture
  const originalWidth = element.style.width;
  element.style.width = '800px';

  // Wait for any pending font or chart rendering
  await new Promise((resolve) => setTimeout(resolve, 250));

  onProgress?.('Rendering high-resolution canvas...');

  const canvas = await html2canvas(element, {
    scale: 2, // 2x resolution for ultra-sharp text and charts
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 850,
  });

  // Restore original width
  element.style.width = originalWidth;

  onProgress?.('Assembling PDF pages...');

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const printWidth = pageWidth - margin * 2;
  const printHeight = pageHeight - margin * 2;

  const imgWidth = printWidth;
  const imgHeight = (canvas.height * printWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;
  let page = 1;

  // First page
  pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= printHeight;

  // Subsequent pages if content overflows A4 height
  while (heightLeft > 0) {
    position = margin - (page * printHeight);
    pdf.addPage();
    page++;
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= printHeight;
  }

  // Add subtle page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `FinCalc Report · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  onProgress?.('Saving file...');
  pdf.save(filename);
}
