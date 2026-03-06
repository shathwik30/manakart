import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { randomUUID } from "crypto";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

function createId() {
  return randomUUID();
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Relevant Image URLs ───

const SUBCATEGORY_IMAGES: Record<string, string[]> = {
  // Electronics
  "Mobiles": [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592899677112-901b3e5b5111?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&h=800&fit=crop&q=80",
  ],
  "Laptops": [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop&q=80",
  ],
  "Audio": [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&h=800&fit=crop&q=80",
  ],
  "Cameras": [
    "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1605464315542-bda44204b12c?w=800&h=800&fit=crop&q=80",
  ],
  // Fashion
  "Men": [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523381294911-8d3cead13b95?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=800&fit=crop&q=80",
  ],
  "Women": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop&q=80",
  ],
  "Kids": [
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&h=800&fit=crop&q=80",
  ],
  "Footwear": [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&h=800&fit=crop&q=80",
  ],
  // Home & Kitchen
  "Furniture": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop&q=80",
  ],
  "Appliances": [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585442041999-d4be0e60e3a1?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1592590846965-2700c6953bb3?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&h=800&fit=crop&q=80",
  ],
  "Decor": [
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&q=80",
  ],
  "Storage": [
    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527515637462-cee1653e91e9?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=800&fit=crop&q=80",
  ],
  // Beauty & Personal Care
  "Skincare": [
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=800&fit=crop&q=80",
  ],
  "Haircare": [
    "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=800&h=800&fit=crop&q=80",
  ],
  "Makeup": [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop&q=80",
  ],
  "Fragrances": [
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=800&fit=crop&q=80",
  ],
  // Sports & Fitness
  "Gym Equipment": [
    "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517130038641-a774d04afb3c?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&q=80",
  ],
  "Sportswear": [
    "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop&q=80",
  ],
  "Outdoor": [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=800&fit=crop&q=80",
  ],
  "Yoga": [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad33?w=800&h=800&fit=crop&q=80",
  ],
  // Books & Stationery
  "Fiction": [
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&h=800&fit=crop&q=80",
  ],
  "Non-Fiction": [
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&h=800&fit=crop&q=80",
  ],
  "Office Supplies": [
    "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&h=800&fit=crop&q=80",
  ],
  "Art Supplies": [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1596207891316-23f17feab1b8?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&h=800&fit=crop&q=80",
  ],
  // Toys & Games
  "Board Games": [
    "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590615370581-265ae32e8f40?w=800&h=800&fit=crop&q=80",
  ],
  "Action Figures": [
    "https://images.unsplash.com/photo-1608278047522-58806a6ac85b?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=800&h=800&fit=crop&q=80",
  ],
  "Educational": [
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=800&h=800&fit=crop&q=80",
  ],
  "Outdoor Play": [
    "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&h=800&fit=crop&q=80",
  ],
  // Grocery & Essentials
  "Snacks": [
    "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599490659213-e2c4c600653c?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop&q=80",
  ],
  "Beverages": [
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1597318181409-cf64d0b5d14e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563639234920-3c4c55aafc73?w=800&h=800&fit=crop&q=80",
  ],
  "Cleaning": [
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?w=800&h=800&fit=crop&q=80",
  ],
  "Personal Hygiene": [
    "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556228841-a3c527ebefe5?w=800&h=800&fit=crop&q=80",
  ],
};

const PARENT_CATEGORY_IMAGES: Record<string, string> = {
  "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&q=80",
  "Fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&q=80",
  "Home & Kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&q=80",
  "Beauty & Personal Care": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80",
  "Sports & Fitness": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&q=80",
  "Books & Stationery": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&q=80",
  "Toys & Games": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop&q=80",
  "Grocery & Essentials": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop&q=80",
};

const BRAND_LOGO_MAP: Record<string, string> = {
  "Samsung": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop&q=80",
  "Nike": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&q=80",
  "boAt": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&q=80",
  "Prestige": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&q=80",
  "Lakme": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop&q=80",
  "Puma": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop&q=80",
  "Classmate": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop&q=80",
  "Funskool": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&h=200&fit=crop&q=80",
  "Tata": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop&q=80",
  "HP": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop&q=80",
};

const categoryImageCounters: Record<string, number> = {};

function getProductImages(category: string): string[] {
  const pool = SUBCATEGORY_IMAGES[category];
  if (!pool || pool.length === 0) {
    return [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop&q=80",
    ];
  }
  const counter = categoryImageCounters[category] || 0;
  categoryImageCounters[category] = counter + 3;
  return [
    pool[counter % pool.length],
    pool[(counter + 1) % pool.length],
    pool[(counter + 2) % pool.length],
  ];
}

function getSubcategoryImage(name: string): string {
  const pool = SUBCATEGORY_IMAGES[name];
  if (pool && pool.length > 0) return pool[0].replace("w=800&h=800", "w=400&h=400");
  return PARENT_CATEGORY_IMAGES["Electronics"];
}

