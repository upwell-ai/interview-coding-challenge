import { createOpenAIClient, classifyInvoice, InvoiceClassification, InvoiceType } from '../invoiceParser';
import OpenAI from 'openai';

// Sample invoice texts for different types
const SAMPLE_INVOICES = {
  standard: `
    INVOICE
    Invoice #: INV-12345
    Date: April 15, 2023
    Due Date: May 15, 2023
    
    From:
    Acme Supplies
    123 Business St
    Commerce City, NY 10001
    
    To:
    Tech Solutions Inc
    456 Innovation Ave
    San Francisco, CA 94103
    
    ITEMS:
    Web Development Services | 40 hours | $150/hr | $6,000
    UI/UX Design | 20 hours | $200/hr | $4,000
    
    Subtotal: $10,000
    Tax (8%): $800
    Total: $10,800
    
    Payment Terms: Net 30
  `,
  purchase_order: `
    PURCHASE ORDER #PO-789012
    Date: March 10, 2023
    
    BUYER:
    Tech Solutions Inc
    456 Innovation Ave
    San Francisco, CA 94103
    
    SUPPLIER:
    Acme Supplies
    123 Business St
    Commerce City, NY 10001
    
    SHIP TO:
    Tech Solutions Inc - Warehouse
    789 Distribution Blvd
    San Francisco, CA 94105
    
    ITEMS:
    Server Hardware | 5 units | $2,000/unit | $10,000
    Network Switches | 10 units | $500/unit | $5,000
    
    Total: $15,000
    Requested Delivery: April 1, 2023
    
    Terms and Conditions: Payment due within 30 days of delivery.
  `,
  receipt: `
    RECEIPT
    Transaction #: TXN-5678
    Date: February 5, 2023
    Time: 14:30
    
    Tech Gadget Store
    789 Retail Plaza
    San Francisco, CA 94103
    
    ITEMS:
    Wireless Earbuds | 1 | $129.99
    Phone Charger | 2 | $19.99 each | $39.98
    Screen Protector | 1 | $24.99
    
    Subtotal: $194.96
    Tax (8.5%): $16.57
    Total: $211.53
    
    Payment Method: Credit Card (VISA ****4321)
    
    Thank you for your purchase!
  `,
  proforma: `
    PROFORMA INVOICE
    Reference: PRO-23456
    Date: June 20, 2023
    
    From:
    Global Exports Ltd.
    45 International Drive
    London, UK E14 9WQ
    
    To:
    Import Partners Inc.
    123 Harbor Road
    Boston, MA 02210
    
    Description:
    Manufacturing Equipment - Model X2000
    Quantity: 1 unit
    Unit Price: $45,000
    
    Shipping: $2,500
    Insurance: $1,000
    
    Total Value: $48,500
    
    Terms: 50% advance payment, 50% before shipment
    Delivery: 8-10 weeks after payment confirmation
    
    This is not a tax invoice. For customs purposes only.
  `,
  credit_note: `
    CREDIT NOTE
    Credit Note #: CN-3456
    Reference Invoice: INV-12345
    Date: May 25, 2023
    
    From:
    Acme Supplies
    123 Business St
    Commerce City, NY 10001
    
    To:
    Tech Solutions Inc
    456 Innovation Ave
    San Francisco, CA 94103
    
    REASON FOR CREDIT: Overcharge on services
    
    ITEMS:
    UI/UX Design | 5 hours | $200/hr | $1,000
    
    Subtotal: $1,000
    Tax (8%): $80
    Total Credit: $1,080
    
    This credit can be applied to future invoices or refunded to your original payment method.
  `
};

// Mock the OpenAI client
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    type: "unknown",
                    confidence: 0
                  })
                }
              }
            ]
          })
        }
      }
    };
  });
});

describe('Invoice Classification', () => {
  let client: OpenAI;
  
  beforeEach(() => {
    client = createOpenAIClient('fake-api-key');
    jest.clearAllMocks();
  });
  
  // This test should fail until the engineer implements the classification feature
  it('should correctly classify a standard invoice', async () => {
    const result = await classifyInvoice(client, SAMPLE_INVOICES.standard);
    
    // These assertions will fail with the current implementation
    expect(result.type).toBe(InvoiceType.STANDARD);
    expect(result.confidence).toBeGreaterThan(0.7); // Expect high confidence
  });
  
  // This test should fail until the engineer implements the classification feature
  it('should correctly classify a purchase order', async () => {
    const result = await classifyInvoice(client, SAMPLE_INVOICES.purchase_order);
    
    // These assertions will fail with the current implementation
    expect(result.type).toBe(InvoiceType.PURCHASE_ORDER);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  // This test should fail until the engineer implements the classification feature
  it('should correctly classify a receipt', async () => {
    const result = await classifyInvoice(client, SAMPLE_INVOICES.receipt);
    
    // These assertions will fail with the current implementation
    expect(result.type).toBe(InvoiceType.RECEIPT);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  // This test should fail until the engineer implements the classification feature
  it('should correctly classify a proforma invoice', async () => {
    const result = await classifyInvoice(client, SAMPLE_INVOICES.proforma);
    
    // These assertions will fail with the current implementation
    expect(result.type).toBe(InvoiceType.PROFORMA);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  // This test should fail until the engineer implements the classification feature
  it('should correctly classify a credit note', async () => {
    const result = await classifyInvoice(client, SAMPLE_INVOICES.credit_note);
    
    // These assertions will fail with the current implementation
    expect(result.type).toBe(InvoiceType.CREDIT_NOTE);
    expect(result.confidence).toBeGreaterThan(0.7);
  });
  
  // This test verifies that classification is integrated with parsing
  it('should include classification data in parsed invoice', async () => {
    // Set up a standard invoice for testing
    const invoiceText = SAMPLE_INVOICES.standard;
    
    // Mock the classifyInvoice function to return a specific classification
    jest.spyOn(require('../invoiceParser'), 'classifyInvoice').mockImplementation(() => {
      return Promise.resolve({
        type: InvoiceType.STANDARD,
        confidence: 0.9,
        metadata: { source: 'test' }
      });
    });
    
    // Import parseInvoice dynamically to get the mocked version
    const { parseInvoice } = require('../invoiceParser');
    
    // Parse the invoice
    const result = await parseInvoice(client, invoiceText);
    
    // Verify the classification data is included in the result
    expect(result.classification).toBeDefined();
    expect(result.classification?.type).toBe(InvoiceType.STANDARD);
    expect(result.classification?.confidence).toBe(0.9);
    expect(result.classification?.metadata).toEqual({ source: 'test' });
    
    // Restore the original implementation
    jest.restoreAllMocks();
  });
});
