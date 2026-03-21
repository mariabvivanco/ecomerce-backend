import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) })

const categories = [
  { id: '00000000-0000-4000-a000-000000000001', name: 'Medicamentos', slug: 'medicamentos' },
  { id: '00000000-0000-4000-a000-000000000002', name: 'Vitaminas y Suplementos', slug: 'vitaminas-suplementos' },
  { id: '00000000-0000-4000-a000-000000000003', name: 'Cuidado Personal', slug: 'cuidado-personal' },
  { id: '00000000-0000-4000-a000-000000000004', name: 'Bebé y Mamá', slug: 'bebe-mama' },
  { id: '00000000-0000-4000-a000-000000000005', name: 'Dermocosmética', slug: 'dermocosmetica' },
]

const products = [
  { id: '00000000-0000-4000-b000-000000000001', name: 'Paracetamol 500mg 20 comprimidos', slug: 'paracetamol-500mg-20', description: 'Analgésico y antipirético de uso común.', price: 2.5, stock: 200, featured: true, imageUrl: '/images/tylenol.webp', categorySlug: 'medicamentos' },
  { id: '00000000-0000-4000-b000-000000000002', name: 'Ibuprofeno 400mg 20 comprimidos', slug: 'ibuprofeno-400mg-20', description: 'Antiinflamatorio, analgésico y antipirético.', price: 3.8, stock: 150, featured: true, imageUrl: '/images/ibuprofeno.jpg', categorySlug: 'medicamentos' },
  { id: '00000000-0000-4000-b000-000000000003', name: 'Amoxicilina 500mg 24 cápsulas', slug: 'amoxicilina-500mg-24', description: 'Antibiótico de amplio espectro.', price: 6.5, stock: 80, requiresPrescription: true, imageUrl: '/images/paracetamol.jpg', categorySlug: 'medicamentos' },
  { id: '00000000-0000-4000-b000-000000000004', name: 'Omeprazol 20mg 28 cápsulas', slug: 'omeprazol-20mg-28', description: 'Inhibidor de la bomba de protones para acidez y úlceras.', price: 4.2, stock: 120, imageUrl: '/images/tylenol.webp', categorySlug: 'medicamentos' },
  { id: '00000000-0000-4000-b000-000000000005', name: 'Vitamina C 1000mg 30 comprimidos', slug: 'vitamina-c-1000mg-30', description: 'Suplemento de vitamina C de alta concentración.', price: 8.9, stock: 180, featured: true, imageUrl: '/images/paracetamol.jpg', categorySlug: 'vitaminas-suplementos' },
  { id: '00000000-0000-4000-b000-000000000006', name: 'Vitamina D3 2000UI 90 cápsulas', slug: 'vitamina-d3-2000ui-90', description: 'Suplemento de vitamina D para huesos y sistema inmune.', price: 12.5, stock: 100, imageUrl: '/images/ibuprofeno.jpg', categorySlug: 'vitaminas-suplementos' },
  { id: '00000000-0000-4000-b000-000000000007', name: 'Magnesio + B6 60 comprimidos', slug: 'magnesio-b6-60', description: 'Contribuye al funcionamiento normal del sistema nervioso.', price: 9.95, stock: 90, imageUrl: '/images/tylenol.webp', categorySlug: 'vitaminas-suplementos' },
  { id: '00000000-0000-4000-b000-000000000008', name: 'Omega-3 1000mg 60 cápsulas', slug: 'omega-3-1000mg-60', description: 'Ácidos grasos esenciales para la salud cardiovascular.', price: 14.5, stock: 70, featured: true, imageUrl: '/images/paracetamol.jpg', categorySlug: 'vitaminas-suplementos' },
  { id: '00000000-0000-4000-b000-000000000009', name: 'Crema hidratante facial SPF30 50ml', slug: 'crema-hidratante-spf30-50ml', description: 'Hidratación diaria con protección solar.', price: 18.9, stock: 60, imageUrl: '/images/ibuprofeno.jpg', categorySlug: 'dermocosmetica' },
  { id: '00000000-0000-4000-b000-000000000010', name: 'Sérum vitamina C antiedad 30ml', slug: 'serum-vitamina-c-30ml', description: 'Serum iluminador con vitamina C pura al 15%.', price: 24.5, stock: 45, featured: true, imageUrl: '/images/tylenol.webp', categorySlug: 'dermocosmetica' },
  { id: '00000000-0000-4000-b000-000000000011', name: 'Gel de baño piel sensible 500ml', slug: 'gel-bano-piel-sensible-500ml', description: 'Fórmula suave sin jabón, sin perfume.', price: 6.8, stock: 110, imageUrl: '/images/paracetamol.jpg', categorySlug: 'cuidado-personal' },
  { id: '00000000-0000-4000-b000-000000000012', name: 'Champú anticaída 400ml', slug: 'champu-anticaida-400ml', description: 'Fortalece el cabello y reduce la caída.', price: 11.2, stock: 85, imageUrl: '/images/ibuprofeno.jpg', categorySlug: 'cuidado-personal' },
  { id: '00000000-0000-4000-b000-000000000013', name: 'Leche corporal nutritiva 400ml', slug: 'leche-corporal-nutritiva-400ml', description: 'Hidratación intensa para pieles secas.', price: 8.5, stock: 95, imageUrl: '/images/tylenol.webp', categorySlug: 'cuidado-personal' },
  { id: '00000000-0000-4000-b000-000000000014', name: 'Pañales talla 3 (6-10kg) 52 uds', slug: 'panales-talla-3-52uds', description: 'Pañales ultrabsorbentes con indicador de humedad.', price: 15.9, stock: 130, imageUrl: '/images/paracetamol.jpg', categorySlug: 'bebe-mama' },
  { id: '00000000-0000-4000-b000-000000000015', name: 'Leche de continuación tipo 2 800g', slug: 'leche-continuacion-tipo2-800g', description: 'Leche de fórmula para bebés de 6 a 12 meses.', price: 22.5, stock: 55, imageUrl: '/images/ibuprofeno.jpg', categorySlug: 'bebe-mama' },
]

async function main() {
  console.log('Seeding database...')

  await prisma.orderItem.deleteMany()
  await prisma.shippingAddress.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat })
    categoryMap[cat.slug] = created.id
  }

  for (const { categorySlug, ...productData } of products) {
    await prisma.product.create({
      data: { ...productData, categoryId: categoryMap[categorySlug] },
    })
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
