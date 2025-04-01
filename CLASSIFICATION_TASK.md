# AI-Based Invoice Classification Challenge

## Task Description

In this challenge, you'll implement an AI-based document classification system to identify different types of financial documents before parsing. You'll create a robust classification system that can accurately categorize documents into the predefined types in our `InvoiceType` enum.

## Background

Our invoice parser currently treats all financial documents the same way, but in reality, there are many different types (invoices, purchase orders, receipts, etc.) each with their own unique structure and fields. By first classifying the document type, we can:

- Apply specialized parsing strategies tailored to each document type
- Extract type-specific fields that might otherwise be missed
- Improve parsing accuracy by providing context to the AI parser
- Provide richer metadata about the document for downstream systems

## Your Task (45 minutes)

Implement an AI-based document classification system for the financial document parser:

1. Implement the `classifyInvoice()` function in `src/invoiceParser.ts`

   - Study the sample documents provided in the tests to understand the characteristics of each document type
   - Create an AI-based classification system that can accurately categorize documents into the appropriate `InvoiceType`
   - Return the document type as an `InvoiceType` enum value along with a confidence score
   - Provide possible alternative types when confidence is low
   - Add useful metadata about the classification when relevant

2. Make all tests in `src/__tests__/invoiceClassification.test.ts` pass

   - The tests expect specific document types to be identified
   - The classification should have high confidence scores for clear examples
   - Classification data should be properly included in the parsed invoice result

3. Extend the parser to use classification data
   - Modify the system prompt based on the identified document type
   - Consider implementing specialized parsing logic for different document types

## Requirements

- Use types instead of interfaces throughout your implementation
- Use enums where possible, as we've done with `InvoiceType`
- Use OpenAI's API to help with document classification
- Never use `any` types in your TypeScript code
- Include appropriate error handling
- Write clear comments explaining your approach and decision-making process

## Tips

- Examine the test examples carefully to understand the characteristics of each document type in the `InvoiceType` enum
- Consider both the structure and language used in each document type
- Use the classification confidence score to determine when to apply specialized handling
- Think about how to make your solution robust against poor quality inputs
- Balance the use of AI with performance considerations

## Evaluation Criteria

- Accuracy: How well does your system identify the different document types?
- Code Quality: Is your solution well-structured, maintainable, and following best practices?
- AI Integration: How effectively do you leverage AI capabilities for classification?
- Testing: Do all tests pass and cover important edge cases?
- Documentation: Is your code well-commented and approach clearly explained?

## Getting Started

1. Review the existing code structure in `src/invoiceParser.ts`, including the `InvoiceType` enum
2. Study the sample documents in `src/__tests__/invoiceClassification.test.ts`
3. Understand the characteristics of each document type defined in the `InvoiceType` enum
4. Implement your AI-based classification solution
5. Make sure all tests pass

Good luck!
