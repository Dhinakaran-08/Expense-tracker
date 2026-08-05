import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import Button from '../ui/Button';

export default function ExportButtons({ transactions = [], profile = {} }) {
  const exportPDF = () => {
    if (transactions.length === 0) return;

    const doc = new jsPDF();
    const userName = profile?.full_name || 'User';

    // Title
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241);
    doc.text('ExpenseIQ — Personal Financial Report', 14, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated for: ${userName}`, 14, 28);
    doc.text(`Report Date: ${format(new Date(), 'dd MMMM yyyy, HH:mm')}`, 14, 34);

    // Summary calculation
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense;

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Total Income: Rs. ${totalIncome.toLocaleString('en-IN')} | Total Expense: Rs. ${totalExpense.toLocaleString('en-IN')} | Net Balance: Rs. ${netBalance.toLocaleString('en-IN')}`,
      14,
      44
    );

    // Table
    const tableRows = transactions.map((t) => [
      format(parseISO(t.date), 'dd/MM/yyyy'),
      t.type.toUpperCase(),
      t.category,
      `Rs. ${Number(t.amount).toLocaleString('en-IN')}`,
      t.description || '—',
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Date', 'Type', 'Category', 'Amount', 'Description']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    });

    doc.save(`Expense_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        icon={FileText}
        onClick={exportPDF}
        disabled={transactions.length === 0}
      >
        Export PDF
      </Button>
    </div>
  );
}
