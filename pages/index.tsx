import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Stack,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import { CloudUpload, ReceiptLong } from '@mui/icons-material';

// Define the invoice parser interface
interface InvoiceFormInput {
  invoiceText: string;
  skipClassification?: boolean;
}

// Define the invoice image parser interface
interface InvoiceImageFormInput {
  base64Image: string;
  mimeType: string;
}

// Define the invoice data interface
interface InvoiceData {
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
  classification?: InvoiceClassification;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceClassification {
  type: string;
  confidence: number;
}

export default function Home() {
  // Invoice parser form state
  const { control: invoiceControl, handleSubmit: handleInvoiceSubmit, formState: { errors: invoiceErrors } } = useForm<InvoiceFormInput>();
  const [invoiceResult, setInvoiceResult] = useState<InvoiceData | null>(null);
  const [isParsingInvoice, setIsParsingInvoice] = useState<boolean>(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [invoiceImage, setInvoiceImage] = useState<string | null>(null);
  const [invoiceImageType, setInvoiceImageType] = useState<string>('');
  const [isParsingImage, setIsParsingImage] = useState<boolean>(false);

  // Handle invoice parsing submission
  const onInvoiceSubmit = async (data: InvoiceFormInput) => {
    setIsParsingInvoice(true);
    setParsingError(null);
    setInvoiceResult(null);
    
    try {
      const response = await axios.post('/api/parse-invoice', data);
      if (response.data.success) {
        setInvoiceResult(response.data.data);
      } else {
        setParsingError(response.data.error || 'Failed to parse invoice');
      }
    } catch (error) {
      console.error('Error parsing invoice:', error);
      setParsingError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsParsingInvoice(false);
    }
  };
  
  // Handle invoice image processing
  const processInvoiceImage = async () => {
    if (!invoiceImage) {
      setParsingError('No image selected');
      return;
    }
    
    setIsParsingImage(true);
    setParsingError(null);
    setInvoiceResult(null);
    
    try {
      const response = await axios.post('/api/parse-invoice-image', {
        base64Image: invoiceImage,
        mimeType: invoiceImageType
      });
      
      if (response.data.success) {
        setInvoiceResult(response.data.data);
      } else {
        setParsingError(response.data.error || 'Failed to parse invoice image');
      }
    } catch (error) {
      console.error('Error parsing invoice image:', error);
      setParsingError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsParsingImage(false);
    }
  };
  
  // Handle image file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset previous results
    setInvoiceResult(null);
    setParsingError(null);
    
    // Get file type
    const fileType = file.type;
    setInvoiceImageType(fileType);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract the base64 data part (remove data:image/jpeg;base64, prefix)
      const base64Data = result.split(',')[1];
      setInvoiceImage(base64Data);
    };
    reader.readAsDataURL(file);
  };
  


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Invoice Parser
        </Typography>
        
        <Box 
          component="form" 
          noValidate
        >
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Upload Invoice Image
            </Typography>
            
            <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, p: 3 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="invoice-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="invoice-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<CloudUpload />}
                >
                  Select Invoice Image
                </Button>
              </label>
              
              {invoiceImage && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Image selected
                  </Typography>
                  <img 
                    src={`data:${invoiceImageType};base64,${invoiceImage}`} 
                    alt="Selected invoice" 
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                  />
                </Box>
              )}
            </Box>
            
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth
              size="large"
              disabled={!invoiceImage || isParsingImage}
              onClick={processInvoiceImage}
              startIcon={isParsingImage ? <CircularProgress size={24} color="inherit" /> : <ReceiptLong />}
            >
              {isParsingImage ? 'Parsing Image...' : 'Parse Invoice Image'}
            </Button>
          </Stack>
        </Box>
      </Paper>
      
      {/* Invoice Parser Results */}
      {(parsingError || invoiceResult) && (
        <>
          {parsingError && (
            <Alert severity="error" sx={{ mt: 4 }}>
              <AlertTitle>Error</AlertTitle>
              {parsingError}
            </Alert>
          )}
          
          {invoiceResult && (
            <Card sx={{ mt: 4 }}>
              <CardHeader title="Parsed Invoice Data" />
              <Divider />
              <CardContent>
                <Box 
                  component="pre"
                  sx={{
                    backgroundColor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875rem'
                  }}
                >
                  {JSON.stringify(invoiceResult, null, 2)}
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )
      }
    </Container>
  );
}
