import { MediaType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  deleteFromCloudinary,
  getImageTransformations,
  replaceCloudinaryImage,
  uploadBufferToCloudinary
} from '../services/cloudinaryService.js';

const folders = {
  products: 'kelvin/products',
  blogs: 'kelvin/blogs',
  certificates: 'kelvin/certificates',
  banners: 'kelvin/banners',
  countries: 'kelvin/countries',
  about: 'kelvin/about',
  downloads: 'kelvin/downloads'
};

function withTransformations(asset) {
  return {
    ...asset,
    transformations: getImageTransformations(asset.publicId)
  };
}

async function uploadMany(files, folder) {
  if (!files?.length) {
    throw new AppError('At least one image is required.', 400);
  }

  if (files.length > 10) {
    throw new AppError('You can upload up to 10 images.', 400);
  }

  const uploaded = [];

  for (const file of files) {
    uploaded.push(await uploadBufferToCloudinary(file, folder));
  }

  return uploaded;
}

export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.body.productId,
      isDeleted: false
    }
  });

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  const uploaded = await uploadMany(req.files, folders.products);

  const images = await prisma.$transaction(
    uploaded.map((image) =>
      prisma.productImage.create({
        data: {
          url: image.url,
          publicId: image.publicId,
          productId: product.id
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    images: images.map(withTransformations)
  });
});

export const uploadBlogImage = asyncHandler(async (req, res) => {
  const blog = await prisma.blog.findUnique({
    where: { id: req.body.blogId }
  });

  if (!blog) {
    throw new AppError('Blog not found.', 404);
  }

  const uploaded = await uploadBufferToCloudinary(req.file, folders.blogs);
  const isThumbnail = req.body.imageType === 'thumbnail';

  if (isThumbnail && blog.thumbnailPublicId) {
    await deleteFromCloudinary(blog.thumbnailPublicId);
  }

  if (!isThumbnail && blog.coverImagePublicId) {
    await deleteFromCloudinary(blog.coverImagePublicId);
  }

  const updatedBlog = await prisma.blog.update({
    where: { id: blog.id },
    data: isThumbnail
      ? {
          thumbnail: uploaded.url,
          thumbnailPublicId: uploaded.publicId
        }
      : {
          coverImage: uploaded.url,
          coverImagePublicId: uploaded.publicId
        }
  });

  res.status(201).json({
    success: true,
    blog: updatedBlog,
    image: withTransformations(uploaded)
  });
});

export const uploadHeroBanners = asyncHandler(async (req, res) => {
  const uploaded = await uploadMany(req.files, folders.banners);

  const assets = await prisma.$transaction(
    uploaded.map((image, index) =>
      prisma.mediaAsset.create({
        data: {
          type: MediaType.HERO_BANNER,
          title: req.body.title || `Hero Banner ${index + 1}`,
          alt: req.body.alt,
          url: image.url,
          publicId: image.publicId,
          folder: folders.banners
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    assets: assets.map(withTransformations)
  });
});

export const uploadMediaAsset = asyncHandler(async (req, res) => {
  const folder =
    req.body.type === MediaType.ABOUT_IMAGE
      ? folders.about
      : req.body.type === MediaType.DOWNLOAD
        ? folders.downloads
        : folders.banners;

  const uploaded = await uploadBufferToCloudinary(req.file, folder);

  const asset = await prisma.mediaAsset.create({
    data: {
      type: req.body.type,
      title: req.body.title,
      alt: req.body.alt,
      url: uploaded.url,
      publicId: uploaded.publicId,
      folder
    }
  });

  res.status(201).json({
    success: true,
    asset: withTransformations(asset)
  });
});

export const uploadCountryFlag = asyncHandler(async (req, res) => {
  const country = await prisma.exportCountry.findUnique({
    where: { id: req.params.id }
  });

  if (!country) {
    throw new AppError('Country not found.', 404);
  }

  if (country.flagPublicId) {
    await deleteFromCloudinary(country.flagPublicId);
  }

  const uploaded = await uploadBufferToCloudinary(req.file, folders.countries);
  const updatedCountry = await prisma.exportCountry.update({
    where: { id: country.id },
    data: {
      flagUrl: uploaded.url,
      flagPublicId: uploaded.publicId
    }
  });

  res.status(201).json({
    success: true,
    country: updatedCountry,
    image: withTransformations(uploaded)
  });
});

export const uploadCertificateIcon = asyncHandler(async (req, res) => {
  const certification = await prisma.certification.findUnique({
    where: { id: req.params.id }
  });

  if (!certification) {
    throw new AppError('Certification not found.', 404);
  }

  if (certification.iconPublicId) {
    await deleteFromCloudinary(certification.iconPublicId);
  }

  const uploaded = await uploadBufferToCloudinary(req.file, folders.certificates);
  const updatedCertification = await prisma.certification.update({
    where: { id: certification.id },
    data: {
      icon: uploaded.url,
      iconPublicId: uploaded.publicId
    }
  });

  res.status(201).json({
    success: true,
    certification: updatedCertification,
    image: withTransformations(uploaded)
  });
});

export const deleteBlogImage = asyncHandler(async (req, res) => {
  const blog = await prisma.blog.findUnique({
    where: { id: req.params.id }
  });

  if (!blog) {
    throw new AppError('Blog not found.', 404);
  }

  const isThumbnail = req.params.imageType === 'thumbnail';
  const publicId = isThumbnail ? blog.thumbnailPublicId : blog.coverImagePublicId;

  await deleteFromCloudinary(publicId);

  const updatedBlog = await prisma.blog.update({
    where: { id: blog.id },
    data: isThumbnail
      ? {
          thumbnail: null,
          thumbnailPublicId: null
        }
      : {
          coverImage: null,
          coverImagePublicId: null
        }
  });

  res.status(200).json({
    success: true,
    blog: updatedBlog,
    message: 'Blog image deleted successfully.'
  });
});

export const deleteCountryFlag = asyncHandler(async (req, res) => {
  const country = await prisma.exportCountry.findUnique({
    where: { id: req.params.id }
  });

  if (!country) {
    throw new AppError('Country not found.', 404);
  }

  await deleteFromCloudinary(country.flagPublicId);

  const updatedCountry = await prisma.exportCountry.update({
    where: { id: country.id },
    data: {
      flagUrl: null,
      flagPublicId: null
    }
  });

  res.status(200).json({
    success: true,
    country: updatedCountry,
    message: 'Country flag deleted successfully.'
  });
});

export const deleteCertificateIcon = asyncHandler(async (req, res) => {
  const certification = await prisma.certification.findUnique({
    where: { id: req.params.id }
  });

  if (!certification) {
    throw new AppError('Certification not found.', 404);
  }

  await deleteFromCloudinary(certification.iconPublicId);

  const updatedCertification = await prisma.certification.update({
    where: { id: certification.id },
    data: {
      icon: null,
      iconPublicId: null
    }
  });

  res.status(200).json({
    success: true,
    certification: updatedCertification,
    message: 'Certification icon deleted successfully.'
  });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const image = await prisma.productImage.findUnique({
    where: { id: req.params.id }
  });

  if (!image) {
    throw new AppError('Product image not found.', 404);
  }

  await deleteFromCloudinary(image.publicId);
  await prisma.productImage.delete({
    where: { id: image.id }
  });

  res.status(200).json({
    success: true,
    message: 'Product image deleted successfully.'
  });
});

export const replaceProductImage = asyncHandler(async (req, res) => {
  const image = await prisma.productImage.findUnique({
    where: { id: req.params.id }
  });

  if (!image) {
    throw new AppError('Product image not found.', 404);
  }

  const uploaded = await replaceCloudinaryImage(image.publicId, req.file, folders.products);

  const updatedImage = await prisma.productImage.update({
    where: { id: image.id },
    data: {
      url: uploaded.url,
      publicId: uploaded.publicId
    }
  });

  res.status(200).json({
    success: true,
    image: withTransformations(updatedImage)
  });
});

export const deleteMediaAsset = asyncHandler(async (req, res) => {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: req.params.id }
  });

  if (!asset) {
    throw new AppError('Media asset not found.', 404);
  }

  await deleteFromCloudinary(asset.publicId);
  await prisma.mediaAsset.delete({
    where: { id: asset.id }
  });

  res.status(200).json({
    success: true,
    message: 'Media asset deleted successfully.'
  });
});

export const replaceMediaAsset = asyncHandler(async (req, res) => {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: req.params.id }
  });

  if (!asset) {
    throw new AppError('Media asset not found.', 404);
  }

  const uploaded = await replaceCloudinaryImage(asset.publicId, req.file, asset.folder);

  const updatedAsset = await prisma.mediaAsset.update({
    where: { id: asset.id },
    data: {
      url: uploaded.url,
      publicId: uploaded.publicId
    }
  });

  res.status(200).json({
    success: true,
    asset: withTransformations(updatedAsset)
  });
});