// ─── Data Definitions ───

const PARENT_CATEGORIES = [
  { name: "Electronics", icon: "Smartphone", position: 1, children: ["Mobiles", "Laptops", "Audio", "Cameras"] },
  { name: "Fashion", icon: "Shirt", position: 2, children: ["Men", "Women", "Kids", "Footwear"] },
  { name: "Home & Kitchen", icon: "Home", position: 3, children: ["Furniture", "Appliances", "Decor", "Storage"] },
  { name: "Beauty & Personal Care", icon: "Sparkles", position: 4, children: ["Skincare", "Haircare", "Makeup", "Fragrances"] },
  { name: "Sports & Fitness", icon: "Dumbbell", position: 5, children: ["Gym Equipment", "Sportswear", "Outdoor", "Yoga"] },
  { name: "Books & Stationery", icon: "BookOpen", position: 6, children: ["Fiction", "Non-Fiction", "Office Supplies", "Art Supplies"] },
  { name: "Toys & Games", icon: "Gamepad2", position: 7, children: ["Board Games", "Action Figures", "Educational", "Outdoor Play"] },
  { name: "Grocery & Essentials", icon: "ShoppingBasket", position: 8, children: ["Snacks", "Beverages", "Cleaning", "Personal Hygiene"] },
];

const BRAND_NAMES = ["Samsung", "Nike", "boAt", "Prestige", "Lakme", "Puma", "Classmate", "Funskool", "Tata", "HP"];

interface ProductDef {
  title: string;
  category: string; // subcategory name
  brand: string;
  basePrice: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  isFeatured: boolean;
  description: string;
}

