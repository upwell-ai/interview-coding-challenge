import { createOpenAIClient, InvoiceData, InvoiceType } from './invoiceParser';
import { readFileSync } from 'fs';
import OpenAI from 'openai';
import path from 'path';

/**
 * Document classification result
 */
export type DocumentClassification = {
  documentType: InvoiceType | 'BILL_OF_LADING' | 'DELIVERY_RECEIPT' | string;
  confidence: number;
  metadata?: {
    documentId?: string;
    dateIssued?: string;
    issuer?: string;
    recipient?: string;
    [key: string]: string | number | undefined;
  };
};

/**
 * Result of parsing multiple documents
 */
export type DocumentParsingResult = {
  filePath: string;
  classification: DocumentClassification;
  parsedData?: InvoiceData;
  error?: string;
};

/**
 * Parse an invoice from an image file using OpenAI's vision capabilities
 * @param imagePath Path to the invoice image file
 * @returns Structured invoice data
 */
export async function parseInvoiceImage(imagePath: string): Promise<InvoiceData> {
  return parseInvoiceImageBase64(null, imagePath);
}

/**
 * Parse an invoice from a base64-encoded image using OpenAI's vision capabilities
 * @param base64Image Base64-encoded image data
 * @param mimeType MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @returns Structured invoice data
 */
export async function parseInvoiceImageBase64(
  base64Image: string | null,
  imagePath?: string,
  mimeType?: string
): Promise<InvoiceData> {
  // Load environment variables if needed
  if (!process.env.OPENAI_API_KEY) {
    try {
      require('dotenv').config();
    } catch (error) {
      console.error('Failed to load dotenv:', error);
    }
  }

  // Create OpenAI client
  const client = createOpenAIClient();

  try {
    // If base64Image is not provided, read from file path
    let imageData: string;
    let imageType: string;
    
    if (!base64Image && imagePath) {
      // Read the image file and encode as base64
      const imageBuffer = readFileSync(imagePath);
      imageData = imageBuffer.toString('base64');
      imageType = getMimeType(imagePath);
    } else if (base64Image) {
      // Use the provided base64 image and mime type
      imageData = base64Image;
      imageType = mimeType || 'image/jpeg'; // Default to JPEG if not specified
    } else {
      throw new Error('Either base64Image or imagePath must be provided');
    }

    // Call OpenAI with the image
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert invoice parser. Extract structured data from the provided invoice image into the exact format specified in the user's instruction. Make sure to include all key fields if they are present in the image."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Parse this invoice image and extract all relevant details in a JSON object with the following structure:\n\n{\n  \"invoiceNumber\": string,\n  \"invoiceDate\": string,\n  \"dueDate\": string (optional),\n  \"vendorName\": string,\n  \"vendorAddress\": string (optional),\n  \"customerName\": string (optional),\n  \"customerAddress\": string (optional),\n  \"items\": [{ \"description\": string, \"quantity\": number, \"unitPrice\": number, \"amount\": number }],\n  \"subtotal\": number,\n  \"taxAmount\": number (optional),\n  \"totalAmount\": number,\n  \"currency\": string,\n  \"paymentTerms\": string (optional)\n}\n\nIf you can't determine a value with high confidence, use reasonable assumptions when needed." 
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageType};base64,${imageData}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    // Get the response content
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse the JSON response
    const parsedInvoice = JSON.parse(content) as InvoiceData;
    
    // Apply reasonable defaults for missing fields instead of strict validation
    // This helps handle partial information in images
    parsedInvoice.invoiceNumber = parsedInvoice.invoiceNumber || 'UNKNOWN';
    parsedInvoice.vendorName = parsedInvoice.vendorName || 'UNKNOWN';
    parsedInvoice.totalAmount = parsedInvoice.totalAmount || 0;
    parsedInvoice.currency = parsedInvoice.currency || 'USD';
    parsedInvoice.items = parsedInvoice.items || [];
    
    // Display a warning for potentially incomplete parsing
    if (parsedInvoice.invoiceNumber === 'UNKNOWN' || parsedInvoice.vendorName === 'UNKNOWN') {
      console.warn('Warning: Some key invoice fields could not be extracted from the image');
    }

    return parsedInvoice;
  } catch (error) {
    console.error('Error parsing invoice image:', error);
    throw error;
  }
}

/**
 * Get the MIME type from file extension
 * @param filePath Path to the file
 * @returns MIME type string
 */
function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Parse and classify multiple document images
 * @param imagePaths List of paths to document images
 * @returns Array of document parsing results with classifications
 */
export async function parseDocuments(imagePaths: string[]): Promise<DocumentParsingResult[]> {
  // TODO: Implement document classification and parsing logic
  // This function should:
  // 1. Process each image file to determine its document type
  // 2. Extract relevant metadata for each document
  // 3. Optionally parse the full content for invoice-type documents
  // 4. Handle errors gracefully without failing the entire batch
  
  // Create OpenAI client
  const client = createOpenAIClient();
  
  // Set up for batch processing
  const results: DocumentParsingResult[] = [];

  return results;
}
