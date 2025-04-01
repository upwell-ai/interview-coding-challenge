// Load environment variables from .env file
import dotenv from 'dotenv';
import { createOpenAIClient, parseInvoice } from './index';

// Load environment variables at the beginning of your application
dotenv.config();

async function parseInvoiceExample() {
  try {
    // Create OpenAI client using API key from environment variables
    const client = createOpenAIClient();
    
    // Sample invoice text
    const invoiceText = `
    INVOICE
    Invoice #: INV-2023-456
    Date: March 25, 2025
    Due Date: April 24, 2025
    
    From:
    ABC Web Services
    789 Tech Boulevard
    San Francisco, CA 94105
    
    To:
    XYZ Corp
    123 Business Avenue
    New York, NY 10001
    
    ITEMS:
    API Integration Services | 25 hours | $175/hr | $4,375
    Database Optimization | 15 hours | $200/hr | $3,000
    
    Subtotal: $7,375
    Tax (8.5%): $626.88
    Total: $8,001.88
    
    Payment Terms: Net 30
    `;
    
    console.log('Parsing invoice...');
    const parsedInvoice = await parseInvoice(client, invoiceText);
    
    console.log('Parsed Invoice Data:');
    console.log(JSON.stringify(parsedInvoice, null, 2));
    
    return parsedInvoice;
  } catch (error) {
    console.error('Error parsing invoice:', error);
    throw error;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  parseInvoiceExample()
    .then(() => console.log('Invoice parsing completed successfully'))
    .catch(error => console.error('Invoice parsing failed:', error));
}

export { parseInvoiceExample };
