import OpenAI from 'openai';

// Define the structure for parsed invoice data
export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  vendorName: string;
  vendorAddress?: string;
  customerName?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  currency: string;
  paymentTerms?: string;
};

// Define the structure for individual line items
export type InvoiceItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

/**
 * Create an OpenAI client instance using the API key from environment variables
 * If no API key is provided as a parameter, it will use OPENAI_API_KEY from .env
 * @param apiKey Optional: Your OpenAI API key (defaults to environment variable)
 * @returns OpenAI client instance
 */
export function createOpenAIClient(apiKey?: string): OpenAI {
  // Use the provided API key or fall back to environment variable
  const key = apiKey || process.env.OPENAI_API_KEY;
  
  if (!key) {
    throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or provide the key as a parameter.');
  }
  
  return new OpenAI({
    apiKey: key,
  });
}

/**
 * Parse an invoice from its text content using OpenAI
 * @param client The OpenAI client instance
 * @param invoiceText The text content of the invoice to parse
 * @returns Structured invoice data
 */
export async function parseInvoice(client: OpenAI, invoiceText: string): Promise<InvoiceData> {
  try {
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert invoice parser. Extract structured data from the provided invoice text."
        },
        {
          role: "user",
          content: invoiceText
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
    
    // Validate the parsed data (minimal validation for example)
    if (!parsedInvoice.invoiceNumber || !parsedInvoice.vendorName || !parsedInvoice.totalAmount) {
      throw new Error("Invoice parsing failed: Missing required fields");
    }

    return parsedInvoice;
  } catch (error) {
    // We're not logging errors here so tests remain clean
    // In a real implementation, you might want to log errors or handle them differently
    throw error;
  }
};

/**
 * Validate the parsed invoice data
 * @param invoice The invoice data to validate
 * @returns Validated invoice data
 */
const validateInvoice = (invoice: InvoiceData): InvoiceData => {
  if (!invoice.invoiceNumber || !invoice.vendorName || !invoice.totalAmount) {
    throw new Error("Invoice parsing failed: Missing required fields");
  }
  return invoice;
};