const PRODUCTS: ProductDef[] = [
  // Electronics — Mobiles
  { title: "Samsung Galaxy M34 5G (6GB/128GB)", category: "Mobiles", brand: "Samsung", basePrice: 1499900, comparePrice: 1999900, stock: 50, sku: "EL-MOB-001", isFeatured: true, description: "Powerful 5G smartphone with 6000mAh battery, 50MP triple camera, and Super AMOLED display. Perfect for all-day usage." },
  { title: "Samsung Galaxy A15 4G (4GB/64GB)", category: "Mobiles", brand: "Samsung", basePrice: 1099900, comparePrice: 1299900, stock: 80, sku: "EL-MOB-002", isFeatured: false, description: "Budget-friendly Samsung phone with 50MP camera, 5000mAh battery, and smooth 90Hz display." },
  // Electronics — Laptops
  { title: "HP 15s Ryzen 5 Laptop (8GB/512GB SSD)", category: "Laptops", brand: "HP", basePrice: 4299900, comparePrice: 5299900, stock: 25, sku: "EL-LAP-001", isFeatured: true, description: "Thin and light laptop with AMD Ryzen 5 processor, 15.6-inch Full HD display, and fast SSD storage." },
  { title: "HP 14s Intel i3 Laptop (8GB/256GB SSD)", category: "Laptops", brand: "HP", basePrice: 3299900, comparePrice: 3999900, stock: 30, sku: "EL-LAP-002", isFeatured: false, description: "Compact 14-inch laptop ideal for students and everyday computing with Intel Core i3 processor." },
  // Electronics — Audio
  { title: "boAt Rockerz 450 Wireless Headphones", category: "Audio", brand: "boAt", basePrice: 149900, comparePrice: 299900, stock: 150, sku: "EL-AUD-001", isFeatured: true, description: "Premium wireless headphones with 40mm drivers, 15-hour battery life, and padded ear cushions for comfort." },
  { title: "boAt Airdopes 141 TWS Earbuds", category: "Audio", brand: "boAt", basePrice: 109900, comparePrice: 199900, stock: 200, sku: "EL-AUD-002", isFeatured: false, description: "True wireless earbuds with 42-hour total playtime, low latency mode, and IPX4 water resistance." },
  // Electronics — Cameras
  { title: "Samsung Galaxy Buds FE with ANC", category: "Cameras", brand: "Samsung", basePrice: 599900, comparePrice: 699900, stock: 40, sku: "EL-CAM-001", isFeatured: false, description: "Premium earbuds with Active Noise Cancellation, 360 Audio, and 30-hour battery with case." },

  // Fashion — Men
  { title: "Nike Dri-FIT Men's Training T-Shirt", category: "Men", brand: "Nike", basePrice: 149900, comparePrice: 199900, stock: 100, sku: "FA-MEN-001", isFeatured: true, description: "Moisture-wicking training t-shirt with Dri-FIT technology. Lightweight and breathable for intense workouts." },
  { title: "Puma Men's Slim Fit Joggers", category: "Men", brand: "Puma", basePrice: 179900, comparePrice: 249900, stock: 80, sku: "FA-MEN-002", isFeatured: false, description: "Comfortable slim fit joggers with elastic waistband and zippered pockets. Perfect for casual and gym wear." },
  // Fashion — Women
  { title: "Nike Women's Air Max Running Shoes", category: "Women", brand: "Nike", basePrice: 799900, comparePrice: 999900, stock: 35, sku: "FA-WOM-001", isFeatured: true, description: "Iconic Air Max cushioning for all-day comfort. Lightweight mesh upper with responsive foam sole." },
  { title: "Puma Women's Training Leggings", category: "Women", brand: "Puma", basePrice: 199900, comparePrice: 299900, stock: 60, sku: "FA-WOM-002", isFeatured: false, description: "High-waist training leggings with 4-way stretch fabric and moisture-wicking dryCELL technology." },
  // Fashion — Kids
  { title: "Nike Kids' Everyday Cushioned Socks (3 Pack)", category: "Kids", brand: "Nike", basePrice: 59900, stock: 120, sku: "FA-KID-001", isFeatured: false, description: "Soft cotton blend socks with arch support and cushioned sole. Pack of 3 in assorted colours." },
  // Fashion — Footwear
  { title: "Puma Smash v2 Unisex Sneakers", category: "Footwear", brand: "Puma", basePrice: 249900, comparePrice: 399900, stock: 70, sku: "FA-FTW-001", isFeatured: true, description: "Classic court-style sneakers with soft leather upper, rubber outsole, and comfortable SoftFoam+ insole." },

  // Home & Kitchen — Furniture
  { title: "Tata Nilkamal Plastic Armchair (Brown)", category: "Furniture", brand: "Tata", basePrice: 149900, comparePrice: 199900, stock: 40, sku: "HK-FUR-001", isFeatured: false, description: "Sturdy and weather-resistant plastic armchair suitable for indoor and outdoor use. Easy to clean and maintain." },
  // Home & Kitchen — Appliances
  { title: "Prestige PIDM 3.0 Induction Cooktop", category: "Appliances", brand: "Prestige", basePrice: 219900, comparePrice: 299900, stock: 60, sku: "HK-APP-001", isFeatured: true, description: "1600W induction cooktop with push-button control, anti-magnetic wall technology, and Indian menu options." },
  { title: "Prestige Popular Pressure Cooker 5L", category: "Appliances", brand: "Prestige", basePrice: 179900, comparePrice: 239900, stock: 90, sku: "HK-APP-002", isFeatured: false, description: "India's favourite aluminium pressure cooker with metallic safety plug and precision weight valve." },
  // Home & Kitchen — Decor
  { title: "Tata Tanishq Brass Diya Set (Pack of 4)", category: "Decor", brand: "Tata", basePrice: 89900, comparePrice: 129900, stock: 100, sku: "HK-DEC-001", isFeatured: false, description: "Handcrafted brass diyas perfect for festive decoration and daily puja. Set of 4 with intricate designs." },
  // Home & Kitchen — Storage
  { title: "Prestige Clean Home Vacuum Cleaner 1.5L", category: "Storage", brand: "Prestige", basePrice: 399900, comparePrice: 499900, stock: 30, sku: "HK-STO-001", isFeatured: false, description: "Powerful 1400W vacuum cleaner with HEPA filter, multiple attachments, and 1.5L dust capacity." },

  // Beauty — Skincare
  { title: "Lakme Absolute Perfect Radiance Skin Cream", category: "Skincare", brand: "Lakme", basePrice: 39900, comparePrice: 49900, stock: 150, sku: "BE-SKN-001", isFeatured: true, description: "Brightening day cream with SPF 30 PA++ that gives radiant, even-toned skin. Suitable for all skin types." },
  { title: "Lakme Sun Expert Ultra Matte SPF 50 Lotion", category: "Skincare", brand: "Lakme", basePrice: 29900, comparePrice: 39900, stock: 180, sku: "BE-SKN-002", isFeatured: false, description: "Lightweight matte sunscreen lotion with broad-spectrum SPF 50 protection. Non-greasy formula." },
  // Beauty — Haircare
  { title: "Tata Harper Revitalizing Hair Oil (200ml)", category: "Haircare", brand: "Tata", basePrice: 24900, comparePrice: 34900, stock: 200, sku: "BE-HAR-001", isFeatured: false, description: "Natural hair oil enriched with coconut, amla, and brahmi extracts for strong, shiny, and healthy hair." },
  // Beauty — Makeup
  { title: "Lakme 9 to 5 Primer + Matte Lipstick", category: "Makeup", brand: "Lakme", basePrice: 34900, stock: 120, sku: "BE-MAK-001", isFeatured: false, description: "Long-lasting matte lipstick with built-in primer for smooth application. Available in 30+ shades." },
  // Beauty — Fragrances
  { title: "Lakme Enrich Satin Lip Color", category: "Fragrances", brand: "Lakme", basePrice: 19900, stock: 100, sku: "BE-FRG-001", isFeatured: false, description: "Enriched with olive extracts for smooth, satin-finish colour. Keeps lips moisturised all day." },

  // Sports — Gym Equipment
  { title: "Puma Training Resistance Bands Set", category: "Gym Equipment", brand: "Puma", basePrice: 99900, comparePrice: 149900, stock: 80, sku: "SF-GYM-001", isFeatured: false, description: "Set of 3 resistance bands with different tension levels for strength training, stretching, and rehabilitation." },
  { title: "Nike Fundamental Speed Rope", category: "Gym Equipment", brand: "Nike", basePrice: 79900, comparePrice: 99900, stock: 90, sku: "SF-GYM-002", isFeatured: false, description: "Adjustable-length speed rope with ball bearing handles for smooth, fast rotation during cardio workouts." },
  // Sports — Sportswear
  { title: "Nike Pro Men's Compression Shorts", category: "Sportswear", brand: "Nike", basePrice: 129900, comparePrice: 179900, stock: 60, sku: "SF-SPW-001", isFeatured: false, description: "Tight-fit compression shorts with Dri-FIT technology for support and ventilation during training." },
  // Sports — Outdoor
  { title: "Puma Unisex Outdoor Backpack (35L)", category: "Outdoor", brand: "Puma", basePrice: 199900, comparePrice: 299900, stock: 45, sku: "SF-OUT-001", isFeatured: true, description: "Durable 35-litre backpack with multiple compartments, padded laptop sleeve, and water-resistant fabric." },
  // Sports — Yoga
  { title: "Nike Fundamental Yoga Mat (3mm)", category: "Yoga", brand: "Nike", basePrice: 179900, comparePrice: 249900, stock: 55, sku: "SF-YOG-001", isFeatured: false, description: "Lightweight 3mm yoga mat with textured surface for grip, foam cushioning, and easy carry strap." },

  // Books — Fiction
  { title: "Classmate Notebook Premium Ruled (Pack of 6)", category: "Fiction", brand: "Classmate", basePrice: 29900, stock: 300, sku: "BS-FIC-001", isFeatured: false, description: "Premium single-line ruled notebooks with 172 pages each. Smooth paper quality ideal for writing." },
  // Books — Non-Fiction
  { title: "Classmate Drawing Book A3 (50 Pages)", category: "Non-Fiction", brand: "Classmate", basePrice: 14900, stock: 200, sku: "BS-NF-001", isFeatured: false, description: "Large A3 size drawing book with thick white pages suitable for sketching, painting, and art projects." },
  // Books — Office Supplies
  { title: "Classmate Pulse Gel Pen (Pack of 10)", category: "Office Supplies", brand: "Classmate", basePrice: 14900, comparePrice: 19900, stock: 250, sku: "BS-OFF-001", isFeatured: false, description: "Smooth gel pens with comfortable rubber grip and 0.5mm tip for neat writing. Pack of 10 blue pens." },
  // Books — Art Supplies
  { title: "Classmate Colour Pencils (24 Shades)", category: "Art Supplies", brand: "Classmate", basePrice: 19900, comparePrice: 24900, stock: 150, sku: "BS-ART-001", isFeatured: false, description: "Premium colour pencils with vibrant pigments and smooth laydown. Break-resistant leads in 24 shades." },

  // Toys — Board Games
  { title: "Funskool Monopoly Classic Board Game", category: "Board Games", brand: "Funskool", basePrice: 49900, comparePrice: 69900, stock: 50, sku: "TG-BRD-001", isFeatured: true, description: "The classic family board game of buying, selling, and trading properties. For 2-6 players, ages 8+." },
  { title: "Funskool Scrabble Original Board Game", category: "Board Games", brand: "Funskool", basePrice: 59900, comparePrice: 79900, stock: 40, sku: "TG-BRD-002", isFeatured: false, description: "Classic word game with premium tiles and rotating board. Build words and score points. Ages 10+." },
  // Toys — Action Figures
  { title: "Funskool Marvel Avengers Action Figure Set", category: "Action Figures", brand: "Funskool", basePrice: 79900, comparePrice: 99900, stock: 35, sku: "TG-ACT-001", isFeatured: false, description: "Set of 4 articulated Marvel Avengers action figures including Iron Man, Captain America, Thor, and Hulk." },
  // Toys — Educational
  { title: "Funskool Play-Doh Fun Factory Set", category: "Educational", brand: "Funskool", basePrice: 44900, comparePrice: 59900, stock: 60, sku: "TG-EDU-001", isFeatured: false, description: "Creative Play-Doh set with extruder, moulds, and 4 cans of compound. Develops fine motor skills." },
  // Toys — Outdoor Play
  { title: "Funskool Cricket Set (Junior)", category: "Outdoor Play", brand: "Funskool", basePrice: 89900, comparePrice: 119900, stock: 45, sku: "TG-OUT-001", isFeatured: false, description: "Complete junior cricket set with bat, ball, stumps, and carry bag. Suitable for ages 5-10." },

  // Grocery — Snacks
  { title: "Tata Sampann Roasted Chana (400g)", category: "Snacks", brand: "Tata", basePrice: 8900, stock: 300, sku: "GR-SNK-001", isFeatured: false, description: "Crunchy roasted chana made from unpolished whole chana dal. High protein, fibre-rich healthy snack." },
  { title: "Tata Soulfull Ragi Bites Choco Fills (250g)", category: "Snacks", brand: "Tata", basePrice: 14900, stock: 200, sku: "GR-SNK-002", isFeatured: false, description: "Tasty chocolate-filled ragi bites — a healthier cereal option for kids with the goodness of ragi." },
  // Grocery — Beverages
  { title: "Tata Gold Premium Tea (500g)", category: "Beverages", brand: "Tata", basePrice: 27900, comparePrice: 32900, stock: 150, sku: "GR-BEV-001", isFeatured: false, description: "Premium blend of Assam and Nilgiri tea leaves for a rich, aromatic cup. India's trusted tea brand." },
  { title: "Tata Sampann Organic Green Tea (25 Bags)", category: "Beverages", brand: "Tata", basePrice: 17900, comparePrice: 22900, stock: 120, sku: "GR-BEV-002", isFeatured: false, description: "100% organic green tea with natural antioxidants. Light and refreshing flavour, 25 staple-free bags." },
  // Grocery — Cleaning
  { title: "Tata Swach Water Purifier Cartridge", category: "Cleaning", brand: "Tata", basePrice: 49900, comparePrice: 59900, stock: 80, sku: "GR-CLN-001", isFeatured: false, description: "Replacement cartridge for Tata Swach water purifier. Removes bacteria and provides safe drinking water." },
  // Grocery — Personal Hygiene
  { title: "Tata 1mg Sanitizer (500ml, Pack of 2)", category: "Personal Hygiene", brand: "Tata", basePrice: 19900, comparePrice: 29900, stock: 200, sku: "GR-PHY-001", isFeatured: false, description: "70% alcohol-based hand sanitizer gel. Kills 99.9% germs. Moisturising formula with aloe vera." },

  // Extra products for variety
  { title: "Samsung 24-inch FHD Monitor (LS24)", category: "Laptops", brand: "Samsung", basePrice: 1099900, comparePrice: 1399900, stock: 20, sku: "EL-LAP-003", isFeatured: false, description: "24-inch Full HD IPS monitor with 75Hz refresh rate, AMD FreeSync, and slim bezel design." },
  { title: "boAt Stone 352 Portable Bluetooth Speaker", category: "Audio", brand: "boAt", basePrice: 149900, comparePrice: 249900, stock: 100, sku: "EL-AUD-003", isFeatured: false, description: "10W portable speaker with IPX5 water resistance, 12-hour playtime, and TWS pairing support." },
  { title: "Nike Academy Football (Size 5)", category: "Outdoor", brand: "Nike", basePrice: 179900, comparePrice: 249900, stock: 40, sku: "SF-OUT-002", isFeatured: false, description: "Machine-stitched football with textured casing for consistent touch and aerodynamic performance." },
  { title: "Prestige Omega Deluxe Non-Stick Tawa", category: "Appliances", brand: "Prestige", basePrice: 74900, comparePrice: 99900, stock: 100, sku: "HK-APP-003", isFeatured: false, description: "Premium non-stick concave tawa with 5-star non-stick coating and heat-resistant handles." },
  { title: "HP DeskJet 2723e All-in-One Printer", category: "Cameras", brand: "HP", basePrice: 549900, comparePrice: 699900, stock: 15, sku: "EL-CAM-002", isFeatured: false, description: "Compact all-in-one printer with wireless printing, scanning, and copying. Supports HP Instant Ink." },
];

