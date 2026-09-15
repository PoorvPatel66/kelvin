import bcrypt from 'bcryptjs';
import { BlogStatus, PageStatus, ProductStatus, Role } from '@prisma/client';
import { prisma } from '../src/config/prisma.js';

async function main() {
  const ownerName = process.env.OWNER_NAME?.trim();
  const ownerPassword = process.env.OWNER_PASSWORD;
  const ownerEmail = process.env.OWNER_ADMIN_EMAIL?.trim().toLowerCase();
  const ownerMobile = process.env.OWNER_MOBILE?.replace(/\D/g, '').slice(-10);

  if (!ownerName || !ownerPassword || !ownerEmail || !ownerMobile) {
    throw new Error('OWNER_NAME, OWNER_PASSWORD, OWNER_ADMIN_EMAIL, and OWNER_MOBILE are required to seed the owner admin.');
  }

  const existingOwner = await prisma.admin.findFirst({
    where: {
      OR: [{ email: ownerEmail }, { mobile: ownerMobile }]
    },
    select: { id: true }
  });
  const password = await bcrypt.hash(ownerPassword, 12);

  const admin = existingOwner
    ? await prisma.admin.update({
        where: { id: existingOwner.id },
        data: {
          name: ownerName,
          email: ownerEmail,
          mobile: ownerMobile,
          password,
          role: Role.SUPER_ADMIN,
          isActive: true
        }
      })
    : await prisma.admin.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          mobile: ownerMobile,
          password,
          role: Role.SUPER_ADMIN
        }
      });

  const categoryData = [
    {
      name: 'Paper Cups',
      slug: 'paper-cups',
      description: 'Single wall, ripple wall, and double wall paper cups for beverages.'
    },
    {
      name: 'Lids',
      slug: 'lids',
      description: 'Food-grade lids and accessories for cups, containers, and bowls.'
    },
    {
      name: 'Food Containers',
      slug: 'food-containers',
      description: 'Paper containers and bowls for takeaway, delivery, and food service.'
    },
    {
      name: 'Meal Packaging',
      slug: 'meal-packaging',
      description: 'Meal boxes and food boxes for restaurants, cloud kitchens, and catering.'
    },
    {
      name: 'Pizza Packaging',
      slug: 'pizza-packaging',
      description: 'Pizza boxes built for delivery, freshness, and branded presentation.'
    },
    {
      name: 'Beverage Packaging',
      slug: 'beverage-packaging',
      description: 'Tea flasks and beverage packaging for hot and cold service.'
    },
    {
      name: 'Pouches',
      slug: 'pouches',
      description: 'Spout pouches and aluminium pouch packaging for liquid and dry products.'
    },
    {
      name: 'Custom Printing',
      slug: 'custom-printing',
      description: 'Private label, logo printing, and branded packaging solutions.'
    }
  ];

  const categories = {};

  for (const category of categoryData) {
    categories[category.slug] = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
  }

  const productData = [
    {
      name: 'Single Wall Paper Cup',
      slug: 'single-wall-paper-cup',
      description:
        'Premium food-grade single wall paper cups suitable for hot and cold beverages, cafes, distributors, and export buyers.',
      shortDescription: 'Food-grade single wall cups for hot and cold beverages.',
      moq: 'Bulk order support',
      material: 'Food-grade paper board',
      sizes: ['120 ml', '150 ml', '180 ml', '210 ml', '240 ml', '300 ml', '360 ml', '480 ml', '600 ml'],
      capacity: '120 ml to 600 ml',
      usage: 'Hot and cold beverages, cafes, tea shops, coffee chains, juice counters, takeaway service',
      featured: true,
      categoryId: categories['paper-cups'].id,
      specifications: {
        colours: ['White', 'Kraft', 'Custom Print'],
        printing: ['Screen Printing', 'Offset Printing'],
        coating: 'One side LDPE',
        packing: '1000 pcs/carton'
      }
    },
    {
      name: 'Ripple Wall Paper Cup',
      slug: 'ripple-wall-paper-cup',
      description: 'Ripple wall paper cups for premium hot beverage insulation and a better grip.',
      shortDescription: 'Ripple wall cups for hot drinks and branded beverage packaging.',
      moq: 'Bulk order support',
      material: 'Food-grade ripple paper',
      sizes: ['240 ml', '300 ml', '360 ml'],
      capacity: '240 ml to 360 ml',
      usage: 'Coffee, tea, hot chocolate, cafes, takeaway beverage service',
      featured: true,
      categoryId: categories['paper-cups'].id,
      specifications: {
        colours: ['Kraft', 'White', 'Custom Print'],
        printing: 'Custom logo and branding available',
        packing: 'Export-ready carton packing'
      }
    },
    {
      name: 'Double Wall Paper Cup',
      slug: 'double-wall-paper-cup',
      description: 'Double wall paper cups designed for premium insulation and branded hot beverage service.',
      shortDescription: 'Insulated double wall paper cups for premium beverage brands.',
      moq: 'Bulk order support',
      material: 'Food-grade double wall paper',
      sizes: ['240 ml', '300 ml', '360 ml'],
      capacity: '240 ml to 360 ml',
      usage: 'Hot beverages, coffee chains, premium cafes, takeaway counters',
      featured: true,
      categoryId: categories['paper-cups'].id,
      specifications: {
        colours: ['White', 'Kraft', 'Custom Print'],
        printing: 'Single colour and multi-colour printing options',
        packing: 'Export-ready carton packing'
      }
    },
    {
      name: 'Lockable Sipper Lid',
      slug: 'lockable-sipper-lid',
      description: 'Food-grade lockable sipper lids for safe takeaway handling and clean beverage presentation.',
      shortDescription: 'Lockable lids for coffee cups, tea cups, and takeaway beverages.',
      moq: 'Bulk order support',
      material: 'Food-grade plastic',
      sizes: ['80 mm', '90 mm'],
      capacity: 'Cup lid accessory',
      usage: 'Coffee cups, tea cups, takeaway beverages',
      featured: false,
      categoryId: categories['lids'].id,
      specifications: {
        colours: ['Black', 'White'],
        packing: '1000 pcs/box'
      }
    },
    {
      name: 'Bagasse Lid',
      slug: 'bagasse-lid',
      description: 'Eco-friendly bagasse lids made for paper containers, bowls, and sustainable takeaway packaging.',
      shortDescription: 'Bagasse lids for sustainable food packaging.',
      moq: 'Bulk order support',
      material: 'Bagasse fiber',
      sizes: ['Multiple sizes available'],
      capacity: 'Container and bowl lid accessory',
      usage: 'Takeaway meals, bowls, containers, restaurants',
      featured: false,
      categoryId: categories['lids'].id,
      specifications: {
        finish: 'Natural molded fiber',
        packing: 'Bulk carton packing'
      }
    },
    {
      name: 'Paper Container with Paper Lid',
      slug: 'paper-container-with-paper-lid',
      description: 'Paper containers with paper lids for takeaway, food delivery, and export-ready food service supply.',
      shortDescription: 'Paper containers with matching paper lid options.',
      moq: 'Bulk order support',
      material: 'Kraft and white paper board',
      sizes: ['250 ml', '500 ml', '750 ml', '1000 ml', '1250 ml'],
      capacity: '250 ml to 1250 ml',
      usage: 'Rice, noodles, snacks, meals, takeaway food',
      featured: true,
      categoryId: categories['food-containers'].id,
      specifications: {
        colours: ['Kraft', 'White', 'Custom Print'],
        lid: 'Paper lid available',
        packing: 'Export carton packing'
      }
    },
    {
      name: 'Salad Bowl with PET Lid',
      slug: 'salad-bowl-with-pet-lid',
      description: 'Premium salad bowls with transparent PET lids for fresh food, salads, bowls, and takeaway meals.',
      shortDescription: 'Salad bowls with PET lid for fresh food presentation.',
      moq: 'Bulk order support',
      material: 'Food-grade paper bowl with PET lid',
      sizes: ['500 ml', '750 ml', '1000 ml'],
      capacity: '500 ml to 1000 ml',
      usage: 'Salads, pasta, bowls, fresh meals, takeaway food',
      featured: true,
      categoryId: categories['food-containers'].id,
      specifications: {
        colours: ['Kraft', 'White', 'Custom Print'],
        lid: 'Transparent PET lid',
        packing: 'Bulk carton packing'
      }
    },
    {
      name: 'Meal Box',
      slug: 'meal-box',
      description: 'Meal boxes for restaurants, cloud kitchens, delivery brands, catering, and takeaway food packaging.',
      shortDescription: 'Leak-resistant meal boxes for takeaway and delivery.',
      moq: 'Bulk order support',
      material: 'Food-grade paper board',
      sizes: ['750 ml', '1350 ml', '1500 ml', '2000 ml'],
      capacity: '750 ml to 2000 ml',
      usage: 'Meals, takeaway, catering, cloud kitchen, delivery packaging',
      featured: true,
      categoryId: categories['meal-packaging'].id,
      specifications: {
        printing: 'Plain, single colour, multi-colour, and custom printing',
        packing: 'Export-ready carton packing'
      }
    },
    {
      name: 'Paper Food Box',
      slug: 'paper-food-box',
      description: 'Paper food boxes for snacks, meals, delivery, and restaurant takeaway packaging.',
      shortDescription: 'Food boxes for snacks, meals, and takeaway service.',
      moq: 'Bulk order support',
      material: 'Food-grade paper board',
      sizes: ['Multiple sizes available'],
      capacity: 'Custom capacity options',
      usage: 'Snacks, rice, noodles, meals, street food, takeaway food',
      featured: false,
      categoryId: categories['meal-packaging'].id,
      specifications: {
        colours: ['Kraft', 'White', 'Custom Print'],
        printing: 'Logo printing available',
        packing: 'Bulk carton packing'
      }
    },
    {
      name: 'Tea Flask',
      slug: 'tea-flask',
      description: 'Paper tea flasks for hot tea, coffee, and beverage delivery with reliable thermal performance.',
      shortDescription: 'Paper tea and coffee flasks for hot drink service.',
      moq: 'Bulk order support',
      material: 'Food-grade paper board',
      sizes: ['250 ml', '500 ml', '750 ml', '1000 ml'],
      capacity: '250 ml to 1000 ml',
      usage: 'Tea delivery, coffee delivery, catering, beverage service',
      featured: false,
      categoryId: categories['beverage-packaging'].id,
      specifications: {
        colours: ['Kraft', 'White', 'Custom Print'],
        printing: 'Logo and brand printing available',
        packing: 'Bulk carton packing'
      }
    },
    {
      name: 'Silver/Transparent Spout Pouch',
      slug: 'silver-transparent-spout-pouch',
      description: 'Silver and transparent spout pouches for liquids, beverages, sauces, and flexible packaging needs.',
      shortDescription: 'Flexible spout pouches in silver and transparent finishes.',
      moq: 'Bulk order support',
      material: 'Food-grade laminated pouch material',
      sizes: ['Custom sizes available'],
      capacity: 'Custom capacity options',
      usage: 'Liquids, sauces, beverages, semi-liquid products',
      featured: false,
      categoryId: categories['pouches'].id,
      specifications: {
        colours: ['Silver', 'Transparent'],
        printing: 'Custom branding available',
        closure: 'Spout cap'
      }
    },
    {
      name: 'Pizza Box',
      slug: 'pizza-box',
      description: 'Pizza boxes for delivery, restaurants, and branded food packaging with durable corrugated options.',
      shortDescription: 'Plain, printed, and corrugated pizza boxes for food businesses.',
      moq: 'Bulk order support',
      material: 'Corrugated paper board',
      sizes: ['6 inch', '7 inch', '8 inch', '9 inch', '10 inch', '12 inch', '14 inch', '16 inch'],
      capacity: '6 inch to 16 inch',
      usage: 'Pizza delivery, restaurants, takeaway food',
      featured: true,
      categoryId: categories['pizza-packaging'].id,
      specifications: {
        colours: ['Kraft', 'White', 'Custom Print'],
        printing: 'Plain, printed, and corrugated options',
        packing: 'Bulk carton packing'
      }
    },
    {
      name: 'ALU. POUCH',
      slug: 'alu-pouch',
      description: 'Aluminium pouch packaging for products requiring durable barrier protection and premium presentation.',
      shortDescription: 'Aluminium pouch packaging for flexible branded supply.',
      moq: 'Bulk order support',
      material: 'Food-grade aluminium laminated material',
      sizes: ['Custom sizes available'],
      capacity: 'Custom capacity options',
      usage: 'Dry products, powders, liquids, sauces, and private-label packaging',
      featured: false,
      categoryId: categories['pouches'].id,
      specifications: {
        colours: ['Silver', 'Custom Print'],
        printing: 'Custom artwork and logo printing available',
        packing: 'Bulk carton packing'
      }
    }
  ];

  for (const product of productData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: {
        ...product,
        status: ProductStatus.ACTIVE
      }
    });
  }

  const pageData = [
    {
      title: 'Home',
      slug: 'home',
      pageKey: 'home',
      excerpt: 'Premium eco-friendly packaging solutions for global food businesses.',
      content: 'Think Green. Pack Smart. Kelvin Eco Products manufactures sustainable food packaging for B2B buyers.',
        sections: {
          hero: {
            eyebrow: 'Eco Packaging Manufacturer',
            heading: 'THINK GREEN',
            accent: 'PACK SMART',
            description: 'Premium Eco-Friendly Packaging Solutions For Global Businesses.'
          },
          products: 'Sustainable packaging for every need',
          export: 'Built with a global export outlook'
      },
      seoTitle: 'Kelvin Eco Products | Eco-Friendly Packaging Manufacturer',
      seoDescription: 'Kelvin Eco Products manufactures paper cups, food boxes, salad bowls, pizza boxes, lids, pouches, and custom printed packaging.',
      status: PageStatus.PUBLISHED
    },
    {
      title: 'About Us',
      slug: 'about',
      pageKey: 'about',
      excerpt: 'Learn about Kelvin Eco Products, our quality focus, and sustainable packaging values.',
      content: 'Kelvin Eco Products supplies paper cups, containers, meal boxes, tea flasks, lids, pouches, and custom printed packaging.',
        sections: {
          hero: {
            eyebrow: '01 / About Kelvin Eco Products',
            heading: 'Packaging with',
            accent: 'Purpose.',
            description: 'Creating reliable, sustainable, and thoughtfully designed packaging solutions for businesses that care about quality, performance, and the planet.'
          },
          whoWeAre: {
            heading: 'Packaging Built for Modern Businesses.',
            description: 'Kelvin Eco Products is a B2B eco-friendly packaging manufacturer focused on helping restaurants, cafes, coffee chains, distributors, importers, and food brands package products with confidence.'
          },
          whyChoose: ['Premium quality standards', 'Eco-friendly solutions', 'Reliable delivery']
      },
      seoTitle: 'About Kelvin Eco Products',
      seoDescription: 'Kelvin Eco Products is a B2B eco-friendly packaging manufacturer serving restaurants, distributors, importers, and food brands.',
      status: PageStatus.PUBLISHED
    },
    {
      title: 'Products',
      slug: 'products',
      pageKey: 'products',
      excerpt: 'Explore Kelvin Eco Products packaging categories and product specifications.',
      content: 'Browse paper cups, lids, paper containers, salad bowls, meal boxes, food boxes, pizza boxes, tea flasks, pouches, and ALU. pouch.',
        sections: {
          hero: {
            eyebrow: 'Eco Packaging Catalogue',
            heading: 'Product range built for',
            accent: 'modern food businesses.',
            description: 'Explore paper cups, containers, bowls, boxes, lids, flasks, pouches, and export-ready food packaging made for B2B buyers.'
          },
          categories: productData.map((product) => product.name)
      },
      seoTitle: 'Eco-Friendly Food Packaging Products',
      seoDescription: 'Explore paper cups, food containers, salad bowls, meal boxes, pizza boxes, tea flasks, lids, pouches, and custom packaging.',
      status: PageStatus.PUBLISHED
    },
    {
      title: 'Customize Packaging',
      slug: 'customize',
      pageKey: 'customize',
      excerpt: 'Custom printed packaging and branding solutions for food businesses.',
      content: 'Add logos, colors, sizes, and artwork across selected packaging products for stronger brand identity.',
        sections: {
          hero: {
            eyebrow: 'Custom Packaging',
            heading: 'Make your packaging uniquely yours.',
            description: 'Add logos, colors, sizes, and artwork across selected packaging products for stronger brand identity.'
          },
          options: ['Logo printing', 'Custom artwork', 'Private branding', 'Bulk supply'],
          customization: {
            items: [
              { id: 'logo-printing', title: 'Logo Printing', text: 'Apply your brand logo across packaging formats.', image: '/images/customization/cup-design.png' },
              { id: 'double-wall', title: 'Double Wall Cup Design', text: 'Create premium printed beverage cups.', image: '/images/customization/double-wall-cup-design.png' },
              { id: 'kraft-container', title: 'Kraft Container Design', text: 'Customize kraft containers for food service.', image: '/images/customization/kraft-container-design.png' },
              { id: 'paper-lid', title: 'Paper Lid Container Design', text: 'Build matching printed container systems.', image: '/images/customization/paper-lid-container-design.png' },
              { id: 'meal-box', title: 'Meal Box Branding', text: 'Create branded meal box packaging.', image: '/images/customization/meal-box-design.png' },
              { id: 'pizza-box', title: 'Pizza Box Branding', text: 'Build pizza boxes with brand-focused presentation.', image: '/images/customization/pizza-box-design.png' },
              { id: 'tea-flask', title: 'Printed Tea Flasks', text: 'Customize beverage packaging for bulk supply.', image: '/images/customization/tea-flask-design.png' },
              { id: 'bulk-container', title: 'Bulk Container Branding', text: 'Develop branded packaging for high-volume operations.', image: '/images/customization/big-container-design.png' }
            ]
          }
      },
      seoTitle: 'Custom Printed Packaging for Food Brands',
      seoDescription: 'Create custom printed paper cups, boxes, bowls, containers, and packaging with Kelvin Eco Products.',
      status: PageStatus.PUBLISHED
    },
    {
      title: 'Quality',
      slug: 'quality',
      pageKey: 'quality',
      excerpt: 'Quality, food-grade materials, and reliable packaging performance.',
      content: 'Our focus is premium material selection, clean finishing, food-grade safety, and dependable bulk supply.',
        sections: {
          hero: {
            eyebrow: 'Quality And Reliability',
            heading: 'Packaging quality that supports real food business operations.',
            description: 'Our quality approach is built around consistency, communication, and practical food-service requirements.'
          },
          pillars: ['Food-grade materials', 'Clean finishing', 'Export-ready packing', 'Customer support']
      },
      seoTitle: 'Packaging Quality Standards',
      seoDescription: 'Kelvin Eco Products focuses on food-grade materials, quality finishing, and reliable eco-friendly packaging supply.',
      status: PageStatus.PUBLISHED
    },
    {
      title: 'Blog',
      slug: 'blog',
      pageKey: 'blog',
      excerpt: 'Packaging insights for food businesses, restaurants, distributors, and export buyers.',
      content: 'Read articles about sustainable packaging, paper cups, custom printing, manufacturing, export, and packaging trends.',
        sections: {
          hero: {
            eyebrow: 'Kelvin Eco Products Blog',
            heading: 'Packaging insights for growing food businesses.',
            description: 'Practical articles on eco-friendly packaging, paper cups, custom printing, export supply, and better packaging choices for B2B buyers.'
          },
          categories: ['Sustainable Packaging', 'Paper Cups', 'Food Containers', 'Custom Printing', 'Manufacturing', 'Export & Wholesale']
      },
      seoTitle: 'Eco Packaging Blog',
      seoDescription: 'Read Kelvin Eco Products blog articles about eco-friendly packaging, paper cups, food containers, custom printing, and export supply.',
      status: PageStatus.PUBLISHED
    },
    {
      title: 'Contact Us',
      slug: 'contact',
      pageKey: 'contact',
      excerpt: 'Contact Kelvin Eco Products for quotes, product inquiries, and packaging support.',
      content: 'Reach Kelvin Eco Products by phone, email, WhatsApp, or contact form for packaging requirements.',
        sections: {
          hero: {
            eyebrow: "We're Here to Help",
            heading: 'Contact',
            accent: 'Us',
            description: 'Have a question, need a quote, or want to know more about our eco-friendly packaging solutions? Our team is ready to assist you.'
          },
          email: 'kelvinecoproducts@gmail.com',
        alternateEmail: 'info@kelvinecoproducts.in',
        phone: '+91 9687 503514'
      },
      seoTitle: 'Contact Kelvin Eco Products',
      seoDescription: 'Contact Kelvin Eco Products for eco-friendly packaging products, custom printing, bulk orders, and export-ready packaging supply.',
      status: PageStatus.PUBLISHED
    }
  ];

  for (const page of pageData) {
    await prisma.websitePage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page
    });
  }

  await prisma.siteSetting.upsert({
    where: { id: 'primary' },
    update: {},
    create: {
      id: 'primary',
      siteName: 'Kelvin Eco Products',
      tagline: 'Think Green. Pack Smart.',
      footerDescription: 'Kelvin Eco Products is a leading manufacturer of premium eco-friendly packaging solutions. We serve businesses worldwide with sustainable and innovative packaging.',
      primaryPhone: '+91 9687 503514',
      alternatePhone: '+91 7048 503513',
      primaryEmail: 'info@kelvinecoproducts.in',
      alternateEmail: 'kelvinecoproducts@gmail.com',
      websiteUrl: 'https://kelvinecoproducts.in',
      whatsappNumber: '919687503514',
      headOffice: '105, Maruti Arcade-1, Shivam International Zone-1, Kalavad Road, Chhapra, Rajkot - 360021, Gujarat, India',
      corporateOffice: '71-75 Shelton Street, Covent Garden, London, United Kingdom, WC2H 9JQ',
      businessHours: '9:00 AM - 6:00 PM',
      socialLinks: {
        facebook: 'https://facebook.com/kelvinecoproducts',
        instagram: 'https://instagram.com/kelvinecoproducts',
        linkedin: 'https://linkedin.com/company/kelvinecoproducts',
        youtube: 'https://youtube.com/@kelvinecoproducts',
        twitter: 'https://x.com/kelvinecoproducts'
      }
    }
  });

  const navigationItems = [
    ['HOME', '/', 'HEADER', 10, false], ['ABOUT', '/about', 'HEADER', 20, false],
    ['PRODUCTS', '/products', 'HEADER', 30, false], ['BLOG', '/blog', 'HEADER', 40, false],
    ['CONTACT', '/contact', 'HEADER', 50, false],
    ['Products', '/products', 'FOOTER_QUICK', 10, false], ['Request Quote', '/request-quote', 'FOOTER_QUICK', 20, false],
    ['About Us', '/about', 'FOOTER_QUICK', 30, false], ['Blog', '/blog', 'FOOTER_QUICK', 40, false],
    ['Contact Us', '/contact', 'FOOTER_QUICK', 50, false],
    ['Terms & Conditions', 'https://kelvinecoproducts.com/terms-and-conditions', 'FOOTER_MORE', 10, true],
    ['Privacy Policy', 'https://kelvinecoproducts.com/privacy-policy', 'FOOTER_MORE', 20, true],
    ['FAQs', 'https://kelvinecoproducts.com/faqs', 'FOOTER_MORE', 30, true],
    ['Custom Printing', '/products', 'FOOTER_SERVICES', 10, false], ['Bulk Supply', '/contact', 'FOOTER_SERVICES', 20, false],
    ['Product Development', '/contact', 'FOOTER_SERVICES', 30, false], ['Export Solutions', '/#export', 'FOOTER_SERVICES', 40, false]
  ];

  for (const [label, path, area, sortOrder, isExternal] of navigationItems) {
    await prisma.navigationItem.upsert({
      where: { area_path: { area, path } },
      update: {},
      create: { label, path, area, sortOrder, isExternal }
    });
  }

  const testimonialData = [
    {
      name: 'Ahmed Al Mansoori',
      role: 'Importer, UAE',
      quote: 'Kelvin Eco Products has been our trusted partner for eco-friendly packaging. The quality and service are unmatched.',
      sortOrder: 10,
      featured: true
    },
    {
      name: 'Sarah Mitchell',
      role: 'Distributor, UK',
      quote: 'Excellent product quality, timely delivery, and professional support. Highly recommended for distributors.',
      sortOrder: 20,
      featured: true
    },
    {
      name: 'James Peterson',
      role: 'Restaurant Chain, Canada',
      quote: 'We love their sustainable approach and customized packaging solutions for our brand.',
      sortOrder: 30,
      featured: true
    }
  ];

  for (const testimonial of testimonialData) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: testimonial.name, quote: testimonial.quote }
    });
    if (!existing) await prisma.testimonial.create({ data: testimonial });
  }

  await prisma.product.updateMany({
    where: {
      slug: {
        in: ['paper-cups', 'paper-containers', 'salad-bowls', 'custom-printed-packaging']
      }
    },
    data: {
      status: ProductStatus.INACTIVE,
      isDeleted: true,
      deletedAt: new Date()
    }
  });

  await prisma.category.updateMany({
    where: {
      slug: {
        in: ['paper-packaging', 'custom-printed-packaging']
      }
    },
    data: {
      status: ProductStatus.INACTIVE,
      isDeleted: true,
      deletedAt: new Date()
    }
  });

  const sustainabilityCategory = await prisma.blogCategory.upsert({
    where: { slug: 'sustainability' },
    update: {
      name: 'Sustainability',
      description: 'Articles about eco-friendly packaging and responsible sourcing.',
      status: BlogStatus.PUBLISHED
    },
    create: {
      name: 'Sustainability',
      slug: 'sustainability',
      description: 'Articles about eco-friendly packaging and responsible sourcing.',
      status: BlogStatus.PUBLISHED
    }
  });

  const brandingCategory = await prisma.blogCategory.upsert({
    where: { slug: 'branding' },
    update: {
      name: 'Branding',
      description: 'Packaging branding, custom printing, and B2B marketing insights.',
      status: BlogStatus.PUBLISHED
    },
    create: {
      name: 'Branding',
      slug: 'branding',
      description: 'Packaging branding, custom printing, and B2B marketing insights.',
      status: BlogStatus.PUBLISHED
    }
  });

  const blogData = [
    {
      title: 'Why Eco-Friendly Food Packaging Matters',
      slug: 'why-eco-friendly-food-packaging-matters',
      excerpt: 'How sustainable packaging helps modern food brands build trust.',
      content:
        'Eco-friendly packaging supports better brand perception, cleaner operations, and long-term buyer confidence for food businesses.',
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      status: BlogStatus.PUBLISHED,
      published: true,
      publishedAt: new Date(),
      featured: true,
      tags: ['sustainability', 'food-packaging'],
      seoTitle: 'Why Eco-Friendly Food Packaging Matters',
      seoDescription: 'Learn why eco-friendly packaging matters for modern food brands.',
      categoryId: sustainabilityCategory.id,
      adminId: admin.id
    },
    {
      title: 'How Custom Printed Packaging Helps Food Brands',
      slug: 'custom-printed-packaging-food-brands',
      excerpt: 'Custom printed cups and boxes create stronger brand recall.',
      content:
        'Custom printing turns everyday packaging into a practical brand asset for restaurants, cafes, distributors, and importers.',
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      status: BlogStatus.PUBLISHED,
      published: true,
      publishedAt: new Date(),
      featured: false,
      tags: ['custom-printing', 'branding'],
      seoTitle: 'How Custom Printed Packaging Helps Food Brands',
      seoDescription: 'See how custom printed packaging improves food brand recall.',
      categoryId: brandingCategory.id,
      adminId: admin.id
    }
  ];

  for (const blog of blogData) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog
    });
  }

  const exportCountries = [
    { countryName: 'United Arab Emirates', flagUrl: 'https://flagcdn.com/w80/ae.png' },
    { countryName: 'Saudi Arabia', flagUrl: 'https://flagcdn.com/w80/sa.png' },
    { countryName: 'Oman', flagUrl: 'https://flagcdn.com/w80/om.png' },
    { countryName: 'Qatar', flagUrl: 'https://flagcdn.com/w80/qa.png' },
    { countryName: 'United Kingdom', flagUrl: 'https://flagcdn.com/w80/gb.png' },
    { countryName: 'Canada', flagUrl: 'https://flagcdn.com/w80/ca.png' },
    { countryName: 'Australia', flagUrl: 'https://flagcdn.com/w80/au.png' },
    { countryName: 'South Africa', flagUrl: 'https://flagcdn.com/w80/za.png' },
    { countryName: 'United States', flagUrl: 'https://flagcdn.com/w80/us.png' }
  ];

  for (const country of exportCountries) {
    await prisma.exportCountry.upsert({
      where: { countryName: country.countryName },
      update: { flagUrl: country.flagUrl, status: 'ACTIVE' },
      create: country
    });
  }

  // Certifications must be backed by real company documents, so seed no claims.
  await prisma.certification.deleteMany({
    where: { title: { in: ['Food Grade Materials', 'Export Quality'] } }
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
