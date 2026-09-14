import { siteImages } from './siteImages.js';

const paperCupUsage =
  'Hot and cold beverages, cafes, tea shops, coffee chains, juice counters, and takeaway service.';

const commonCupDescription =
  'Premium food-grade paper cups suitable for hot and cold beverages. Available in multiple capacities with custom branding options for cafes, restaurants, distributors, and exporters.';

const recyclableFeatures = ['100% Recyclable'];

const spec = (size, gsm, dimensions, packing = '') => ({
  size,
  gsm,
  dimensions,
  packing
});

const product = ({
  number,
  title,
  slug,
  category,
  shortDescription,
  description,
  image,
  material,
  printing,
  colours,
  usage,
  features = recyclableFeatures,
  coating,
  packingDetails,
  specifications,
  options,
  visual = 'Paper Packaging',
  accent = '#2E7D32'
}) => ({
  number,
  title,
  name: title,
  slug,
  category,
  shortDescription,
  description,
  products: [title],
  sizes: specifications?.map((item) => item.size).join(', ') || '',
  material,
  moq: 'Bulk order support',
  usage,
  image,
  visual,
  accent,
  options: options || printing.join(' / '),
  printing,
  colours,
  features,
  coating,
  packingDetails,
  specifications
});

const paperCupSpecs = [
  spec('120 ML (4 OZ)', '180 GSM (165+15PE)', '60 x 45 x 60 MM', '1000 pcs/carton'),
  spec('150 ML (5 OZ)', '180 GSM (165+15PE)', '63 x 45 x 70 MM', '1000 pcs/carton'),
  spec('180 ML (6 OZ) / 210 ML (7 OZ)', '180 GSM (165+15PE) / 248 GSM (230+18PE)', '71 x 51 x 78 MM', '1000 pcs/carton'),
  spec('240 ML (8 OZ)', '248 GSM (230+18PE) / 278 GSM (260+18PE)', '80 x 56 x 92 MM', '1000 pcs/carton'),
  spec('300 ML (10 OZ)', '298 GSM (280+18PE) / 324 GSM (300+24PE)', '90 x 60 x 94 MM', '1000 pcs/carton'),
  spec('360 ML (12 OZ)', '298 GSM (280+18PE) / 324 GSM (300+24PE)', '90 x 60 x 109 MM', '1000 pcs/carton'),
  spec('480 ML (16 OZ)', '298 GSM (280+18PE) / 324 GSM (300+24PE)', '90 x 60 x 137 MM', '1000 pcs/carton'),
  spec('600 ML (20 OZ)', '298 GSM (280+18PE) / 324 GSM (300+24PE)', '90 x 60 x 159 MM', '1000 pcs/carton')
];

