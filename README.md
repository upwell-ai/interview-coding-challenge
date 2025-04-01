# Invoice Parser - Coding Challenge

## Challenge Overview

This coding challenge asks you to build an intelligent invoice parser using the OpenAI API. Your task is to develop a TypeScript application that can extract structured data from raw invoice text using OpenAI's language models.

## Requirements

### Functional Requirements

1. Create a TypeScript application that parses invoice text using OpenAI.
2. Implement a solution that extracts structured data including:
   - Invoice number
   - Invoice date
   - Due date
   - Vendor information
   - Customer information
   - Line items (description, quantity, unit price, amount)
   - Invoice totals (subtotal, tax, total amount)
   - Currency
   - Payment terms
3. Handle various invoice formats gracefully.
4. Include proper error handling and validation.

### Technical Requirements

1. **Must use TypeScript** with proper typing.
2. **Must use OpenAI's API** with structured outputs (JSON response format).
3. Write clean, maintainable code with appropriate documentation.
4. Include comprehensive unit tests using Jest.
5. Provide clear instructions for running your application.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd invoice-parser-challenge

# Install dependencies
npm install

# Set up your OpenAI API key
export OPENAI_API_KEY=your_api_key_here
```

### Running the Application

```bash
# Build the TypeScript code
npm run build

# Run the application
npm start

# Run in development mode (with ts-node)
npm run dev
```

### Running Tests

```bash
npm test
```

## Example Code

An example implementation is provided in the `src` directory with a basic invoice parser class and corresponding unit tests. This is intended to give you a starting point, but you should extend and improve upon it to create a robust solution.

## Evaluation Criteria

Your submission will be evaluated based on:

1. **Correctness**: Does the parser accurately extract invoice data?
2. **Code Quality**: Is the code well-structured, cleanly written, and properly documented?
3. **TypeScript Usage**: Is TypeScript properly utilized with appropriate typing?
4. **Error Handling**: How well does the application handle edge cases and errors?
5. **Testing**: Are there comprehensive tests that cover the functionality?
6. **API Usage**: Is the OpenAI API used efficiently and effectively?

## Submission Guidelines

1. Create a private GitHub repository with your implementation.
2. Include a README with instructions for running your code and any additional notes.
3. Share access with [reviewer's GitHub username].

## Time Expectation

This challenge is designed to take 2-4 hours. Focus on creating a working solution rather than perfection in all areas.