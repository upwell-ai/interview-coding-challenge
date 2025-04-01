// Example script for parsing an invoice image
import path from 'path';
import { parseInvoiceImage } from './imageParser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function parseImageExample() {
  try {
    // Path to the sample invoice image
    const imagePath = path.resolve(__dirname, '../Sample-Invoice-1.png');
    
    console.log(`Parsing invoice image: ${imagePath}`);
    console.log('This may take a moment...');
    
    // Parse the invoice image
    const parsedInvoice = await parseInvoiceImage(imagePath);
    
    // Display the results
    console.log('\nParsed Invoice Data:');
    console.log(JSON.stringify(parsedInvoice, null, 2));
    
    return parsedInvoice;
  } catch (error) {
    console.error('Error in parseImageExample:', error);
    throw error;
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  parseImageExample()
    .then(() => console.log('\nInvoice image parsing completed successfully'))
    .catch(error => console.error('\nInvoice image parsing failed:', error));
}

export { parseImageExample };