export const productCatalog = [
  product({
    number: '01',
    title: 'Single Wall Paper Cup',
    slug: 'single-wall-paper-cup',
    category: 'Paper Cups',
    shortDescription: 'Single wall paper cups for tea, coffee, juice, and takeaway beverages.',
    description: commonCupDescription,
    image: siteImages.products.singleWallPaperCup,
    material: 'Food-grade paper board',
    printing: ['Screen Printing', 'Offset Printing'],
    colours: ['White', 'Kraft', 'Custom Print'],
    usage: paperCupUsage,
    coating: 'One Side LDPE',
    packingDetails: '50 Pieces per Sleeve',
    specifications: paperCupSpecs
  }),
  product({
    number: '02',
    title: 'Ripple Wall Paper Cup',
    slug: 'ripple-wall-paper-cup',
    category: 'Paper Cups',
    shortDescription: 'Ripple wall paper cups for premium hot beverage insulation and better grip.',
    description:
      'Ripple wall paper cups provide a premium insulated feel for hot beverages, takeaway counters, cafes, coffee chains, and branded beverage programs.',
    image: siteImages.products.rippleWallPaperCup,
    material: 'Food-grade paper board',
    printing: ['Flexo Printing', 'Digital Printing'],
    colours: ['Kraft', 'Black', 'Brown Chess', 'Custom Print'],
    usage: paperCupUsage,
    coating: 'One Side LDPE',
    packingDetails: '25 Pieces per Sleeve',
    specifications: [
      spec('120 ML (4 OZ)', '180 GSM (165+15PE) + 240 GSM', '60 x 45 x 60 MM', '1000 pcs/carton'),
      spec('150 ML (5 OZ)', '180 GSM (165+15PE) + 240 GSM', '63 x 45 x 70 MM', '1000 pcs/carton'),
      spec('180 ML (6 OZ) / 210 ML (7 OZ)', '180 GSM (165+15PE) + 240 GSM', '71 x 51 x 78 MM', '1000 pcs/carton'),
      spec('240 ML (8 OZ)', '278 GSM (260+18PE) + 240 GSM', '80 x 56 x 92 MM', '1000 pcs/carton'),
      spec('300 ML (10 OZ)', '298 GSM (280+18PE) + 240 GSM', '90 x 60 x 94 MM', '1000 pcs/carton'),
      spec('360 ML (12 OZ)', '298 GSM (280+18PE) + 240 GSM', '90 x 60 x 109 MM', '1000 pcs/carton'),
      spec('480 ML (16 OZ)', '324 GSM (300+24PE) + 240 GSM', '90 x 60 x 137 MM', '1000 pcs/carton'),
      spec('600 ML (20 OZ)', '324 GSM (300+24PE) + 240 GSM', '90 x 60 x 159 MM', '1000 pcs/carton')
    ]
  }),
  product({
    number: '03',
    title: 'Double Wall Paper Cup',
    slug: 'double-wall-paper-cup',
    category: 'Paper Cups',
    shortDescription: 'Double wall paper cups for premium insulation and branded beverage packaging.',
    description:
      'Double wall paper cups are designed for better heat insulation, premium serving presentation, and custom branding for cafes, restaurants, distributors, and exporters.',
    image: siteImages.products.doubleWallPaperCup,
    material: 'Food-grade paper board',
    printing: ['Screen Printing', 'Offset Printing'],
    colours: ['Kraft', 'White', 'Custom Print'],
    usage: paperCupUsage,
    coating: 'One Side LDPE',
    packingDetails: '25 Pieces per Sleeve',
    specifications: [
      spec('240 ML (8 OZ)', '278 GSM (260+18PE) + 248 GSM', '80 x 56 x 92 MM', '1000 pcs/carton'),
      spec('300 ML (10 OZ)', '298 GSM (280+18PE) + 248 GSM', '90 x 60 x 94 MM', '1000 pcs/carton'),
      spec('360 ML (12 OZ)', '298 GSM (280+18PE) + 248 GSM', '90 x 60 x 109 MM', '1000 pcs/carton'),
      spec('480 ML (16 OZ)', '324 GSM (300+24PE) + 248 GSM', '90 x 60 x 137 MM', '1000 pcs/carton'),
      spec('600 ML (20 OZ)', '324 GSM (300+24PE) + 248 GSM', '90 x 60 x 159 MM', '1000 pcs/carton')
    ]
  }),
  product({
    number: '04',
    title: 'Lockable Sipper Lid',
    slug: 'lockable-sipper-lid',
    category: 'Plastic Lids',
    shortDescription: 'Lockable sipper lids for coffee cups, tea cups, and takeaway beverages.',
    description:
      'Lockable sipper lids are practical accessories for hot beverage paper cups, supporting safer takeaway handling and clean drink presentation.',
    image: siteImages.products.lockableSipperLid,
    material: 'HIPS (High Impact Polystyrene)',
    printing: ['Not Applicable'],
    colours: ['Black', 'White'],
    usage: paperCupUsage,
    coating: 'Not Applicable',
    packingDetails: '50 Pieces per Sleeve',
    specifications: [
      spec('80 MM', '2.1-2.3 grams', 'For 240 ML and 250 ML cups', '1000 pcs/carton'),
      spec('90 MM', '2.5-2.7 grams', 'For 300 ML, 360 ML, 480 ML and 600 ML cups', '1000 pcs/carton')
    ],
    visual: 'Accessories',
    accent: '#0F2D52'
  }),
  product({
    number: '05',
    title: 'Bagasse Lid',
    slug: 'bagasse-lid',
    category: 'Eco Lids',
    shortDescription: 'Bagasse lids made from food-grade sugarcane fiber.',
    description:
      'Bagasse lids are eco-friendly sugarcane fiber lids for takeaway beverage cups and food-service packaging programs.',
    image: siteImages.products.bagasseLid,
    material: 'Food-grade bagasse (sugarcane fiber)',
    printing: ['Not Applicable'],
    colours: ['White'],
    usage: paperCupUsage,
    coating: 'PFAS-free water and oil resistant coating',
    packingDetails: '50 Pieces per Sleeve',
    specifications: [
      spec('80 MM', '-', 'For 240 ML and 250 ML cups', '1000 pcs/carton'),
      spec('90 MM', '-', 'For 300 ML, 360 ML, 480 ML and 600 ML cups', '1000 pcs/carton')
    ],
    visual: 'Eco Accessories',
    accent: '#76B82A'
  }),
  product({
    number: '06',
    title: 'Paper Container with Paper Lid',
    slug: 'paper-container-with-paper-lid',
    category: 'Food Containers',
    shortDescription: 'Paper containers with paper lids for soups, salads, noodles, rice, and takeaway food.',
    description:
      'Paper containers with paper lids are suitable for takeaway food, soups, salads, noodles, rice, curries, ice cream, and hot or cold food packaging.',
    image: siteImages.products.containerWithLid,
    material: 'Food-grade paper board',
    printing: ['Screen Printing', 'Offset Printing'],
    colours: ['Kraft', 'White', 'Custom Print'],
    usage: 'Takeaway food, soups, salads, noodles, rice, curries, ice cream, and hot/cold food packaging.',
    coating: 'One Side LDPE',
    packingDetails: '25 Pieces per Sleeve',
    specifications: [
      spec('250 ML (8 OZ)', 'White: 270 GSM (245+25PE)', '95 x 80 x 56 MM', '500 pcs/carton'),
      spec('300 ML (10 OZ)', 'White: 300 GSM (275+25PE) / Kraft: 275 GSM (250+25PE)', '110 x 92 x 47 MM', '500 pcs/carton'),
      spec('350 ML (12 OZ)', 'White: 300 GSM (275+25PE)', '98 x 80 x 70 MM', '500 pcs/carton'),
      spec('400 ML (14 OZ)', 'White: 300 GSM (275+25PE) / Kraft: 320 GSM (295+25PE)', '110 x 92 x 61 MM', '500 pcs/carton'),
      spec('500 ML (16 OZ)', 'White: 300 GSM (275+25PE) / Kraft: 320 GSM (295+25PE)', '110 x 90 x 82 MM', '500 pcs/carton'),
      spec('750 ML (26 OZ)', 'White: 330 GSM (305+25PE) / Kraft: 320 GSM (295+25PE)', '110 x 90 x 110 MM', '500 pcs/carton'),
      spec('1000 ML (32 OZ)', 'White: 330 GSM (305+25PE) / Kraft: 320 GSM (295+25PE)', '127 x 100 x 115 MM', '500 pcs/carton')
    ],
    visual: 'Food Containers'
  }),
  product({
    number: '07',
    title: 'Salad Bowl with PET Lid',
    slug: 'salad-bowl-with-pet-lid',
    category: 'Salad Bowls',
    shortDescription: 'Paper salad bowls with PET lids for salads, fruits, pasta, noodles, rice, and desserts.',
    description:
      'Paper salad bowls with PET lids are designed for salads, fruits, pasta, noodles, rice, desserts, and hot or cold takeaway food.',
    image: siteImages.products.saladBowlWithPetLid,
    material: 'Food-grade paper board',
    printing: ['Screen Printing', 'Offset Printing'],
    colours: ['Kraft', 'White', 'Custom Print'],
    usage: 'Salads, fruits, pasta, noodles, rice, desserts, and hot/cold food takeaway.',
    coating: 'One Side LDPE',
    packingDetails: '50 Pieces per Sleeve',
    specifications: [
      spec('500 ML (16 OZ)', '320 GSM (295+25PE)', '148 x 128 x 51 MM', '300 pcs/carton'),
      spec('750 ML (26 OZ)', '320 GSM (295+25PE)', '148 x 128 x 60 MM', '300 pcs/carton'),
      spec('1000 ML (32 OZ)', '320 GSM (295+25PE)', '148 x 128 x 80 MM', '300 pcs/carton')
    ],
    visual: 'Bowls'
  }),
  product({
    number: '08',
    title: 'Meal Box',
    slug: 'meal-box',
    category: 'Meal Boxes',
    shortDescription: 'Paper meal boxes for meals, rice, biryani, noodles, burgers, snacks, and takeaway packaging.',
    description:
      'Paper meal boxes are made for meals, rice, biryani, noodles, burgers, snacks, fast food, and takeaway packaging.',
    image: siteImages.products.mealBox,
    material: 'Food-grade paper board',
    printing: ['Offset Printing'],
    colours: ['Kraft', 'White', 'Custom Print'],
    usage: 'Meals, rice, biryani, noodles, burgers, snacks, fast food, and takeaway packaging.',
    coating: 'One Side LDPE',
    packingDetails: '100 Pieces per Sleeve',
    specifications: [
      spec('500 ML (16 OZ)', 'White: 300 GSM (275+25PE) / Kraft: 320 GSM (295+25PE)', 'Top 104 x 140 MM / Bottom 90 x 130 MM / Height 40 MM', '500 pcs/carton'),
      spec('750 ML (26 OZ)', 'White: 300 GSM (275+25PE) / Kraft: 320 GSM (295+25PE)', 'Top 114 x 165 MM / Bottom 100 x 150 MM / Height 45 MM', '500 pcs/carton'),
      spec('1000 ML (32 OZ)', 'White: 300 GSM (275+25PE) / Kraft: 320 GSM (295+25PE)', 'Top 140 x 200 MM / Bottom 119 x 180 MM / Height 50 MM', '500 pcs/carton')
    ],
    visual: 'Meal Packaging'
  }),
  product({
    number: '09',
    title: 'Paper Food Box',
    slug: 'paper-food-box',
    category: 'Food Boxes',
    shortDescription: 'Paper food boxes for burgers, fries, sandwiches, snacks, bakery items, and takeaway packaging.',
    description:
      'Paper food boxes are made for burgers, fries, sandwiches, snacks, fast food, bakery items, and takeaway packaging.',
    image: siteImages.products.paperFoodBox,
    material: 'Food-grade paper board',
    printing: ['Not Applicable'],
    colours: ['Kraft'],
    usage: 'Burgers, fries, sandwiches, snacks, fast food, bakery items, and takeaway packaging.',
    coating: 'One Side LDPE',
    packingDetails: '50 Pieces per Sleeve',
    specifications: [
      spec('750 ML (26 OZ)', '300 GSM (280+20PE)', 'Top 132 x 104 MM / Bottom 112 x 90 MM / Height 64 MM', '450 pcs/carton'),
      spec('1350 ML (46 OZ)', '300 GSM (280+20PE)', 'Top 175 x 140 MM / Bottom 150 x 120 MM / Height 63 MM', '300 pcs/carton'),
      spec('1500 ML (51 OZ)', '300 GSM (280+20PE)', 'Top 215 x 155 MM / Bottom 195 x 140 MM / Height 47 MM', '200 pcs/carton'),
      spec('2000 ML (69 OZ)', '300 GSM (280+20PE)', 'Top 215 x 160 MM / Bottom 195 x 140 MM / Height 65 MM', '200 pcs/carton')
    ],
    visual: 'Food Boxes'
  }),
  product({
    number: '10',
    title: 'Tea Flask',
    slug: 'tea-flask',
    category: 'Tea Flasks',
    shortDescription: 'Tea flasks for tea, coffee, milk, juice, water, and hot or cold beverage service.',
    description:
      'Tea flasks support cafes, restaurants, catering, and takeaway beverage service for tea, coffee, milk, juices, water, and other hot or cold beverages.',
    image: siteImages.products.teaFlask,
    material: 'Recycle paper board',
    printing: ['Screen Printing', 'Offset Printing'],
    colours: ['Kraft', 'White', 'Custom Print'],
    usage: 'Tea, coffee, milk, juices, water, and other hot/cold beverages for cafes, restaurants, catering, and takeaway services.',
    coating: 'Not Applicable',
    packingDetails: '50 Pieces per Sleeve',
    specifications: [
      spec('250 ML (8 OZ)', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '58 x 122 x 200 MM', '500 pcs/carton'),
      spec('500 ML (16 OZ)', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '58 x 130 x 230 MM', '500 pcs/carton'),
      spec('1000 ML (32 OZ)', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '58 x 140 x 285 MM', '500 pcs/carton')
    ],
    visual: 'Beverage Packaging'
  }),
  product({
    number: '11',
    title: 'Silver/Transparent Spout Pouch',
    slug: 'silver-transparent-spout-pouch',
    category: 'Spout Pouches',
    shortDescription: 'Silver and transparent spout pouches for liquid food and beverage packaging.',
    description:
      'Silver and transparent spout pouches are suitable for juices, beverages, sauces, edible oil, dairy products, liquid foods, and other food packaging.',
    image: siteImages.products.silverTransparentSpoutPouch,
    material: 'Poly (micron poly)',
    printing: ['Printing Available'],
    colours: ['Silver', 'Transparent', 'Custom Print'],
    usage: 'Juices, beverages, sauces, edible oil, dairy products, liquid foods, and other food packaging.',
    features: ['100% Recyclable', 'Center Spout', 'Side Spout'],
    coating: 'Food-grade barrier lamination',
    packingDetails: '2000 Pieces per Box',
    specifications: [
      spec('100 ML (3.5 OZ)', '12+12+90 Poly', '90 x 140 x 70 MM', '2000 pcs/box'),
      spec('200 ML (7 OZ)', '12+12+90 Poly', '110 x 170 x 70 MM', '2000 pcs/box'),
      spec('500 ML (16 OZ)', '12+12+100 Poly', '130 x 210 x 80 MM', '2000 pcs/box'),
      spec('1000 ML (32 OZ)', '12+12+100 Poly', '160 x 255 x 90 MM', '2000 pcs/box')
    ],
    visual: 'Flexible Packaging',
    accent: '#0F2D52'
  }),
  product({
    number: '12',
    title: 'Pizza Box',
    slug: 'pizza-box',
    category: 'Pizza Boxes',
    shortDescription: 'Pizza boxes for pizza, garlic bread, calzone, and takeaway food packaging.',
    description:
      'Pizza boxes are made for pizza, garlic bread, calzone, and takeaway food packaging with kraft, white, and custom print options.',
    image: siteImages.products.pizzaBox,
    material: 'Recycle paper board',
    printing: ['Screen Printing', 'Offset Printing'],
    colours: ['Kraft', 'White', 'Custom Print'],
    usage: 'Pizza, garlic bread, calzone, and takeaway food packaging.',
    coating: 'Not Applicable',
    packingDetails: '50 Pieces per Sleeve',
    specifications: [
      spec('7 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '7 x 7 x 1.5 INCH', '50 pcs/sleeve'),
      spec('8 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '8 x 8 x 1.5 INCH', '50 pcs/sleeve'),
      spec('9 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '9 x 9 x 1.5 INCH', '50 pcs/sleeve'),
      spec('10 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '10 x 10 x 1.5 INCH', '50 pcs/sleeve'),
      spec('11 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '11 x 11 x 1.5 INCH', '50 pcs/sleeve'),
      spec('12 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '12 x 12 x 1.75 INCH', '50 pcs/sleeve'),
      spec('13 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '13 x 13 x 1.75 INCH', '50 pcs/sleeve'),
      spec('14 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '14 x 14 x 1.75 INCH', '50 pcs/sleeve'),
      spec('15 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '15 x 15 x 1.75 INCH', '50 pcs/sleeve'),
      spec('16 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '16 x 16 x 1.75 INCH', '50 pcs/sleeve'),
      spec('17 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '17 x 17 x 1.75 INCH', '50 pcs/sleeve'),
      spec('18 INCH', 'Kraft: 180+150+150 GSM / White: 230+150+150 GSM', '18 x 18 x 1.75 INCH', '50 pcs/sleeve')
    ],
    visual: 'Pizza Packaging',
    accent: '#C9A227'
  }),
  product({
    number: '13',
    title: 'ALU. POUCH',
    slug: 'alu-pouch',
    category: 'Spout Pouches',
    shortDescription: 'Aluminum foil laminated spout pouches for export-ready liquid food packaging.',
    description:
      'Aluminum foil laminated spout pouches are built for juices, beverages, sauces, edible oil, dairy products, liquid foods, and high-barrier food packaging.',
    image: siteImages.products.aluPouch,
    material: 'PET + MET PET + Aluminum Foil + LDPE',
    printing: ['Printing Available'],
    colours: ['Aluminum Foil', 'Custom Print'],
    usage: 'Juices, beverages, sauces, edible oil, dairy products, liquid foods, and other food packaging.',
    features: ['100% Recyclable', 'Side Spout', 'High Barrier Lamination'],
    coating: 'Food-grade barrier lamination',
    packingDetails: '1000 Pieces per Box',
    specifications: [
      spec('250 ML (8 OZ)', '12+12+9+100 LDPE', '90 x 140 x 70 MM', '1000 pcs/box'),
      spec('500 ML (16 OZ)', '12+12+9+100 LDPE', '130 x 210 x 80 MM', '1000 pcs/box'),
      spec('1000 ML (32 OZ)', '12+12+9+100 LDPE', '160 x 255 x 90 MM', '1000 pcs/box')
    ],
    visual: 'Flexible Packaging',
    accent: '#24748D'
  })
];

export const getProductBySlug = (slug) => productCatalog.find((productItem) => productItem.slug === slug);
