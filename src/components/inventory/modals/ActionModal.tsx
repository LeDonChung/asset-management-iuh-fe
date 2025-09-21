import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Asset, InventoryResultStatus } from '@/types/asset';
import { Camera, Upload, X, Video } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch } from '@/lib/store/hooks';
import { uploadInventoryImage } from '@/lib/store/slices/fileSlice';
import toast from 'react-hot-toast';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  actionType: 'LIQUIDATION' | 'REPAIR' | 'VIEW_RESULT' | null;
  submittedResult?: any;
  onConfirm: (data: ActionModalData) => void;
}

export interface ActionModalData {
  reason: string;
  images: string[]; // URLs of uploaded images
  status: InventoryResultStatus;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  asset,
  actionType,
  submittedResult,
  onConfirm
}) => {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    // Upload images in parallel to avoid duplicate state updates
    await uploadImages(files);
  };

  const uploadImages = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      
      // Upload all files in parallel
      const uploadPromises = files.map(file => 
        dispatch(uploadInventoryImage(file)).unwrap()
      );
      
      const results = await Promise.allSettled(uploadPromises);
      
      // Process results
      const successfulUploads: string[] = [];
      let successCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUploads.push(result.value.url);
          successCount++;
        } else {
          console.error(`Upload failed for file ${index}:`, result.reason);
        }
      });
      
      // Update state with all successful uploads at once
      if (successfulUploads.length > 0) {
        setUploadedImageUrls(prev => [...prev, ...successfulUploads]);
        toast.success(`Tải lên thành công ${successCount}/${files.length} hình ảnh`);
      }
      
      if (successCount < files.length) {
        toast.error(`Không thể tải lên ${files.length - successCount} hình ảnh`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Không thể tải lên hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file: File) => {
    await uploadImages([file]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob and create file
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
              type: 'image/jpeg'
            });
            setImages(prev => [...prev, file]);
            await uploadImages([file]);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      } else {
        console.error('Video not ready or context not available');
        alert('Camera chưa sẵn sàng. Vui lòng thử lại.');
      }
    }
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do');
      return;
    }

    setLoading(true);
    try {
      await onConfirm({
        reason,
        images: uploadedImageUrls,
        status: actionType === 'LIQUIDATION' 
          ? InventoryResultStatus.LIQUIDATION_PROPOSED 
          : InventoryResultStatus.NEEDS_REPAIR
      });
      
      // Reset form
      setReason('');
      setImages([]);
      setUploadedImageUrls([]);
      stopCamera(); // Stop camera if open
      onClose();
      toast.success(`${actionType === 'LIQUIDATION' ? 'Đề xuất thanh lý' : 'Đề xuất sửa chữa'} thành công`);
    } catch (error) {
      console.error('Error submitting action:', error);
      toast.error('Có lỗi xảy ra khi xử lý yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const title = actionType === 'VIEW_RESULT' 
    ? 'Kết quả kiểm kê' 
    : actionType === 'LIQUIDATION' 
      ? 'Đề xuất thanh lý' 
      : 'Đề xuất sửa chữa';
  
  const description = actionType === 'VIEW_RESULT'
    ? 'Kết quả kiểm kê đã hoàn thành cho tài sản này.'
    : actionType === 'LIQUIDATION' 
      ? 'Vui lòng cung cấp lý do và hình ảnh minh chứng cho việc đề xuất thanh lý tài sản này.'
      : 'Vui lòng cung cấp lý do và hình ảnh minh chứng cho việc đề xuất sửa chữa tài sản này.';

  // Don't render if asset is null
  if (!asset || !actionType) {
    return null;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <ModalHeader>
        <p className="text-sm text-gray-600">{description}</p>
      </ModalHeader>

      <ModalBody>
        {/* Asset Info */}
        <Alert>
          <AlertDescription>
            <div className="font-medium">Tài sản: {asset.name}</div>
            <div className="text-sm text-gray-600">
              Mã: {asset.ktCode}
            </div>
          </AlertDescription>
        </Alert>

        {actionType === 'VIEW_RESULT' ? (
          /* View Submitted Result */
          <div className="space-y-4">
            {/* Result Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Thông tin kiểm kê</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Số lượng hệ thống:</span>
                  <span className="ml-2 font-medium">{submittedResult?.systemQuantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Số lượng thực tế:</span>
                  <span className="ml-2 font-medium">{submittedResult?.countedQuantity || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="ml-2 font-medium">
                    {submittedResult?.status === 'MATCHED' ? 'Khớp' :
                     submittedResult?.status === 'MISSING' ? 'Thiếu' :
                     submittedResult?.status === 'EXCESS' ? 'Thừa' :
                     submittedResult?.status === 'BROKEN' ? 'Hư hỏng' :
                     submittedResult?.status === 'NEEDS_REPAIR' ? 'Cần sửa chữa' :
                     submittedResult?.status === 'LIQUIDATION_PROPOSED' ? 'Đề xuất thanh lý' :
                     submittedResult?.status || 'Không xác định'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Phương thức quét:</span>
                  <span className="ml-2 font-medium">
                    {submittedResult?.scanMethod === 'RFID' ? 'RFID' : 'Thủ công'}
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            {submittedResult?.note && (
              <div>
                <Label>Ghi chú</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {submittedResult.note}
                </div>
              </div>
            )}

            {/* Images */}
            {submittedResult?.imageUrls && Array.isArray(submittedResult.imageUrls) && submittedResult.imageUrls.length > 0 ? (
              <div>
                <Label>Hình ảnh minh chứng</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {submittedResult.imageUrls
                    .filter((url: string) => url && url.trim() !== '') // Filter out empty URLs
                    .map((url: string, index: number) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Minh chứng ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(url, '_blank')}
                        onError={(e) => {
                          console.error('Error loading image:', url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <Label>Hình ảnh minh chứng</Label>
                <div className="mt-2 p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                  Không có hình ảnh minh chứng
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <>
            {/* Reason */}
            <div>
              <Label htmlFor="reason">
                Lý do {actionType === 'LIQUIDATION' ? 'thanh lý' : 'sửa chữa'} *
              </Label>
              <Textarea
                id="reason"
                placeholder={`Nhập lý do ${actionType === 'LIQUIDATION' ? 'thanh lý' : 'sửa chữa'}...`}
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </>
        )}

        {/* Image Upload - Only show for edit mode */}
        {actionType !== 'VIEW_RESULT' && (
          <div>
            <Label>Hình ảnh minh chứng</Label>
          <div className="mt-2">
            {/* Upload Options */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                onClick={startCamera}
                disabled={showCamera}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Chụp ảnh
              </Button>
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Camera View */}
            {showCamera && (
              <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover rounded-lg bg-black"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch(console.error);
                      }
                    }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      className="bg-white text-black hover:bg-gray-100 shadow-lg"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Chụp
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="bg-white text-black hover:bg-gray-100 shadow-lg"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            {!showCamera && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Chọn hình ảnh từ thiết bị
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, GIF tối đa 10MB mỗi file
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Images */}
            {(images.length > 0 || uploadedImageUrls.length > 0) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={`file-${index}`} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <div className="text-white text-sm">Đang tải lên...</div>
                      </div>
                    )}
                  </div>
                ))}
                {uploadedImageUrls.map((url, index) => (
                  <div key={`url-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => removeImage(images.length + index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </ModalBody>

      <ModalFooter>
        {actionType === 'VIEW_RESULT' ? (
          <Button onClick={onClose}>
            Đóng
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!reason.trim() || loading}
              className={actionType === 'LIQUIDATION' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {loading ? 'Đang xử lý...' : (actionType === 'LIQUIDATION' ? 'Đề xuất thanh lý' : 'Đề xuất sửa chữa')}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};
