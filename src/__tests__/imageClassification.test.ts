import { parseDocuments, DocumentParsingResult } from '../imageParser';
import path from 'path';

describe('Image Document Classification', () => {
  const sampleBasePath = path.resolve(__dirname, '../../');
  const billOfLadingPath = path.join(sampleBasePath, 'Sample-BillOfLading-1.png');
  const deliveryReceiptPath = path.join(sampleBasePath, 'Sample-DeliveryReceipt-1.png');

  it('should classify a bill of lading document correctly', async () => {
    // Test with a single document
    const results = await parseDocuments([billOfLadingPath]);
    
    // Verify basic result structure
    expect(results).toHaveLength(1);
    expect(results[0].filePath).toBe(billOfLadingPath);
    expect(results[0].classification).toBeDefined();
    
    // Verify classification details
    const classification = results[0].classification;
    expect(classification.documentType).toBe('BILL_OF_LADING');
    expect(classification.confidence).toBeGreaterThan(0.7);
    
    // Verify metadata extraction
    expect(classification.metadata).toBeDefined();
    expect(classification.metadata?.documentId).toBeDefined();
    expect(classification.metadata?.dateIssued).toBeDefined();
  });

  it('should classify a delivery receipt document correctly', async () => {
    // Test with a single document
    const results = await parseDocuments([deliveryReceiptPath]);
    
    // Verify basic result structure
    expect(results).toHaveLength(1);
    expect(results[0].filePath).toBe(deliveryReceiptPath);
    expect(results[0].classification).toBeDefined();
    
    // Verify classification details
    const classification = results[0].classification;
    expect(classification.documentType).toBe('DELIVERY_RECEIPT');
    expect(classification.confidence).toBeGreaterThan(0.7);
    
    // Verify metadata extraction
    expect(classification.metadata).toBeDefined();
    expect(classification.metadata?.documentId).toBeDefined();
    expect(classification.metadata?.dateIssued).toBeDefined();
  });

  it('should process multiple documents in a batch', async () => {
    // Test with multiple documents
    const results = await parseDocuments([billOfLadingPath, deliveryReceiptPath]);
    
    // Verify all documents are processed
    expect(results).toHaveLength(2);
    
    // Verify document types are correctly identified
    const types = results.map(r => r.classification.documentType);
    expect(types).toContain('BILL_OF_LADING');
    expect(types).toContain('DELIVERY_RECEIPT');
    
    // Verify each result has the correct file path
    const billOfLadingResult = results.find(r => r.classification.documentType === 'BILL_OF_LADING');
    const deliveryReceiptResult = results.find(r => r.classification.documentType === 'DELIVERY_RECEIPT');
    
    expect(billOfLadingResult?.filePath).toBe(billOfLadingPath);
    expect(deliveryReceiptResult?.filePath).toBe(deliveryReceiptPath);
  });

  it('should handle non-existent or invalid files gracefully', async () => {
    const nonExistentPath = path.join(sampleBasePath, 'non-existent-file.png');
    
    // Test with one valid and one invalid file
    const results = await parseDocuments([billOfLadingPath, nonExistentPath]);
    
    // Verify the valid file is still processed
    const validResult = results.find(r => r.filePath === billOfLadingPath);
    expect(validResult).toBeDefined();
    expect(validResult?.classification.documentType).toBe('BILL_OF_LADING');
    
    // Verify the invalid file has an error but doesn't crash the process
    const invalidResult = results.find(r => r.filePath === nonExistentPath);
    expect(invalidResult?.error).toBeDefined();
  });

  // This test is for enhancement ideas the candidate could implement
  it.skip('should extract and interpret data from multiple document types', async () => {
    const results = await parseDocuments([billOfLadingPath, deliveryReceiptPath]);
    
    // Check that parsedData is populated for supported document types
    results.forEach(result => {
      if (['BILL_OF_LADING', 'DELIVERY_RECEIPT'].includes(result.classification.documentType as string)) {
        expect(result.parsedData).toBeDefined();
      }
    });
    
    // Check for specific fields expected in each document type
    const bolResult = results.find(r => r.classification.documentType === 'BILL_OF_LADING');
    if (bolResult?.parsedData) {
      expect(bolResult.parsedData.vendorName).toBeDefined();
      // Add more specific checks for bill of lading data
    }
  });
});
