import { InvoiceParser, InvoiceData } from '../invoiceParser';

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
                    invoiceNumber: 'INV-12345',
                    invoiceDate: '2023-04-15',
                    dueDate: '2023-05-15',
                    vendorName: 'Acme Supplies',
                    vendorAddress: '123 Business St, Commerce City, NY 10001',
                    customerName: 'Tech Solutions Inc',
                    customerAddress: '456 Innovation Ave, San Francisco, CA 94103',
                    items: [
                      {
                        description: 'Web Development Services',
                        quantity: 40,
                        unitPrice: 150,
                        amount: 6000
                      },
                      {
                        description: 'UI/UX Design',
                        quantity: 20,
                        unitPrice: 200,
                        amount: 4000
                      }
                    ],
                    subtotal: 10000,
                    taxAmount: 800,
                    totalAmount: 10800,
                    currency: 'USD',
                    paymentTerms: 'Net 30'
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

describe('InvoiceParser', () => {
  let parser: InvoiceParser;
  
  beforeEach(() => {
    parser = new InvoiceParser('fake-api-key');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should parse invoice text into structured data', async () => {
    // Sample invoice text
    const invoiceText = `
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
    `;
    
    // Parse the invoice
    const result = await parser.parseInvoice(invoiceText);
    
    // Verify the structure and content of the parsed data
    expect(result).toBeDefined();
    expect(result.invoiceNumber).toBe('INV-12345');
    expect(result.vendorName).toBe('Acme Supplies');
    expect(result.items).toHaveLength(2);
    expect(result.totalAmount).toBe(10800);
    expect(result.currency).toBe('USD');
  });
  
  it('should throw an error when OpenAI returns no content', async () => {
    // Override the mock for this specific test
    const openaiModule = require('openai');
    openaiModule.mockImplementationOnce(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: null
                  }
                }
              ]
            })
          }
        }
      };
    });
    
    const parser = new InvoiceParser('fake-api-key');
    const invoiceText = 'Invalid invoice content';
    
    await expect(parser.parseInvoice(invoiceText)).rejects.toThrow('No content returned from OpenAI');
  });
});
