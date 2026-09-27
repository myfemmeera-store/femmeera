import { GET as getMerchantFeed } from '@/app/api/google/merchant-feed/route';

export const revalidate = 3600;

export async function GET() {
  return getMerchantFeed();
}
