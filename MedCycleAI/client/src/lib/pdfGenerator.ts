import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface OrderItemDetail {
  name: string;
  company: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  senderName: string;
}

export interface BuyerInfo {
  organizationName: string;
  email: string;
  mobile: string;
}

export interface OrderWithItems {
  id: string;
  buyerId: string;
  totalAmount: string;
  paymentStatus: string | null;
  paymentId: string | null;
  deliveryStatus: string | null;
  deliveryAddress: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  items?: OrderItemDetail[];
  buyer?: BuyerInfo;
}

export interface BillData {
  order: OrderWithItems;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

export class PDFGenerator {
  static generateBill(billData: BillData): jsPDF {
    const doc = new jsPDF();
    
    // Add company header
    this.addCompanyHeader(doc, billData.companyInfo);
    
    // Add bill title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('TAX INVOICE', 105, 60, { align: 'center' });
    
    // Add order details
    this.addOrderDetails(doc, billData.order, 70);
    
    // Add items table
    this.addItemsTable(doc, billData.order.items || [], 110);
    
    // Add totals
    this.addTotals(doc, billData.order, 180);
    
    // Add footer
    this.addFooter(doc, billData.companyInfo);
    
    return doc;
  }

  private static addCompanyHeader(doc: jsPDF, companyInfo: BillData['companyInfo']) {
    // Company logo placeholder (you can replace with actual logo)
    doc.setFillColor(59, 130, 246);
    doc.rect(20, 15, 170, 25, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(companyInfo.name, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(companyInfo.address || '', 105, 32, { align: 'center' });
    doc.text(`Phone: ${companyInfo.phone || ''} | Email: ${companyInfo.email || ''}`, 105, 37, { align: 'center' });
  }

  private static addOrderDetails(doc: jsPDF, order: OrderWithItems, yPosition: number) {
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    
    const leftColumn = 20;
    const rightColumn = 120;
    
    // Bill To section
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', leftColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    
    if (order.buyer) {
      doc.text(order.buyer.organizationName || '', leftColumn, yPosition + 7);
      if (order.deliveryAddress) {
        doc.text(order.deliveryAddress, leftColumn, yPosition + 14);
      }
      doc.text(`Email: ${order.buyer.email || ''}`, leftColumn, yPosition + 21);
      doc.text(`Phone: ${order.buyer.mobile || ''}`, leftColumn, yPosition + 28);
    }
    
    // Order details
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details:', rightColumn, yPosition);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Invoice #: ${order.id.slice(-8)}`, rightColumn, yPosition + 7);
    
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A';
    doc.text(`Order Date: ${orderDate}`, rightColumn, yPosition + 14);
    
    const paymentStatus = order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING';
    doc.text(`Payment Status: ${paymentStatus}`, rightColumn, yPosition + 21);
  }

  private static addItemsTable(doc: jsPDF, items: OrderItemDetail[], yPosition: number) {
    const tableColumn = [
      "Sr. No.",
      "Medicine Name",
      "Company",
      "Quantity",
      "Unit Price (₹)",
      "Total (₹)"
    ];
    
    const tableRows = items.map((item, index) => [
      (index + 1).toString(),
      item.name || 'N/A',
      item.company || 'N/A',
      item.quantity.toString(),
      parseFloat(item.unitPrice || '0').toFixed(2),
      parseFloat(item.totalPrice || '0').toFixed(2)
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: yPosition,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      margin: { left: 20, right: 20 }
    });
  }

  private static addTotals(doc: jsPDF, order: OrderWithItems, yPosition: number) {
    const totalAmount = parseFloat(order.totalAmount || '0');
    const gstAmount = totalAmount * 0.18; // 18% GST
    const grandTotal = totalAmount + gstAmount;
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    
    const rightColumn = 150;
    
    doc.text(`Subtotal: ₹${totalAmount.toFixed(2)}`, rightColumn, yPosition, { align: 'right' });
    doc.text(`GST (18%): ₹${gstAmount.toFixed(2)}`, rightColumn, yPosition + 8, { align: 'right' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, rightColumn, yPosition + 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  }

  private static addFooter(doc: jsPDF, companyInfo: BillData['companyInfo']) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    const footerY = 270;
    
    doc.text('Thank you for your business!', 105, footerY, { align: 'center' });
    doc.text(`For any queries, contact: ${companyInfo.phone || ''} or ${companyInfo.email || ''}`, 105, footerY + 6, { align: 'center' });
    doc.text(companyInfo.website || '', 105, footerY + 12, { align: 'center' });
    
    // Add page number
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }
  }

  static downloadBill(billData: BillData, filename: string = `bill-${billData.order.id.slice(-8)}.pdf`) {
    const pdf = this.generateBill(billData);
    pdf.save(filename);
  }
}

// Default company information
export const defaultCompanyInfo = {
  name: "MedCycle AI",
  address: "123 Healthcare Street, Medical District, Mumbai - 400001",
  phone: "+91-9876543210",
  email: "support@medcycleai.com",
  website: "www.medcycleai.com"
};
