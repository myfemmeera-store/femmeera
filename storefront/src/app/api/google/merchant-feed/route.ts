import { NextResponse } from 'next/server';
import { productService } from '@/services/productService';

export const revalidate = 3600; // Revalidate feed hourly

export async function GET() {
  try {
    const catalogRes = await productService.getProducts({ page: 1 });
    const products = catalogRes.data || [];

    const activeProducts = products.filter((p) => p.status !== 'INACTIVE' && p.status !== 'ARCHIVED');

    const xmlItems = activeProducts.map((p) => {
      const mainImage = p.images?.[0]?.image_url || 'https://femmeera.com/logo.png';
      const additionalImages = (p.images || [])
        .slice(1, 10)
        .map((img) => `<g:additional_image_link>${escapeXml(img.image_url)}</g:additional_image_link>`)
        .join('');

      const rawPrice = Number(p.price || p.variants?.[0]?.price || 1499);
      const priceFormatted = `${rawPrice.toFixed(2)} INR`;

      const variants = p.variants || [];
      const hasStock = variants.length > 0
        ? variants.some((v) => (v.stock ?? 1) > 0)
        : p.status === 'ACTIVE';

      const availability = hasStock ? 'in_stock' : 'out_of_stock';
      const colors = Array.from(new Set(variants.map((v) => v.color?.trim()).filter(Boolean)));
      const sizes = Array.from(new Set(variants.map((v) => v.size?.trim()).filter(Boolean)));

      const rawDesc = p.description || p.short_description || `Buy ${p.name} online at Femmeera. High quality women's traditional & contemporary fashion.`;
      const cleanDesc = escapeXml(rawDesc.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 5000));

      const categoryName = p.category?.name || "Women's Clothing";

      return `
    <item>
      <g:id>${escapeXml(p.sku || `FEM-${p.id}`)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${cleanDesc}</g:description>
      <g:link>https://femmeera.com/product/${escapeXml(p.slug)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
      ${additionalImages}
      <g:price>${priceFormatted}</g:price>
      <g:availability>${availability}</g:availability>
      <g:brand>${escapeXml(p.brand || 'Femmeera')}</g:brand>
      <g:condition>new</g:condition>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      <g:product_type>${escapeXml(categoryName)}</g:product_type>
      ${colors.length > 0 ? `<g:color>${escapeXml(colors.join('/'))}</g:color>` : ''}
      ${sizes.length > 0 ? `<g:size>${escapeXml(sizes.join('/'))}</g:size>` : ''}
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Femmeera Google Merchant Center Product Feed</title>
    <link>https://femmeera.com</link>
    <description>Official dynamic RSS 2.0 product catalog feed for Femmeera Women's Apparel.</description>
    ${xmlItems}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    return new NextResponse('Error generating Google Merchant feed', { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
