import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IterationData, BudgetParams } from '../types/budget';

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

export const exportChartToPDF = async (
  iterations: IterationData[],
  budgetParams: BudgetParams,
  metrics: { totalBudget: number; consumedBudget: number; consumptionRate: number }
) => {
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
    const pageMargin = 10;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const availableWidth = pdfWidth - (pageMargin * 2);
    const ratio = Math.min(availableWidth / imgWidth, 80 / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    const imgX = (pdfWidth - scaledWidth) / 2;
    const imgY = pageMargin;

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      scaledWidth,
      scaledHeight
    );

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: budgetParams.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    let yPosition = imgY + scaledHeight + 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Budget Metrics', pageMargin, yPosition);
    yPosition += 6;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Budget: ${formatCurrency(metrics.totalBudget)}`, pageMargin, yPosition);
    yPosition += 5;
    pdf.text(`Consumed Budget: ${formatCurrency(metrics.consumedBudget)}`, pageMargin, yPosition);
    yPosition += 5;
    pdf.text(`Consumption Rate: ${metrics.consumptionRate.toFixed(1)}%`, pageMargin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Iterations', pageMargin, yPosition);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const colX1 = pageMargin;
    const colX2 = pageMargin + 50;
    const colX3 = pageMargin + 100;

    pdf.text('Iteration', colX1, yPosition);
    pdf.text('Total Hours', colX2, yPosition);
    pdf.text('Iteration Cost', colX3, yPosition);
    yPosition += 5;

    pdf.setFont('helvetica', 'normal');

    const standardCost =
      budgetParams.costPerHour *
      budgetParams.teamSize *
      budgetParams.workingDaysPerIteration *
      8;

    iterations.forEach((iteration) => {
      if (yPosition > pdfHeight - 15) {
        pdf.addPage();
        yPosition = pageMargin;
      }

      const iterationCost = iteration.totalHours
        ? iteration.totalHours * budgetParams.costPerHour
        : standardCost;

      if (iteration.isCurrent) {
        pdf.setFillColor(255, 243, 205);
        pdf.rect(colX1 - 2, yPosition - 3.5, pdfWidth - (pageMargin * 2), 5, 'F');
        pdf.setFont('helvetica', 'bold');
      }

      pdf.text(`Iteration ${iteration.iterationNumber}`, colX1, yPosition);
      pdf.text(iteration.totalHours?.toString() || '-', colX2, yPosition);
      pdf.text(formatCurrency(iterationCost), colX3, yPosition);

      if (iteration.isCurrent) {
        pdf.setFont('helvetica', 'normal');
      }

      yPosition += 5;
    });

    pdf.save(`budget-report-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Failed to export chart as PDF:', error);
    alert('Failed to export chart as PDF');
  }
};
