// One-time migration: uploads the images that used to be hardcoded in
// Latest.tsx to Supabase Storage and inserts matching rows into `products`.
//
// Run once, after the schema (supabase/schema.sql) has been applied:
//   node --env-file=.env.local scripts/seedProducts.mjs
//
// Safe to re-run: it skips any product whose name already exists in the DB.

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, "..", "src", "assets");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run this with: node --env-file=.env.local scripts/seedProducts.mjs"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// name, source image file, price (naira), category, description
const PRODUCTS = [
  ["Pink Long Sleeve", "sales17.jpg", 5500, "Long Sleeves", "Soft pink long sleeve top, perfect for everyday styling."],
  ["Blue Long Sleeve", "sales1.jpg", 5500, "Long Sleeves", "Comfortable blue long sleeve ideal for casual and semi-casual looks."],
  ["Red Long Sleeve", "sales2.jpg", 5500, "Long Sleeves", "Bold red long sleeve designed to make a stylish impression."],
  ["Black Long Sleeve", "sales3.jpg", 5500, "Long Sleeves", "Timeless black long sleeve suitable for every wardrobe."],
  ["Brown Long Sleeve", "sales4.jpg", 5500, "Long Sleeves", "Elegant brown long sleeve top made from quality fabric."],
  ["Deep Blue Long Sleeve", "sales5.jpg", 5500, "Long Sleeves", "Deep blue long sleeve for a classy and sleek appearance."],
  ["White Long Sleeve", "sales6.jpg", 5500, "Long Sleeves", "Clean and versatile white long sleeve for all-season wear."],
  ["Royal Blue Long Sleeve", "sales22.jpg", 5500, "Long Sleeves", "Vibrant royal blue long sleeve for a bold and stylish look."],

  ["Black Basic Top", "sales7.jpg", 4500, "Basic Tops", "Essential black basic top perfect for simple everyday outfits."],
  ["Bright Pink Basic Top", "sales18.jpg", 4500, "Basic Tops", "Bright baby pink top for soft and feminine looks."],
  ["Brown Basic Top", "sales20.jpeg", 4500, "Basic Tops", "Comfortable brown basic top ideal for casual styling."],
  ["Yellow Basic Top", "sales19.jpeg", 4500, "Basic Tops", "Bright yellow top that adds color to your wardrobe."],
  ["Royal Blue Basic Top", "sales11.jpg", 4500, "Basic Tops", "Vibrant royal blue top for bold and stylish outfits."],
  ["Navy Blue Basic Top", "sales21.jpg", 4500, "Basic Tops", "Deep navy blue top suitable for relaxed everyday wear."],
  ["Baby Pink Basic Top", "sales8.jpg", 4500, "Basic Tops", "Soft baby pink basic top designed for chic casual looks."],
  ["White Basic Top", "sales9.jpg", 4500, "Basic Tops", "Classic white basic top for a clean and simple style."],
  ["Blue Basic Top", "sales10.jpg", 4500, "Basic Tops", "Cool blue basic top for effortless everyday wear."],

  ["Brown Short-Sleeve Pin-Down", "sales14.jpeg", 5500, "Pin Down", "Stylish brown short-sleeve pin-down perfect for casual outings."],
  ["Black Short-Sleeve Pin-Down", "sales15.jpeg", 5500, "Pin Down", "Classic black short-sleeve pin-down for an elegant look."],
  ["Pink Short-Sleeve Pin-Down", "sales12.jpg", 5500, "Pin Down", "Chic pink short-sleeve pin-down that complements colorful outfits."],
  ["White Short-Sleeve Pin-Down", "sales13.jpg", 5500, "Pin Down", "Clean white short-sleeve pin-down suitable for any occasion."],
  ["Bright Pink Sleeveless Pin-Down", "sales16.jpg", 5000, "Pin Down", "Bright pink sleeveless pin-down offering a bold and confident style."],
  ["Red Sleeveless Pin-Down", "sales23.jpg", 5000, "Pin Down", "Striking red sleeveless pin-down for standout looks."],
  ["Pink Sleeveless Pin-Down", "sales24.jpg", 5000, "Pin Down", "Soft pink sleeveless pin-down blending comfort and style."],
  ["Black Sleeveless Pin-Down", "sales25.jpg", 5000, "Pin Down", "Essential black sleeveless pin-down for a polished finish."],
  ["White Sleeveless Pin-Down", "sales26.jpg", 5000, "Pin Down", "Elegant white sleeveless pin-down perfect for minimal chic outfits."],
  ["Brown Sleeveless Pin-Down", "sales27.jpg", 5000, "Pin Down", "Brown sleeveless pin-down designed for relaxed and stylish looks."],

  ["Leopard-Print Bodycon Maxi Skirt", "maxi1.jpeg", 4000, "Maxi Skirt", "Bold leopard-print bodycon skirt perfect for standout looks."],
  ["Single-Slit Black Skirt", "maxi2.jpg", 5000, "Maxi Skirt", "Black skirt with a sleek side slit for a classy appeal."],
  ["Black Maxi Skirt", "maxi3.jpg", 4000, "Maxi Skirt", "Simple and elegant black maxi skirt for versatile styling."],
  ["Brown Maxi Skirt", "maxi4.jpg", 4000, "Maxi Skirt", "Chic brown maxi skirt suitable for relaxed and stylish outfits."],
  ["Green Maxi Gown", "maxi12.jpg", 4000, "Maxi Skirt", "Soft green maxi gown with a calm and elegant tone."],
  ["Blue Maxi Gown", "maxi13.jpg", 4000, "Maxi Skirt", "Soft blue maxi gown with a gentle and elegant feel."],
  ["Pink Maxi Gown", "maxi14.jpg", 4000, "Maxi Skirt", "Soft pink maxi gown designed for feminine and chic looks."],
  ["Combo Basic Top & Maxi Skirt", "maxi5.jpeg", 8500, "Maxi Skirt", "Affordable combo set featuring a stylish top and maxi skirt."],

  ["Leopard-Print Bodycon Maxi Gown", "maxi6.jpg", 4500, "Maxi Gown", "Eye-catching leopard-print maxi gown for fashionable occasions."],
  ["Pink Maxi Gown ", "maxi7.jpg", 4500, "Maxi Gown", "Beautiful pink maxi gown with a flattering silhouette."],
  ["Red Maxi Gown", "maxi8.jpg", 4500, "Maxi Gown", "Striking red maxi gown designed to make a statement."],
  ["Brown Maxi Gown", "maxi9.jpg", 4500, "Maxi Gown", "Elegant brown maxi gown designed for comfort and style."],
  ["Black Maxi Gown", "maxi10.jpg", 4500, "Maxi Gown", "Sleek black maxi gown suitable for all events."],
  ["Blue Maxi Gown ", "maxi11.jpg", 4500, "Maxi Gown", "Soft blue maxi gown with a calm and elegant tone."],

  ["A3 Elegant Charm", "pin1.jpg", 10000, "Frames", "A3-sized elegant charm frame for stylish wall décor."],
  ["A4 Sophisticated", "pin8.jpg", 6000, "Frames", "Sophisticated A4 frame that complements modern interiors."],
  ["A4 Nature's Touch", "pin2.jpg", 6000, "Frames", "Nature-inspired A4 frame with refreshing design elements."],
  ["A4 Royal Experience", "pin3.jpg", 10000, "Frames", "Luxury A4 royal-themed frame for an elegant feel."],
  ["A4 Lonely Frame", "pin4.jpg", 6000, "Frames", "Minimalist A4 frame with a unique artistic expression."],
  ["A4 Excitement Frame", "pin5.jpg", 6000, "Frames", "Vibrant A4 frame bringing energy to any space."],
  ["A4 Birthday Frame", "pin6.jpg", 6000, "Frames", "Cheerful A4 birthday-themed frame perfect for gifting."],
];

function contentTypeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpeg" || ext === ".jpg") return "image/jpeg";
  return "application/octet-stream";
}

async function main() {
  const { data: existing } = await supabase.from("products").select("name");
  const existingNames = new Set((existing ?? []).map((p) => p.name));

  let uploaded = 0;
  let skipped = 0;

  for (const [name, file, price, category, description] of PRODUCTS) {
    if (existingNames.has(name)) {
      skipped++;
      continue;
    }

    const filePath = path.join(assetsDir, file);
    const buffer = await readFile(filePath);
    const storagePath = `${crypto.randomUUID()}-${file}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(storagePath, buffer, { contentType: contentTypeFor(file) });

    if (uploadError) {
      console.error(`Failed to upload ${file} for "${name}":`, uploadError.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("products").insert({
      name,
      description,
      price,
      category,
      stock: 10,
      is_featured: false,
      image_url: publicUrlData.publicUrl,
    });

    if (insertError) {
      console.error(`Failed to insert product "${name}":`, insertError.message);
      continue;
    }

    uploaded++;
    console.log(`Seeded: ${name}`);
  }

  console.log(`\nDone. Uploaded ${uploaded} product(s), skipped ${skipped} already-seeded.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
