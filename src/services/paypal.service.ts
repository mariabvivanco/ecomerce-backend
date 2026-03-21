import {
  Client,
  Environment,
  OrdersController,
  CheckoutPaymentIntent,
} from '@paypal/paypal-server-sdk'

function buildClient(): Client {
  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID as string,
      oAuthClientSecret: process.env.PAYPAL_SECRET as string,
    },
    environment:
      process.env.NODE_ENV === 'production'
        ? Environment.Production
        : Environment.Sandbox,
  })
}

const isTestMode = process.env.PAYPAL_CLIENT_ID === 'test_paypal_client_id'

export async function createPayPalOrder(amountEur: number): Promise<string> {
  if (isTestMode) return `MOCK_PAYPAL_${Date.now()}`
  const controller = new OrdersController(buildClient())
  const { result } = await controller.createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: 'EUR',
            value: amountEur.toFixed(2),
          },
        },
      ],
    },
  })
  if (!result.id) throw new Error('PAYPAL_ORDER_FAILED')
  return result.id
}

export async function capturePayPalOrder(paypalOrderId: string): Promise<string> {
  if (isTestMode) return `MOCK_CAPTURE_${Date.now()}`
  const controller = new OrdersController(buildClient())
  const { result } = await controller.captureOrder({
    id: paypalOrderId,
    body: {},
  })
  const captureId =
    result.purchaseUnits?.[0]?.payments?.captures?.[0]?.id
  if (!captureId) throw new Error('PAYPAL_CAPTURE_FAILED')
  return captureId
}
