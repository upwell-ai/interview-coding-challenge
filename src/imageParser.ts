import { createOpenAIClient, InvoiceData } from './invoiceParser';
import { readFileSync } from 'fs';
import OpenAI from 'openai';
import path from 'path';

/**
 * Parse an invoice from an image file using OpenAI's vision capabilities
 * @param imagePath Path to the invoice image file
 * @returns Structured invoice data
 */
export async function parseInvoiceImage(imagePath: string): Promise<InvoiceData> {
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
    // Read the image file and encode as base64
    const imageBuffer = readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

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
                url: `data:${mimeType};base64,${base64Image}`
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
