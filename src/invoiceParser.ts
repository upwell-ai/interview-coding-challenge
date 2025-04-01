import OpenAI from 'openai';

// Define enum for invoice types
export enum InvoiceType {
  STANDARD = 'standard',
  PURCHASE_ORDER = 'purchase_order',
  RECEIPT = 'receipt',
  PROFORMA = 'proforma',
  CREDIT_NOTE = 'credit_note',
  UNKNOWN = 'unknown'
}

// Define the structure for invoice classification result
export type InvoiceClassification = {
  type: InvoiceType; // The document type identified by the classifier
  confidence: number; // 0-1 confidence score
  possibleTypes?: InvoiceType[]; // Other possible types with lower confidence
  metadata?: Record<string, any>; // Additional classification metadata
};

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
  classification?: InvoiceClassification; // Classification information
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
 * Classify an invoice document to determine its type before parsing
 * @param client The OpenAI client instance
 * @param invoiceText The text content of the invoice to classify
 * @returns Classification result with invoice type and confidence score
 */
export async function classifyInvoice(client: OpenAI, invoiceText: string): Promise<InvoiceClassification> {
  try {
    // TODO: Implement the actual classification logic using AI
    // This is a placeholder implementation that should be replaced
    
    // For now, just return unknown type with zero confidence
    return {
      type: InvoiceType.UNKNOWN,
      confidence: 0
    };
  } catch (error) {
    console.error('Error classifying invoice:', error);
    // Default to unknown classification in case of error
    return {
      type: InvoiceType.UNKNOWN,
      confidence: 0
    };
  }
}

/**
 * Parse an invoice from its text content using OpenAI
 * @param client The OpenAI client instance
 * @param invoiceText The text content of the invoice to parse
 * @param skipClassification Optional flag to skip classification step
 * @returns Structured invoice data
 */
export async function parseInvoice(client: OpenAI, invoiceText: string, skipClassification = false): Promise<InvoiceData> {
  try {
    // First, classify the invoice to determine its type (unless explicitly skipped)
    let classification: InvoiceClassification | undefined;
    
    if (!skipClassification) {
      classification = await classifyInvoice(client, invoiceText);
      
      // Use type-specific parsing strategies based on classification
      // TODO: Implement different parsing strategies for different invoice types
    }

    // Adapt system prompt based on classification
    let systemPrompt = "You are an expert invoice parser. Extract structured data from the provided invoice text.";
    
    if (classification && classification.type !== InvoiceType.UNKNOWN) {
      systemPrompt += ` This is a ${classification.type.toUpperCase()} type invoice.`;
    }

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
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
    
    // Add classification information to the parsed invoice
    if (classification) {
      parsedInvoice.classification = classification;
    }
    
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
