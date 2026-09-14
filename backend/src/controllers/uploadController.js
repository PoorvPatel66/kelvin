import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

export const uploadSingle = asyncHandler(async (req, res) => {
  const uploaded = await uploadBufferToCloudinary(req.file, req.body.folder || 'kelvin/uploads');

  res.status(201).json({
    success: true,
    file: uploaded
  });
});
