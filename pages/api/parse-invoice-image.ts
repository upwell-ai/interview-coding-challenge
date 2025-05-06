import type { NextApiRequest, NextApiResponse } from 'next';
import { parseInvoiceImageBase64 } from '../../src/imageParser';
import { InvoiceData } from '../../src/invoiceParser';
import OpenAI from 'openai';

// Define response types
type SuccessResponse = {
  success: true;
  data: InvoiceData;
};

type ErrorResponse = {
  success: false;
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST instead.' 
    });
  }

  try {
    // Extract base64 image data from request body
    const { base64Image, mimeType } = req.body;

    // Validate required fields
    if (!base64Image || typeof base64Image !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Base64 image data is required and must be a string' 
      });
    }

    // Validate mime type if provided
    if (mimeType && typeof mimeType !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'If provided, mimeType must be a string'
      });
    }

    // Parse the invoice from the base64 image
    const parsedInvoice = await parseInvoiceImageBase64(
      base64Image,
      undefined,
      mimeType
    );

    // Return the parsed invoice data
    return res.status(200).json({
      success: true,
      data: parsedInvoice
    });
  } catch (error) {
    console.error('Error parsing invoice image:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
}

// Configure Next.js API route to handle larger payloads for image data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase the body size limit for image uploads
    },
  },
};
