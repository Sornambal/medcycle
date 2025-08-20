# Google Pay Integration Guide - Zero Cost Testing

## Overview
This guide explains how to integrate Google Pay into the MedCycleAI platform for testing purposes with zero real charges.

## Features Added
- ✅ Google Pay button in checkout
- ✅ Test environment configuration
- ✅ Zero-cost testing with Google's test cards
- ✅ Backend payment processing
- ✅ Frontend Google Pay integration

## How to Use Google Pay with Zero Cost

### 1. Test Environment Setup
The system is configured to use Google Pay's TEST environment, which means:
- No real money is charged
- Uses Google's provided test cards
- Perfect for development and testing

### 2. Test Card Numbers (No Real Charges)
Use these test card numbers provided by Google:

| Card Type | Test Number | Description |
|-----------|-------------|-------------|
| Visa | `4111111111111111` | Always succeeds |
| Mastercard | `5555555555554444` | Always succeeds |
| American Express | `378282246310005` | Always succeeds |
| Discover | `6011111111111117` | Always succeeds |

### 3. How to Test Google Pay

#### Frontend Testing
1. Go to the checkout page
2. Click "Pay with Google Pay" button
3. Use any of the test card numbers above
4. Payment will succeed without real charges

#### Backend Testing
The backend is configured to accept Google Pay tokens in test mode:
- Endpoint: `POST /api/orders/:id/payment`
- Accepts Google Pay tokens
- Always returns success in test mode

### 4. Configuration Files

#### Google Pay Configuration
```typescript
// server/services/paymentService.ts
export const GOOGLE_PAY_CONFIG = {
  environment: 'TEST', // This ensures zero cost
  merchantId: '12345678901234567890', // Test merchant ID
  merchantName: 'MedCycle Test Store',
  gateway: 'example',
  gatewayMerchantId: 'exampleGatewayMerchantId',
};
```

#### Frontend Google Pay Button
```typescript
// client/src/components/GooglePayButton.tsx
const googlePayConfig = {
  environment: 'TEST', // Critical for zero cost
  merchantInfo: {
    merchantId: '12345678901234567890',
    merchantName: 'MedCycle Test Store',
  },
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    totalPrice: amount.toString(),
    currencyCode: 'INR',
    countryCode: 'IN',
  },
};
```

### 5. Testing Steps

1. **Start the application**
   ```bash
   cd MedCycleAI
   npm run dev
   ```

2. **Add items to cart**
   - Login as a receiver
   - Add medicines to cart
   - Go to checkout

3. **Use Google Pay**
   - Click "Pay with Google Pay"
   - Use test card: `4111111111111111`
   - Payment succeeds with zero cost

### 6. Important Notes

- **Never use real cards** - The system is in TEST mode
- **All payments are simulated** - No real money is transferred
- **Perfect for development** - Use this for testing all payment flows
- **Production ready** - To go live, change `environment: 'TEST'` to `environment: 'PRODUCTION'`

### 7. Troubleshooting

**Google Pay button not showing?**
- Ensure you're using a supported browser (Chrome, Safari, Firefox)
- Check that JavaScript is enabled
- Clear browser cache and reload

**Payment failing?**
- Ensure you're using test card numbers
- Check browser console for errors
- Verify the Google Pay API is loaded

**Want to test real payments?**
- Change `environment: 'TEST'` to `environment: 'PRODUCTION'`
- Use real Google Pay merchant credentials
- Ensure SSL certificate is installed

## Files Modified
- `server/services/paymentService.ts` - Google Pay configuration
- `client/src/components/GooglePayButton.tsx` - Google Pay button
- `client/src/pages/Checkout.tsx` - Updated checkout with Google Pay
- `server/routes.ts` - Payment endpoint with Google Pay support

## Next Steps for Production
1. Get Google Pay merchant ID from Google
2. Change environment from 'TEST' to 'PRODUCTION'
3. Update merchant credentials
4. Ensure SSL certificate is active
5. Test with real Google Pay accounts
