import { siteImages } from './siteImages.js';

export const aboutData = {
  hero: {
    titleLines: ['THINK GREEN', 'PACK SMART'],
    subtitle: 'Kelvin Eco Products is shaping sustainable packaging for businesses worldwide.',
    cupImage: siteImages.home.aboutGlass
  },
  journey: {
    title: 'Our journey is built layer by layer.',
    description: 'From the first paper cup idea to export-ready packaging, Kelvin grew step by step with cleaner materials, stronger production, and buyer-focused supply.',
    cupImage: siteImages.products.rippleWallPaperCup,
    years: [
      { year: '2021', title: 'Idea formed', copy: 'A focused plan to make food packaging cleaner, stronger, and more dependable.' },
      { year: '2022', title: 'Kelvin began', copy: 'Manufacturing started with paper cups and core disposable packaging formats.' },
      { year: '2023', title: 'Range expanded', copy: 'Bowls, boxes, containers, tea flasks, lids, pouches, and printed formats joined the catalogue.' },
      { year: '2024', title: 'Customization grew', copy: 'Private-label printing and bulk buyer support became central to the Kelvin promise.' },
      { year: '2025', title: 'Export ready', copy: 'The brand matured into a B2B packaging partner for restaurants, distributors, and importers.' }
    ]
  },
  whoWeAre: {
    eyebrow: 'Who We Are',
    title: 'Sustainable Packaging Solutions Built for Quality, Innovation & Global Business',
    copy:
      'We manufacture premium eco-friendly food packaging that combines exceptional quality, modern design, and sustainable practices. From restaurants and cafes to distributors and export partners, our packaging solutions are designed to protect your products, strengthen your brand, and support long-term business growth.',
    image: siteImages.home.heroPackaging,
    cards: [
      {
        icon: 'quality',
        title: 'Premium Quality Standards',
        text: 'We use high-quality, food-grade raw materials to manufacture durable, leak-resistant, and hygienic packaging with excellent finishing for every application.'
      },
      {
        icon: 'eco',
        title: 'Eco-Friendly Solutions',
        text: 'Our sustainable packaging helps businesses reduce environmental impact while maintaining product safety, quality, and performance.'
      },
      {
        icon: 'range',
        title: 'Complete Packaging Range',
        text: 'From paper cups and salad bowls to meal boxes, pizza boxes, tea flasks, containers, lids, and customized packaging, we provide everything under one roof.'
      },
      {
        icon: 'branding',
        title: 'Custom Branding',
        text: 'Enhance your brand identity with custom sizes, unique designs, and high-quality logo printing tailored to your business needs.'
      },
      {
        icon: 'pricing',
        title: 'Competitive Pricing',
        text: 'Enjoy premium-quality packaging at cost-effective prices, making sustainable solutions accessible for businesses of every size.'
      },
      {
        icon: 'delivery',
        title: 'Reliable Delivery',
        text: 'Our efficient production and logistics ensure timely delivery, responsive support, and a smooth customer experience from inquiry to shipment.'
      },
      {
        icon: 'innovation',
        title: 'Modern Innovation',
        text: 'Every product is designed with contemporary aesthetics, practical functionality, and evolving market trends in mind.'
      }
    ],
    stats: [
      { value: '5+', label: 'Years Experience' },
      { value: '20K+', label: 'Happy Clients' },
      { value: '50+', label: 'Export Destinations' },
      { value: '100%', label: 'Food-Grade Materials' }
    ],
    points: ['Manufacturer and exporter', 'Food-grade packaging focus', 'Custom print support', 'Bulk order planning']
  },
  factory: {
    eyebrow: 'Factory capability',
    title: 'Manufacturing made for repeat B2B supply.',
    video: '',
    poster: siteImages.home.factory,
    stats: [
      { value: '5000+', label: 'orders supported' },
      { value: '59+', label: 'countries reached' }
    ]
  },
  productsStory: {
    title: 'From one cup to a complete packaging ecosystem.',
    centerImage: siteImages.products.doubleWallPaperCup,
    products: [
      { title: 'Paper Cups', image: siteImages.products.paperCups },
      { title: 'Bowls', image: siteImages.products.saladBowlWithPetLid },
      { title: 'Boxes', image: siteImages.products.mealBox },
      { title: 'Containers', image: siteImages.products.containerWithLid },
      { title: 'Pouches', image: siteImages.products.silverTransparentSpoutPouch },
      { title: 'Bags', image: siteImages.customization.bigContainerDesign }
    ]
  },
  process: {
    title: 'How packaging is made',
    steps: [
      { step: 'Step 1', title: 'Paper sourcing', copy: 'Selected paper board and sustainable material direction for food service use.' },
      { step: 'Step 2', title: 'Food grade coating', copy: 'Functional coating and finishing choices for practical serving and carrying.' },
      { step: 'Step 3', title: 'Printing', copy: 'Brand-ready visual treatment for private-label and custom packaging programs.' },
      { step: 'Step 4', title: 'Packing', copy: 'Order-wise packing support for distributors, importers, and restaurants.' },
      { step: 'Step 5', title: 'Export', copy: 'Buyer communication, repeat supply support, and dispatch readiness.' }
    ]
  },
  exportMap: {
    title: 'Built in India. Moving across food markets.',
    countries: [
      { name: 'UAE', flag: 'https://flagcdn.com/w80/ae.png', x: '58%', y: '48%' },
      { name: 'Qatar', flag: 'https://flagcdn.com/w80/qa.png', x: '55%', y: '51%' },
      { name: 'Canada', flag: 'https://flagcdn.com/w80/ca.png', x: '22%', y: '28%' },
      { name: 'UK', flag: 'https://flagcdn.com/w80/gb.png', x: '45%', y: '30%' },
      { name: 'Australia', flag: 'https://flagcdn.com/w80/au.png', x: '78%', y: '72%' },
      { name: 'South Africa', flag: 'https://flagcdn.com/w80/za.png', x: '52%', y: '76%' }
    ]
  },
  trust: {
    title: 'Why buyers trust Kelvin',
    cards: [
      { title: 'ISO direction', copy: 'Quality systems designed for serious B2B supply.' },
      { title: 'Food Grade', copy: 'Packaging formats made for real food service conditions.' },
      { title: 'Export Ready', copy: 'International buyer support with practical order communication.' },
      { title: 'Custom Printing', copy: 'Brand-first finishing for restaurants, cafes, and private labels.' },
      { title: 'Bulk Supply', copy: 'Repeat order planning for distributors and importers.' }
    ]
  },
  testimonials: [
    { quote: 'Kelvin gives us consistent packaging and clear communication for repeat orders.', name: 'Importer Partner', role: 'UAE' },
    { quote: 'The custom print quality helped our takeaway brand look much more premium.', name: 'Restaurant Buyer', role: 'India' },
    { quote: 'A practical range for distributors who need cups, bowls, boxes, and lids together.', name: 'Distribution Buyer', role: 'UK' }
  ],
  vision: {
    quote: 'We believe sustainable packaging should not compromise quality.',
    signature: 'Kelvin Eco Products'
  },
  cta: {
    title: 'Tell us what you want to pack next.',
    copy: 'Share product type, size, quantity, destination country, and printing needs. We will help you move from idea to quotation.',
    buttons: [
      { label: 'Request Quote', path: '/contact' },
      { label: 'Download Catalogue', path: '/catalogue.pdf', external: true },
      { label: 'Contact Sales', path: '/contact' }
    ]
  },
  floatingAssets: [
    { type: 'leaf', x: '9%', y: '18%', delay: '0s' },
    { type: 'tea', x: '88%', y: '22%', delay: '-2s' },
    { type: 'fiber', x: '74%', y: '68%', delay: '-3.5s' },
    { type: 'particle', x: '18%', y: '76%', delay: '-5s' }
  ]
};
