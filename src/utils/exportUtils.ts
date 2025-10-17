import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportChartToPNG = async () => {
  const chartElement = document.getElementById('budget-chart');
  if (!chartElement) {
    alert('Chart not found');
    return;
  }

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = `budget-chart-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to export chart as PNG:', error);
    alert('Failed to export chart as PNG');
  }
};

export const exportChartToPDF = async () => {
  const chartElement = document.getElementById('budget-chart');
  if (!chartElement) {
    alert('Chart not found');
    return;
  }

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    pdf.save(`budget-chart-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Failed to export chart as PDF:', error);
    alert('Failed to export chart as PDF');
  }
};
