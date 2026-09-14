# Kelvin Image Upload Guide

Use this file when you want to add your real logo, product images, and homepage images.

## 1. Upload Image Files

Put your files inside:

```text
frontend/public/images/logo/
frontend/public/images/home/
frontend/public/images/products/
```

Example:

```text
frontend/public/images/logo/my-logo.png
frontend/public/images/home/home-banner.jpg
frontend/public/images/products/paper-cups.webp
```

## 2. Change Image Paths

Open:

```text
frontend/src/data/siteImages.js
```

Change the paths:

```js
export const siteImages = {
  logo: 'frontend/public/images/logo/Kelvin Eco Products Logo.jpg',
  home: {
    heroPackaging: '/images/home/home-banner.jpg',
    factory: '/images/home/factory.jpg'
  },
  products: {
    paperCups: '/images/products/paper-cups.webp',
    paperContainers: '/images/products/paper-containers.webp',
    saladBowls: '/images/products/salad-bowls.webp',
    mealBoxes: '/images/products/meal-boxes.webp',
    teaFlasks: '/images/products/tea-flasks.webp',
    pizzaBoxes: '/images/products/pizza-boxes.webp',
    plasticLids: '/images/products/plastic-lids.webp',
    customPrinting: '/images/products/custom-printing.webp'
  }
};
```

## 3. Where These Images Show

- `logo`: navbar and footer logo
- `home.heroPackaging`: homepage hero image
- `home.factory`: homepage about/factory image
- `products.*`: homepage product cards, products page, and product detail page

## 4. Image Tag Usage

The website already uses normal image tags:
The website already uses normal image tags:

```jsx
<img src={siteImages.logo} alt="Kelvin Eco Products" />
<img src={product.image} alt={product.title} />
```

So you only need to upload the image and update the path.
