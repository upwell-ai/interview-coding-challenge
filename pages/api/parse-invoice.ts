import type { NextApiRequest, NextApiResponse } from 'next';
import { createOpenAIClient, parseInvoice, InvoiceData } from '../../src/invoiceParser';
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
    // Extract invoice text from request body
    const { invoiceText, skipClassification } = req.body;

    // Validate required fields
    if (!invoiceText || typeof invoiceText !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invoice text is required and must be a string' 
      });
    }

    // Create OpenAI client
    let client: OpenAI;
    try {
      client = createOpenAIClient();
    } catch (error) {
      console.error('Error creating OpenAI client:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to initialize OpenAI client. Check if OPENAI_API_KEY is set.' 
      });
    }

    // Parse the invoice
    const parsedInvoice = await parseInvoice(
      client, 
      invoiceText, 
      skipClassification === true
    );

    // Return the parsed invoice data
    return res.status(200).json({
      success: true,
      data: parsedInvoice
    });
  } catch (error) {
    console.error('Error parsing invoice:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
}