const HERO_SLIDES = [
  { title: "Mega Electronics Sale", subtitle: "Up to 60% off on smartphones, laptops & audio", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&h=600&fit=crop&q=80", ctaText: "Shop Now", ctaLink: "/category/electronics", position: 1 },
  { title: "Fashion Fiesta", subtitle: "New arrivals from Nike, Puma & more — starting at ₹599", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&h=600&fit=crop&q=80", ctaText: "Explore", ctaLink: "/category/fashion", position: 2 },
  { title: "Home Essentials", subtitle: "Everything for your kitchen & home at amazing prices", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=600&fit=crop&q=80", ctaText: "Browse", ctaLink: "/category/home-kitchen", position: 3 },
];

const REVIEW_DATA = [
  { productIdx: 0, rating: 5, title: "Best phone in this range", comment: "Amazing battery life and camera quality. Totally worth the price.", userName: "Rahul S." },
  { productIdx: 2, rating: 4, title: "Great laptop for students", comment: "Fast SSD and good build quality. Display could be brighter though.", userName: "Priya M." },
  { productIdx: 4, rating: 5, title: "Incredible sound quality", comment: "Bass is deep, mids are clear. Best headphones under ₹1500.", userName: "Amit K." },
  { productIdx: 7, rating: 4, title: "Comfortable and lightweight", comment: "Perfect for gym sessions. The fabric is breathable and dries quickly.", userName: "Vikram R." },
  { productIdx: 9, rating: 5, title: "Love these shoes!", comment: "Super comfortable for running. Air Max cushioning is amazing.", userName: "Sneha P." },
  { productIdx: 14, rating: 5, title: "Must-have for Indian kitchen", comment: "Heats up fast and energy efficient. Using it daily for 6 months now.", userName: "Meera D." },
  { productIdx: 19, rating: 4, title: "Good moisturizer with SPF", comment: "Lightweight cream that absorbs quickly. SPF protection is a plus.", userName: "Ananya G." },
  { productIdx: 26, rating: 5, title: "Perfect backpack", comment: "Fits my laptop, books, and gym clothes. Very comfortable straps.", userName: "Karthik V." },
  { productIdx: 33, rating: 5, title: "Family game night favourite", comment: "Kids and adults both love it. Brings the whole family together.", userName: "Deepa N." },
  { productIdx: 40, rating: 4, title: "Best tea for daily use", comment: "Rich flavour without being too strong. Great with or without milk.", userName: "Suresh T." },
];

// ─── Seed Function ───

async function seed() {
  console.log("🌱 Starting seed...\n");

  // Clear existing data in reverse FK order
  console.log("🗑️  Clearing existing data...");
  await db.delete(schema.reviews);
  await db.delete(schema.deals);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.cartItems);
  await db.delete(schema.carts);
  await db.delete(schema.heroContents);
  await db.delete(schema.homepageSections);
  await db.delete(schema.coupons);
  await db.delete(schema.productVariants);
  await db.delete(schema.productOptionValues);
  await db.delete(schema.productOptions);
  await db.delete(schema.products);
  await db.delete(schema.brands);
  // Delete child categories first, then parents
  await db.delete(schema.categories);
  await db.delete(schema.otps);
  await db.delete(schema.addresses);
  await db.delete(schema.users);
  console.log("   Done.\n");

  // ─── Users ───
  console.log("👤 Creating users...");
  const adminId = createId();
  const regularUserId = createId();
  await db.insert(schema.users).values([
    { id: adminId, email: "admin@manakart.com", name: "Admin", phone: "9999999999", role: "ADMIN" },
    { id: regularUserId, email: "user@manakart.com", name: "Test User", phone: "9876543210", role: "USER" },
  ]);
  console.log("   Created admin (admin@manakart.com) and test user.\n");

  // ─── Categories ───
  console.log("📁 Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const parent of PARENT_CATEGORIES) {
    const parentId = createId();
    const parentSlug = slugify(parent.name);
    categoryMap[parent.name] = parentId;
    await db.insert(schema.categories).values({
      id: parentId,
      name: parent.name,
      slug: parentSlug,
      icon: parent.icon,
      image: PARENT_CATEGORY_IMAGES[parent.name] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80`,
      showInNav: true,
      position: parent.position,
      isActive: true,
    });
    for (let i = 0; i < parent.children.length; i++) {
      const childName = parent.children[i];
      const childId = createId();
      const childSlug = slugify(childName);
      categoryMap[childName] = childId;
      await db.insert(schema.categories).values({
        id: childId,
        name: childName,
        slug: childSlug,
        icon: parent.icon,
        image: getSubcategoryImage(childName),
        showInNav: false,
        position: i + 1,
        isActive: true,
        parentId,
      });
    }
  }
  console.log(`   Created ${Object.keys(categoryMap).length} categories.\n`);

  // ─── Brands ───
  console.log("🏷️  Creating brands...");
  const brandMap: Record<string, string> = {};
  for (const name of BRAND_NAMES) {
    const id = createId();
    brandMap[name] = id;
    await db.insert(schema.brands).values({
      id,
      name,
      slug: slugify(name),
      logo: BRAND_LOGO_MAP[name] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&q=80`,
      isActive: true,
    });
  }
  console.log(`   Created ${BRAND_NAMES.length} brands.\n`);

  // ─── Products ───
  console.log("📦 Creating products...");
  const productIds: string[] = [];
  for (const p of PRODUCTS) {
    const id = createId();
    productIds.push(id);
    const slug = slugify(p.title);
    await db.insert(schema.products).values({
      id,
      title: p.title,
      slug,
      description: p.description,
      basePrice: p.basePrice,
      comparePrice: p.comparePrice ?? null,
      images: getProductImages(p.category),
      stock: p.stock,
      sku: p.sku,
      isFeatured: p.isFeatured,
      isActive: true,
      categoryId: categoryMap[p.category] ?? null,
      brandId: brandMap[p.brand] ?? null,
    });
  }
  console.log(`   Created ${PRODUCTS.length} products.\n`);

  // ─── Variant Products ───
  console.log("🎨 Creating variant products...");

  // --- 1. Nike Dri-FIT T-Shirt (idx 7) → Size + Color ---
  const tshirtIdx = 7;
  const tshirtId = productIds[tshirtIdx];
  const tshirtSizeOpt = createId();
  const tshirtColorOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: tshirtSizeOpt, productId: tshirtId, name: "Size", position: 0 },
    { id: tshirtColorOpt, productId: tshirtId, name: "Color", position: 1 },
  ]);
  const tshirtSizes = ["S", "M", "L", "XL"];
  const tshirtColors = ["Black", "White", "Navy"];
  for (let i = 0; i < tshirtSizes.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: tshirtSizeOpt, value: tshirtSizes[i], position: i });
  }
  for (let i = 0; i < tshirtColors.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: tshirtColorOpt, value: tshirtColors[i], position: i });
  }
  let variantCount = 0;
  let pos = 0;
  for (const size of tshirtSizes) {
    for (const color of tshirtColors) {
      const stock = size === "M" || size === "L" ? 25 : 15;
      await db.insert(schema.productVariants).values({
        id: createId(), productId: tshirtId, price: 149900, comparePrice: 199900, stock,
        sku: `FA-MEN-001-${size}-${color.substring(0, 3).toUpperCase()}`,
        optionValues: [{ optionName: "Size", valueName: size }, { optionName: "Color", valueName: color }],
        isActive: true, position: pos++,
      });
      variantCount++;
    }
  }
  await db.update(schema.products).set({ hasVariants: true, stock: 240 }).where(eq(schema.products.id, tshirtId));

  // --- 2. Nike Women's Air Max (idx 9) → Size ---
  const shoesIdx = 9;
  const shoesId = productIds[shoesIdx];
  const shoesSizeOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: shoesSizeOpt, productId: shoesId, name: "Size", position: 0 },
  ]);
  const shoeSizes = ["UK 4", "UK 5", "UK 6", "UK 7", "UK 8"];
  for (let i = 0; i < shoeSizes.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: shoesSizeOpt, value: shoeSizes[i], position: i });
  }
  pos = 0;
  for (const size of shoeSizes) {
    const stock = size === "UK 6" ? 12 : size === "UK 4" || size === "UK 8" ? 5 : 8;
    await db.insert(schema.productVariants).values({
      id: createId(), productId: shoesId, price: 799900, comparePrice: 999900, stock,
      sku: `FA-WOM-001-${size.replace(" ", "")}`,
      optionValues: [{ optionName: "Size", valueName: size }],
      isActive: true, position: pos++,
    });
    variantCount++;
  }
  await db.update(schema.products).set({ hasVariants: true, stock: 38 }).where(eq(schema.products.id, shoesId));

  // --- 3. Samsung Galaxy M34 (idx 0) → Storage + Color ---
  const phoneIdx = 0;
  const phoneId = productIds[phoneIdx];
  const phoneStorageOpt = createId();
  const phoneColorOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: phoneStorageOpt, productId: phoneId, name: "Storage", position: 0 },
    { id: phoneColorOpt, productId: phoneId, name: "Color", position: 1 },
  ]);
  const phoneStorages = ["128GB", "256GB"];
  const phoneColors = ["Midnight Blue", "Electric Green"];
  for (let i = 0; i < phoneStorages.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: phoneStorageOpt, value: phoneStorages[i], position: i });
  }
  for (let i = 0; i < phoneColors.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: phoneColorOpt, value: phoneColors[i], position: i });
  }
  pos = 0;
  const phonePrices: Record<string, number> = { "128GB": 1499900, "256GB": 1799900 };
  const phoneComparePrices: Record<string, number> = { "128GB": 1999900, "256GB": 2299900 };
  for (const storage of phoneStorages) {
    for (const color of phoneColors) {
      await db.insert(schema.productVariants).values({
        id: createId(), productId: phoneId, price: phonePrices[storage], comparePrice: phoneComparePrices[storage], stock: 15,
        sku: `EL-MOB-001-${storage}-${color === "Midnight Blue" ? "BLU" : "GRN"}`,
        optionValues: [{ optionName: "Storage", valueName: storage }, { optionName: "Color", valueName: color }],
        isActive: true, position: pos++,
      });
      variantCount++;
    }
  }
  await db.update(schema.products).set({ hasVariants: true, basePrice: 1499900, stock: 60 }).where(eq(schema.products.id, phoneId));

  // --- 4. Puma Smash v2 Sneakers (idx 11) → Size + Color ---
  const sneakersIdx = 11;
  const sneakersId = productIds[sneakersIdx];
  const sneakersSizeOpt = createId();
  const sneakersColorOpt = createId();
  await db.insert(schema.productOptions).values([
    { id: sneakersSizeOpt, productId: sneakersId, name: "Size", position: 0 },
    { id: sneakersColorOpt, productId: sneakersId, name: "Color", position: 1 },
  ]);
  const sneakerSizes = ["UK 7", "UK 8", "UK 9", "UK 10"];
  const sneakerColors = ["White", "Black"];
  for (let i = 0; i < sneakerSizes.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: sneakersSizeOpt, value: sneakerSizes[i], position: i });
  }
  for (let i = 0; i < sneakerColors.length; i++) {
    await db.insert(schema.productOptionValues).values({ id: createId(), optionId: sneakersColorOpt, value: sneakerColors[i], position: i });
  }
  pos = 0;
  for (const size of sneakerSizes) {
    for (const color of sneakerColors) {
      await db.insert(schema.productVariants).values({
        id: createId(), productId: sneakersId, price: 249900, comparePrice: 399900, stock: 10,
        sku: `FA-FTW-001-${size.replace(" ", "")}-${color.substring(0, 3).toUpperCase()}`,
        optionValues: [{ optionName: "Size", valueName: size }, { optionName: "Color", valueName: color }],
        isActive: true, position: pos++,
      });
      variantCount++;
    }
  }
  await db.update(schema.products).set({ hasVariants: true, stock: 80 }).where(eq(schema.products.id, sneakersId));

  console.log(`   Created ${variantCount} variants across 4 products.\n`);

  // ─── Hero Content ───
  console.log("🖼️  Creating hero slides...");
  for (const slide of HERO_SLIDES) {
    await db.insert(schema.heroContents).values({
      id: createId(),
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      isActive: true,
      position: slide.position,
    });
  }
  console.log(`   Created ${HERO_SLIDES.length} hero slides.\n`);

  // ─── Deals ───
  console.log("🔥 Creating deals...");
  const dealProductIndices = [0, 4, 9, 14, 33]; // Samsung M34, boAt headphones, Nike shoes, Prestige cooktop, Monopoly
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  for (let i = 0; i < dealProductIndices.length; i++) {
    const idx = dealProductIndices[i];
    const product = PRODUCTS[idx];
    const dealPrice = Math.round(product.basePrice * 0.75); // 25% off
    await db.insert(schema.deals).values({
      id: createId(),
      productId: productIds[idx],
      dealPrice,
      startsAt: now,
      endsAt: thirtyDaysLater,
      isActive: true,
      position: i + 1,
    });
  }
  console.log(`   Created ${dealProductIndices.length} deals.\n`);

  // ─── Coupons ───
  console.log("🎟️  Creating coupons...");
  await db.insert(schema.coupons).values([
    {
      id: createId(),
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      value: 10,
      minOrderValue: 49900, // ₹499
      maxDiscount: 50000, // ₹500
      usageLimit: 1000,
      usedCount: 0,
      expiresAt: thirtyDaysLater,
      isActive: true,
    },
    {
      id: createId(),
      code: "FLAT200",
      discountType: "FLAT",
      value: 20000, // ₹200
      minOrderValue: 99900, // ₹999
      usageLimit: 500,
      usedCount: 0,
      expiresAt: thirtyDaysLater,
      isActive: true,
    },
  ]);
  console.log("   Created 2 coupons (WELCOME10, FLAT200).\n");

  // ─── Reviews ───
  console.log("⭐ Creating reviews...");
  for (const r of REVIEW_DATA) {
    await db.insert(schema.reviews).values({
      id: createId(),
      productId: productIds[r.productIdx],
      userId: regularUserId,
      userName: r.userName,
      title: r.title,
      rating: r.rating,
      comment: r.comment,
      isFeatured: true,
      isApproved: true,
    });
  }
  console.log(`   Created ${REVIEW_DATA.length} reviews.\n`);

  // ─── Homepage Sections ───
  console.log("🏠 Creating homepage sections...");
  await db.insert(schema.homepageSections).values([
    { id: createId(), type: "deals", title: "Deal of the Day", position: 1, isActive: true },
    { id: createId(), type: "categories", title: "Shop by Category", position: 2, isActive: true },
    { id: createId(), type: "featured", title: "Featured Products", position: 3, isActive: true },
    { id: createId(), type: "reviews", title: "What Our Customers Say", position: 4, isActive: true },
  ]);
  console.log("   Created 4 homepage sections.\n");

  console.log("✅ Seed complete! Database populated with:");
  console.log(`   • 2 users (admin + test)`);
  console.log(`   • ${Object.keys(categoryMap).length} categories (${PARENT_CATEGORIES.length} parent + ${Object.keys(categoryMap).length - PARENT_CATEGORIES.length} subcategories)`);
  console.log(`   • ${BRAND_NAMES.length} brands`);
  console.log(`   • ${PRODUCTS.length} products (4 with variants, ${variantCount} total variants)`);
  console.log(`   • ${HERO_SLIDES.length} hero slides`);
  console.log(`   • ${dealProductIndices.length} deals`);
  console.log(`   • 2 coupons`);
  console.log(`   • ${REVIEW_DATA.length} reviews`);
  console.log(`   • 4 homepage sections`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
