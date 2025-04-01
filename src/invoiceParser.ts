import OpenAI from 'openai';

// Define the structure for parsed invoice data
export interface InvoiceData {
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
}

// Define the structure for individual line items
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export class InvoiceParser {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Parse an invoice from its text content using OpenAI
   * @param invoiceText The text content of the invoice to parse
   * @returns Structured invoice data
   */
  async parseInvoice(invoiceText: string): Promise<InvoiceData> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o",
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
  }
}
